const { Strategy, ExtractJwt } = require('passport-jwt');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
};

module.exports = (passport) => {
  passport.use(new Strategy(opts, async (jwt_payload, done) => {
    try {
      const user = await prisma.account.findUnique({
        where: { uid: jwt_payload.uid },
        select: {
          uid: true,
          email: true,
          username: true,
          role: true,
          refreshToken: true,
          isVerified: true,
          lastLogin: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      
      if (user) {
        return done(null, user);
      }
      return done(null, false);
    } catch (err) {
      return done(err, false);
    }
  }));
};