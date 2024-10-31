import { useEffect, useState, useCallback } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { Alert } from "antd";

import Login from "./pages/auth/login";
import Home from "./pages/home";
import Dashboard from "./pages/dashboard";
import Setting from "./pages/setting";
import Notfound from "./pages/notfound";
import RootLayout from "./components/RootLayout";
import Users from "./pages/users";
import Reports from "./pages/reports";
import AddJson from "./pages/dev/AddJson";
import Verifyemail from "./pages/auth/verify-email";
import Healthcheck from "./pages/healthcheck";
import api from "./lib/api";

const App = () => {
  const [profile, setProfile] = useState(null);
  const [isVerified, setIsVerified] = useState(false);

  const isLoggedIn = localStorage.getItem("isLoggedIn");

  const checkToken = useCallback(async () => {
    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");

    if (!accessToken || !refreshToken) {
      clearLocalStorage();
      return;
    }

    try {
      const response = await api.get("/auth/@me");
      setProfile(response.data.result);
      setIsVerified(response.data.result.isVerified);
      localStorage.setItem('username', response.data.result.username);
      localStorage.setItem('email', response.data.result.email);
    } catch (error) {
      console.error("Error:", error.response?.data || error);
      clearLocalStorage();
    }
  }, []);

  const clearLocalStorage = () => {
    localStorage.removeItem("username");
    localStorage.removeItem("email");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  };

  useEffect(() => {
    checkToken();
  }, [checkToken]);

  return (
    <BrowserRouter>
      <RootLayout profile={profile}>
        {isLoggedIn && isVerified === false && (
          <Alert message="คุณยังไม่ได้ยืนยันอีเมล์ กรุณายืนยันอีเมล์ก่อนใช้งานระบบ" type="warning" showIcon closable />
        )}
        <Routes>
          <Route path="/" element={!isLoggedIn ? <Login /> : <Home />} />
          <Route path="/dashboard" element={!isLoggedIn ? <Login /> : <Dashboard />} />
          <Route path="/setting" element={!isLoggedIn ? <Login /> : <Setting />} />
          <Route path="/users" element={!isLoggedIn ? <Login /> : <Users />} />
          <Route path="/reports" element={!isLoggedIn ? <Login /> : <Reports />} />
          <Route path="/add/json" element={!isLoggedIn ? <Login /> : <AddJson />} />
          <Route path="/auth/verify-email" element={<Verifyemail />} />
          <Route path="/auth/login" element={<Login />} />
          <Route path="/healthcheck" element={<Healthcheck />} />
          <Route path="*" element={<Notfound />} />
        </Routes>
      </RootLayout>
    </BrowserRouter>
  );
};

export default App;