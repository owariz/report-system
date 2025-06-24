const { formatDate } = require('../../core/utils/formatDate');
const bcrypt = require('bcryptjs');
const { createLog } = require('../../core/utils/log');

// User Service (business logic)
class UserService {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async getDashboard() {
    const { students, threeDaysAgo } = await this.userRepository.getDashboardData();
    const newStudentsCount = students.filter(student => new Date(student.createdAt) >= threeDaysAgo).length;
    const totalStudentsCount = students.length;
    const validScores = students.flatMap(student =>
      student.scores.map(score => score.finalScore).filter(score => score >= 0 && score <= 100)
    );
    const totalScore = validScores.reduce((sum, score) => sum + score, 0);
    const averageScore = validScores.length > 0 ? totalScore / validScores.length : null;
    const maxScore = validScores.length > 0 ? Math.max(...validScores) : null;
    const scoreData = students.flatMap(student =>
      student.scores.map(score => ({ date: score.createdAt, finalScore: score.finalScore }))
    );
    const groupedScores = scoreData.reduce((acc, { date, finalScore }) => {
      const dateString = date.toISOString().split('T')[0];
      if (!acc[dateString]) acc[dateString] = [];
      acc[dateString].push(finalScore);
      return acc;
    }, {});
    const dates = Object.keys(groupedScores).sort();
    const averageScores = dates.map(date => {
      const scores = groupedScores[date];
      const total = scores.reduce((sum, score) => sum + score, 0);
      return total / scores.length;
    });
    const maxScores = dates.map(date => Math.max(...groupedScores[date]));
    const scoreDistribution = [0, 0, 0, 0, 0];
    validScores.forEach(score => {
      if (score <= 20) scoreDistribution[0]++;
      else if (score <= 40) scoreDistribution[1]++;
      else if (score <= 60) scoreDistribution[2]++;
      else if (score <= 80) scoreDistribution[3]++;
      else scoreDistribution[4]++;
    });
    const studentsWithMostDeductedPoints = students
      .map(student => ({
        sid: student.sid,
        name: `${student.prefix} ${student.firstName} ${student.lastName}`,
        deductedPoints: student.scores.reduce((sum, score) => sum + (score.deductedScore || 0), 0),
      }))
      .sort((a, b) => b.deductedPoints - a.deductedPoints)
      .slice(0, 5);
    return {
      averageScore,
      maxScore,
      newStudentsCount,
      totalStudentsCount,
      dates,
      averageScores,
      maxScores,
      scoreDistribution,
      studentsWithMostDeductedPoints,
    };
  }

  async getReport() {
    const scores = await this.userRepository.getScoresWithStudent();
    if (scores.length === 0) return { reportData: [], totalReports: 0 };
    const logData = await Promise.all(
      scores.map(async (score) => {
        const log = await this.userRepository.getLogByStudentId(score.studentId);
        return { scoreId: score.id, log };
      })
    );
    const reportData = scores.map((score, index) => {
      const log = logData.find((logItem) => logItem.scoreId === score.id)?.log;
      return {
        key: index + 1,
        username: `${score.student.prefix} ${score.student.firstName} ${score.student.lastName}`,
        date: formatDate(score.createdAt),
        score: score.totalScore,
        deductedScore: score.deductedScore || 0,
        finalScore: score.finalScore,
        reportTopic: score.reportTopic || 'ไม่มีหัวข้อการรายงาน',
        logDetails: log ? { username: log.username, email: log.email } : null,
      };
    });
    return { reportData, totalReports: scores.length };
  }

  async addStudents(studentsData) {
    return this.userRepository.addStudents(studentsData);
  }

  async getLogsByUser(email, paginationOptions) {
    return this.userRepository.findLogsByEmail(email, paginationOptions);
  }

  async getAllUsers() {
    return this.userRepository.findAllUsers();
  }

  async deleteUser(id, actor) {
    // Rule 1: Prevent self-deletion
    if (actor.id === id) {
      throw new Error("You cannot delete your own account.");
    }

    // Fetch the user to be deleted to check their role
    const userToDelete = await this.userRepository.findUserById(id);
    if (!userToDelete) {
      throw new Error("User not found.");
    }

    // Rule 2: Prevent deleting SUPERADMIN accounts
    if (userToDelete.role === 'SUPERADMIN') {
      throw new Error("Cannot delete a SUPERADMIN account.");
    }

    const deletedUser = await this.userRepository.deleteUserById(id);
    await createLog({
      email: actor.email,
      username: actor.username,
      action: 'User Deletion',
      details: `User '${actor.username}' deleted user '${deletedUser.username}' (ID: ${id}).`,
    });
    return deletedUser;
  }

  async updateUser(id, userData, actor) {
    // 1. Fetch user state before update
    const userBeforeUpdate = await this.userRepository.findUserById(id);
    if (!userBeforeUpdate) {
      throw new Error("User to be updated not found.");
    }

    // 2. Prepare and hash password if provided
    let passwordChanged = false;
    if (userData.password && userData.password.length > 0) {
      const salt = await bcrypt.genSalt(12);
      userData.password = await bcrypt.hash(userData.password, salt);
      passwordChanged = true;
    } else {
      delete userData.password;
    }

    // 3. Perform the update
    const updatedUser = await this.userRepository.updateUserById(id, userData);

    // 4. Compare and generate detailed log
    const changes = [];
    for (const key in userData) {
      if (key === 'password' && passwordChanged) {
        changes.push('password was changed');
      } else if (key !== 'password' && userBeforeUpdate[key] !== updatedUser[key]) {
        changes.push(`${key} ('${userBeforeUpdate[key]}' -> '${updatedUser[key]}')`);
      }
    }

    if (changes.length > 0) {
      const details = `User '${actor.username}' updated profile for '${updatedUser.username}'. Changes: ${changes.join(', ')}.`;
      await createLog({
        email: actor.email,
        username: actor.username,
        action: 'User Update',
        details: details,
      });
    }

    return updatedUser;
  }

  async createUser(userData, actor) {
    // Hash the password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(userData.password, salt);

    // Create user with hashed password
    const newUser = await this.userRepository.createUser({
      ...userData,
      password: hashedPassword,
    });
    
    // Log the creation action
    const details = `User '${actor.username}' created a new user: '${newUser.username}' (Role: ${newUser.role}).`;
    await createLog({
      email: actor.email,
      username: actor.username,
      action: 'User Creation',
      details: details,
    });

    return newUser;
  }

  async findAllUsers() {
    return this.userRepository.findAllUsers();
  }
}

module.exports = UserService; 