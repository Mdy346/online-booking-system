import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import LoginPage from "./pages/Login";
import RegisterPage from "./pages/Register";
import ServiceListPage from "./pages/ServiceList";
import ServiceDetailPage from "./pages/ServiceDetail";
import MyAppointmentsPage from "./pages/MyAppointments";
import MerchantLayout from "./pages/Merchant";
import MerchantDashboard from "./pages/Merchant/Dashboard";
import MerchantServices from "./pages/Merchant/Services";
import MerchantSchedule from "./pages/Merchant/Schedule";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Navigate to="/services" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/services" element={<ServiceListPage />} />
            <Route path="/services/:id" element={<ServiceDetailPage />} />
            <Route path="/my-appointments" element={<MyAppointmentsPage />} />
            <Route path="/merchant" element={<MerchantLayout />}>
              <Route index element={<MerchantDashboard />} />
              <Route path="services" element={<MerchantServices />} />
              <Route path="schedule" element={<MerchantSchedule />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
