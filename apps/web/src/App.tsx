import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth.js";

import { PublicLayout } from "./layouts/PublicLayout.js";
import { DashboardLayout } from "./layouts/DashboardLayout.js";
import { AdminLayout } from "./layouts/AdminLayout.js";
import { InviteLayout } from "./layouts/InviteLayout.js";

import { LandingPage } from "./pages/landing/LandingPage.js";
import { LoginPage } from "./pages/auth/LoginPage.js";
import { RegisterPage } from "./pages/auth/RegisterPage.js";
import { ForgotPasswordPage } from "./pages/auth/ForgotPasswordPage.js";
import { ResetPasswordPage } from "./pages/auth/ResetPasswordPage.js";
import { VerifyEmailPage } from "./pages/auth/VerifyEmailPage.js";
import { DashboardPage } from "./pages/dashboard/DashboardPage.js";
import { ServicePickerPage } from "./pages/create/ServicePickerPage.js";
import { CreateServicePage } from "./pages/create/CreateServicePage.js";
import { InvitePage } from "./pages/invite/InvitePage.js";
import { AdminPage } from "./pages/admin/AdminPage.js";
import { ServicesPage as AdminServicesPage } from "./pages/admin/ServicesPage.js";

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Standalone: the landing page has its own dark header/footer, not PublicLayout's. */}
          <Route path="/" element={<LandingPage />} />

          <Route element={<PublicLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
            <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
            <Route path="/create" element={<ServicePickerPage />} />
            <Route path="/create/:serviceKey" element={<CreateServicePage />} />
          </Route>

          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardPage />} />
            {/* TODO: /dashboard/projects, /orders, /payments, /files, /profile, /settings */}
          </Route>

          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminPage />} />
            <Route path="services" element={<AdminServicesPage />} />
            {/* TODO: the rest of the admin sidebar items — see README § Admin */}
          </Route>

          <Route element={<InviteLayout />}>
            <Route path="/invite/:slug" element={<InvitePage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
