import { createContext, useContext, useState } from "react";
import { login } from "../services/authService";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem("token");
  });

  async function loginUser(email, password) {
    const data = await login(email, password);

    localStorage.setItem("token", data.token);

    localStorage.setItem(
      "user",
      JSON.stringify({
        email: data.email,
        role: data.role,
      })
    );

    setToken(data.token);

    setUser({
      email: data.email,
      role: data.role,
    });

    return data;
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loginUser,
        logout,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}