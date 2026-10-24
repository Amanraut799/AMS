import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api",
});

export default api;

export async function getMyProfile(token) {
  const response = await api.get("/users/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

export async function getWorkAreas(token) {
  const response = await api.get("/work-areas", { headers: { Authorization: `Bearer ${token}` } });
  return response.data;
}

export async function createWorkArea(token, area) {
  const response = await api.post("/work-areas", area, { headers: { Authorization: `Bearer ${token}` } });
  return response.data;
}

export async function updateWorkArea(token, id, area) {
  const response = await api.put(`/work-areas/${id}`, area, { headers: { Authorization: `Bearer ${token}` } });
  return response.data;
}

export async function deactivateWorkArea(token, id) {
  await api.delete(`/work-areas/${id}`, { headers: { Authorization: `Bearer ${token}` } });
}

export async function getAttendancePolicy(token) {
  const response = await api.get("/attendance-policy", { headers: { Authorization: `Bearer ${token}` } });
  return response.data;
}

export async function updateAttendancePolicy(token, policy) {
  const response = await api.put("/attendance-policy", policy, { headers: { Authorization: `Bearer ${token}` } });
  return response.data;
}

export async function getHolidays(token) {
  const response = await api.get("/holidays", { headers: { Authorization: `Bearer ${token}` } });
  return response.data;
}

export async function createHoliday(token, holiday) {
  const response = await api.post("/holidays", holiday, { headers: { Authorization: `Bearer ${token}` } });
  return response.data;
}

export async function updateHoliday(token, id, holiday) {
  const response = await api.put(`/holidays/${id}`, holiday, { headers: { Authorization: `Bearer ${token}` } });
  return response.data;
}

export async function deleteHoliday(token, id) {
  await api.delete(`/holidays/${id}`, { headers: { Authorization: `Bearer ${token}` } });
}

export async function getMyLeaves(token) {
  const response = await api.get("/leaves/my", { headers: { Authorization: `Bearer ${token}` } });
  return response.data;
}

export async function requestLeave(token, leave) {
  const response = await api.post("/leaves", leave, { headers: { Authorization: `Bearer ${token}` } });
  return response.data;
}

export async function getAllLeaves(token) {
  const response = await api.get("/leaves/admin", { headers: { Authorization: `Bearer ${token}` } });
  return response.data;
}

export async function reviewLeave(token, id, status, reviewerNote = "") {
  const response = await api.put(`/leaves/admin/${id}`, { status, reviewerNote }, { headers: { Authorization: `Bearer ${token}` } });
  return response.data;
}

// Employee APIs

export async function getEmployees(token) {
  const response = await api.get("/employees", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}

export async function createEmployee(token, employee) {
  const response = await api.post("/employees", employee, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}

export async function updateEmployee(token, id, employee) {
  const response = await api.put(`/employees/${id}`, employee, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}

export async function deleteEmployee(token, id) {
  const response = await api.delete(`/employees/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}

export async function syncEmployeeLoginAccounts(token) {
  const response = await api.post("/employees/login-accounts/sync", {}, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}

export async function getAdminDashboard(token) {
  const response = await api.get("/dashboard/admin", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}

export async function getTodayAttendance(token) {
  const response = await api.get("/dashboard/admin/today", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}

export async function getMonthlyAttendance(token, year, month) {
  const response = await api.get(
    `/dashboard/admin/monthly?year=${year}&month=${month}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
}

export async function updateAttendanceStatus(token, employeeId, date, status) {
  const response = await api.put(
    `/attendance/admin/${employeeId}/${date}`,
    { status },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
}
