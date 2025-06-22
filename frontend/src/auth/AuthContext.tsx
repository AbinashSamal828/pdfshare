import { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setUser(jwtDecode(token));
    }
  }, []);
  const login = (token: string) => {
    localStorage.setItem("token", token);
    setUser(jwtDecode(token));
  };
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
