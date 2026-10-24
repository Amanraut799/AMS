import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/auth/Login";
import Dashboard from "./pages/dashboard/Dashboard";
import ProtectedRoute from "./routes/ProtectedRoute";
import { useAuth } from "./context/AuthContext";
import Employees from "./pages/employees/Employees";
import AddEmployee from "./pages/employees/AddEmployee";
import EditEmployee from "./pages/employees/EditEmployee";
import Attendance from "./pages/attendance/Attendance";
import EmployeeDashboard from "./pages/dashboard/EmployeeDashboard";
import AttendanceHistory from "./pages/attendance/AttendanceHistory";
import AdminAttendance from "./pages/attendance/AdminAttendance";
import MonthlyAttendance from "./pages/attendance/MonthlyAttendance";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import UserProfile from "./pages/profile/UserProfile";
import WorkAreas from "./pages/admin/WorkAreas";
import AttendanceSchedule from "./pages/admin/AttendanceSchedule";
import Leaves from "./pages/leaves/Leaves";

function LoginRoute() {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated) {
    if (user?.role === "ADMIN") {
      return <Navigate to="/admin" replace />;
    }

    return <Navigate to="/employee" replace />;
  }

  return <Login />;
}

function App() {
  const { isAuthenticated, user } = useAuth();
  const homePath = isAuthenticated
    ? user?.role === "ADMIN"
      ? "/admin"
      : "/employee"
    : "/login";

  return (
    <BrowserRouter>
      <Routes>

        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />

        <Route
          path="/login"
          element={<LoginRoute />}
        />

        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRole="ADMIN">
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/attendance"
          element={
            <ProtectedRoute allowedRole="ADMIN">
              <AdminAttendance />
            </ProtectedRoute>
          }
        />

        <Route path="/admin/work-areas" element={<ProtectedRoute allowedRole="ADMIN"><WorkAreas /></ProtectedRoute>} />
        <Route path="/admin/schedule" element={<ProtectedRoute allowedRole="ADMIN"><AttendanceSchedule /></ProtectedRoute>} />
        <Route path="/leaves" element={<ProtectedRoute><Leaves /></ProtectedRoute>} />

        <Route
          path="/admin/attendance/monthly"
          element={
            <ProtectedRoute allowedRole="ADMIN">
              <MonthlyAttendance />
            </ProtectedRoute>
          }
        />

        <Route
          path="/employees"
          element={
            <ProtectedRoute allowedRole="ADMIN">
              <Employees />
            </ProtectedRoute>
          }
        />

        <Route
          path="/employee"
          element={
            <ProtectedRoute allowedRole="EMPLOYEE">
              <EmployeeDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/employees/add"
          element={
            <ProtectedRoute allowedRole="ADMIN">
              <AddEmployee />
            </ProtectedRoute>
          }
        />

        <Route
        path="/employees/edit/:id"
        element={
          <ProtectedRoute allowedRole="ADMIN">
            <EditEmployee />
          </ProtectedRoute>
        }
        />

        <Route
          path="/attendance"
          element={
            <ProtectedRoute allowedRole="ADMIN">
              <Attendance />
            </ProtectedRoute>
          }
        />

        <Route
          path="/attendance/history"
          element={
            <ProtectedRoute allowedRole="EMPLOYEE">
              <AttendanceHistory />
            </ProtectedRoute>
          }
        />

        <Route
          path="*"
          element={<Navigate to={homePath} replace />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
