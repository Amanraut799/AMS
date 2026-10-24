import api from "./api";

export function getCurrentLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("This device or browser does not support location."));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => resolve({
        latitude: coords.latitude,
        longitude: coords.longitude,
        accuracyMeters: coords.accuracy,
      }),
      (error) => reject(error),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
    );
  });
}

export async function markAttendance(token, location) {
  const response = await api.post(
    "/attendance/my-attendance",
    location,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
}

export async function getMyTodayAttendance(token) {
  const response = await api.get(
    "/attendance/my-attendance/today",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      validateStatus: (status) =>
        status === 200 || status === 204,
    }
  );

  return response.status === 204
    ? null
    : response.data;
}

export async function checkOut(token, location) {
  const response = await api.post(
    "/attendance/my-attendance/check-out",
    location,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
}

export async function getMyAttendanceHistory(token) {
  const response = await api.get(
    "/attendance/my-attendance/history",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
}

export async function getAllAttendance(token) {
  const response = await api.get(
    "/attendance/admin",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
}
