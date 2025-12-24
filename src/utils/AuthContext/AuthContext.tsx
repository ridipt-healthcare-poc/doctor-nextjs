'use client'

import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

interface User {
  id: string;
  name: string;
  email: string;
  // Add other user properties as needed
}

interface AuthContextType {
  loading: boolean;
  error: string | null;
  user: User | null;
  login: (loginData: { email: string; password: string }) => Promise<any>;
  signup: (signupPayload: any) => Promise<any>;
  logout: (navigate?: (path: string) => void) => Promise<void>;
  fetchUserProfile: () => Promise<any>;
  getDoctorProfile: () => Promise<any>;
  updateProfile: (profileData: any) => Promise<any>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const getDoctorProfile = async () => {
  const res = await axios.get(
    "http://localhost:8080/api/doctor-auth/profile"
  );
  return res.data.doctor;
};

// New API: Update doctor profile
export const updateDoctorProfile = async (profileData: any) => {
  const res = await axios.put(
    "http://localhost:8080/api/doctors/my-profile",
    profileData,
    {
      headers: { "Content-Type": "application/json" },
    }
  );
  return res.data.data; // Return the data property which contains the updated doctor
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  // Load token on mount
  useEffect(() => {
    const token = localStorage.getItem('doctor_token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, []);

  const signup = async (signupPayload: any) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(
        "http://localhost:8080/api/doctor/auth/register",
        signupPayload,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      setLoading(false);
      return res.data;
    } catch (err: any) {
      setError(err.response?.data?.message || "Signup failed");
      setLoading(false);
      throw err;
    }
  };

  const login = async (loginData: { email: string; password: string }) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(
        "http://localhost:8080/api/doctor-auth/login",
        loginData,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      setLoading(false);

      // Store token
      localStorage.setItem('doctor_token', res.data.token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;

      await fetchUserProfile();
      return res.data;
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed");
      setLoading(false);
      throw err;
    }
  };

  const fetchUserProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const profileData = await getDoctorProfile();
      setUser(profileData);
      setLoading(false);
      return profileData;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch profile");
      setLoading(false);
      throw err;
    }
  };

  // Add updateProfile method
  const updateProfile = async (profileData: any) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await updateDoctorProfile(profileData);
      setUser(updated);
      setLoading(false);
      return updated;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update profile");
      setLoading(false);
      throw err;
    }
  };

  const logout = async (navigate?: (path: string) => void) => {
    setLoading(true);
    setError(null);
    try {
      await axios.post(
        "http://localhost:8080/api/doctor/auth/logout",
        {},
        { withCredentials: true }
      );
      setUser(null);
      localStorage.removeItem('doctor_token');
      delete axios.defaults.headers.common['Authorization'];
      setLoading(false);
      if (navigate) {
        navigate("/login");
      }
    } catch (err) {
      setUser(null);
      localStorage.removeItem('doctor_token');
      delete axios.defaults.headers.common['Authorization'];
      setLoading(false);
      if (navigate) {
        navigate("/login");
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        loading,
        error,
        user,
        login,
        signup,
        logout,
        fetchUserProfile,
        getDoctorProfile,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};