import { BrowserRouter, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import AdminDashboard from "./pages/AdminDashboard";
import AdminRegister from "./pages/AdminRegister";
import Booking from "./pages/Booking";
import BookingSuccess from "./pages/BookingSuccess";
import CustomerDashboard from "./pages/CustomerDashboard";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Notifications from "./pages/Notifications";
import Register from "./pages/Register";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";

function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <div className="site-frame">
          <Navbar />

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/admin-register" element={<AdminRegister />} />
            <Route path="/booking" element={<Booking />} />
            <Route path="/customer-dashboard" element={<CustomerDashboard />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/register" element={<Register />} />
            <Route path="/booking-success" element={<BookingSuccess />} />
            <Route path="/superadmin" element={<SuperAdminDashboard />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
