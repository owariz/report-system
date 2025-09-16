import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import LoginPage from "./features/auth/LoginPage";
import DashboardPage from "./features/dashboard/DashboardPage";
import SettingPage from "./features/setting/SettingPage";
import NotFoundPage from "./features/notfound/NotFoundPage";
import RootLayout from "./components/layout/RootLayout";
import UserPage from "./features/user/UserPage";
import ReportPage from "./features/report/ReportPage";
import SearchAndReportPage from "./features/report/SearchAndReportPage";
import AddStudentPage from "./features/student/AddStudentPage";
import AddJson from "./features/dev/AddJson";
import VerifyEmailPage from "./features/auth/VerifyEmailPage";
import HealthCheckPage from "./features/healthcheck/HealthCheckPage";
import PrivateRoute from "./components/auth/PrivateRoute";
import MaintenancePage from "./features/maintenance/MaintenancePage";

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <RootLayout>
          <Routes>
            {/* Public Routes */}
            <Route path="/auth/login" element={<LoginPage />} />
            <Route path="/auth/verify-email" element={<VerifyEmailPage />} />
            <Route path="/healthcheck" element={<HealthCheckPage />} />
            <Route path="/maintenance" element={<MaintenancePage />} />

            {/* Private Routes */}
            <Route path="/" element={<PrivateRoute />}>
              <Route index element={<SearchAndReportPage />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="reports" element={<ReportPage />} />
              <Route path="setting" element={<SettingPage />} />
              <Route path="users" element={<UserPage />} />
              <Route path="admin/add-student" element={<AddStudentPage />} />
              <Route path="add/json" element={<AddJson />} />
            </Route>
            
            {/* Not Found Route */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </RootLayout>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;