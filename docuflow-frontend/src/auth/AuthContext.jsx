import { createContext, useContext, useState } from "react";
import api from "../api/axiosConfig";
import axios from "axios";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = async (username, password) => {
    const authHeader = "Basic " + btoa(`${username}:${password}`);
    sessionStorage.setItem("authHeader", authHeader);
    try {
      
   const auth=axios.get("http://localhost:8080/api/auth/login");
      setUser({auth.username(), role: auth.getrole() }); 
      return true;
    } catch {
      sessionStorage.removeItem("authHeader");
      return false;
    }
  };

  const logout = () => {
    sessionStorage.removeItem("authHeader");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
