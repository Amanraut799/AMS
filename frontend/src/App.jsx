import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./routes/ProtectedRoute";
import { useAuth } from "./context/AuthContext";

const Login = lazy(() => import("./pages/auth/Login"));
const Dashboard = lazy(() => import("./pages/dashboard/Dashboard"));
const Employees = lazy(() => import("./pages/employees/Employees"));
const AddEmployee = lazy(() => import("./pages/employees/AddEmployee"));
const EditEmployee = lazy(() => import("./pages/employees/EditEmployee"));
const Attendance = lazy(() => import("./pages/attendance/Attendance"));
const EmployeeDashboard = lazy(() => import("./pages/dashboard/EmployeeDashboard"));
const AttendanceHistory = lazy(() => import("./pages/attendance/AttendanceHistory"));
const AdminAttendance = lazy(() => import("./pages/attendance/AdminAttendance"));
const MonthlyAttendance = lazy(() => import("./pages/attendance/MonthlyAttendance"));
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/auth/ResetPassword"));
const UserProfile = lazy(() => import("./pages/profile/UserProfile"));
const WorkAreas = lazy(() => import("./pages/admin/WorkAreas"));
const AttendanceSchedule = lazy(() => import("./pages/admin/AttendanceSchedule"));
const Leaves = lazy(() => import("./pages/leaves/Leaves"));

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
      <Suspense fallback={<div role="status" style={{ padding: 24, color: "#526174" }}>Loading page…</div>}>
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
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
