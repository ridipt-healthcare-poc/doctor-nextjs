'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import api from '../utils/api';

interface User {
    _id: string;
    name: string;  // Backend uses 'name', not 'fullName'
    email: string;
    phone?: string;
    mobile?: string;
    gender?: string;
    dateOfBirth?: string;
    facilityId?: any;
    locationId?: any;
    // Doctor-specific properties
    specialization?: string;
    department?: string;
    durationMinutes?: number;
    operatingHours?: {
        [day: string]: {
            open: string;
            close: string;
            slotDuration: string;
        };
    };
    consultationFees?: {
        onsite?: number;
        voiceCall?: number;
        videoCall?: number;
        homeVisit?: number;
    };
}

interface SignupData {
    name: string;
    email: string;
    password: string;
    phone: string;
    mobile?: string;
    gender?: string;
    dateOfBirth?: string;
}

interface LoginData {
    email: string;
    password: string;
}

interface AuthContextType {
    loading: boolean;
    error: string | null;
    user: User | null;
    login: (loginData: LoginData) => Promise<any>;
    signup: (signupData: SignupData) => Promise<any>;
    logout: (navigate?: (path: string) => void) => Promise<void>;
    fetchUserProfile: () => Promise<User>;
    updateProfile: (profileData: Partial<User>) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const getDoctorProfile = async (): Promise<User> => {
    const res = await api.get('/api/doctor-auth/profile');
    return res.data.data;
};

export const updateDoctorProfile = async (profileData: Partial<User>) => {
    const res = await api.put('/api/doctor-auth/profile', profileData);
    return res.data.data;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<User | null>(null);

    const signup = async (signupPayload: SignupData) => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.post('/api/doctor-auth/register', signupPayload);
            setLoading(false);
            return res.data;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Signup failed');
            setLoading(false);
            throw err;
        }
    };

    const login = async (loginData: LoginData) => {
        setLoading(true);
        setError(null);
        try {
            console.log('🔐 Attempting login...');
            const res = await api.post('/api/doctor-auth/login', loginData);
            console.log('✅ Login response:', res.data);

            // Store token in localStorage
            if (res.data.token) {
                console.log('💾 Storing token in localStorage...');
                localStorage.setItem('doctorToken', res.data.token);
                const stored = localStorage.getItem('doctorToken');
                console.log('✅ Token stored successfully. Verification:', stored ? 'Token exists' : 'FAILED TO STORE');
            } else {
                console.error('❌ No token in response');
            }

            // Set user from login response immediately
            if (res.data.doctor) {
                console.log('👤 Setting user from login response');
                setUser(res.data.doctor);
            }

            // Try to fetch fresh profile, but don't fail if it errors
            try {
                console.log('👤 Fetching fresh user profile...');
                await fetchUserProfile();
                console.log('✅ Profile fetched successfully');
            } catch (profileErr) {
                console.warn('⚠️ Profile fetch failed, using login response data:', profileErr);
                // User is already set from login response, so we can continue
            }

            console.log('✅ Login complete');
            setLoading(false);
            return res.data;
        } catch (err: any) {
            console.error('❌ Login error:', err.response?.data || err.message);
            setError(err.response?.data?.message || 'Login failed');
            setLoading(false);
            throw err;
        }
    };

    const fetchUserProfile = async (): Promise<User> => {
        setLoading(true);
        setError(null);
        try {
            console.log('📡 Fetching profile from API...');
            const profileData = await getDoctorProfile();
            console.log('✅ Profile data received:', profileData);
            setUser(profileData);
            setLoading(false);
            return profileData;
        } catch (err: any) {
            console.error('❌ Profile fetch error:', err.response?.data || err.message);
            setError(err.response?.data?.message || 'Failed to fetch profile');
            setLoading(false);
            throw err;
        }
    };

    const updateProfile = async (profileData: Partial<User>) => {
        setLoading(true);
        setError(null);
        try {
            const updated = await updateDoctorProfile(profileData);
            setUser(updated);
            setLoading(false);
            return updated;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to update profile');
            setLoading(false);
            throw err;
        }
    };

    const logout = async (navigate?: (path: string) => void) => {
        setLoading(true);
        setError(null);
        try {
            await api.post('/api/doctor-auth/logout', {});
            // Clear token from localStorage
            localStorage.removeItem('doctorToken');
            setUser(null);
            setLoading(false);
            if (navigate) {
                navigate('/login');
            }
        } catch (err: any) {
            // Clear token even if logout request fails
            localStorage.removeItem('doctorToken');
            setUser(null);
            setLoading(false);
            if (navigate) {
                navigate('/login');
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
                updateProfile,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
