import api from '../utils/api';

export interface Patient {
    _id: string;
    fullName: string;
    email?: string;
    mobile: string;
    dateOfBirth?: string;
    gender?: string;
    address?: any;
    medicalHistory?: string;
    allergies?: string[];
    isActive: boolean;
    // Multi-facility fields
    currentFacility?: {
        facilityId: string;
        facilityType: string;
        mrn: string;
        registeredAt: string;
        status: string;
        notes?: string;
    };
    facilitiesCount?: number;
}

export interface PatientStats {
    total: number;
    active: number;
    inactive: number;
}

export const patientService = {
    // Get all patients
    getPatients: async (params?: any) => {
        // Use doctor-specific endpoint for doctors
        const response = await api.get('/api/doctors/my-patients', { params });
        return response.data;
    },

    // Get patient by ID
    getPatientById: async (id: string) => {
        const response = await api.get(`/api/patients/${id}`);
        return response.data;
    },

    // Create new patient
    createPatient: async (data: any) => {
        // Use doctor-specific endpoint for creating patients
        const response = await api.post('/api/doctors/my-patients', data);
        return response.data;
    },

    // Update patient
    updatePatient: async (id: string, data: any) => {
        const response = await api.put(`/api/patients/${id}`, data);
        return response.data;
    },

    // Delete patient
    deletePatient: async (id: string) => {
        const response = await api.delete(`/api/patients/${id}`);
        return response.data;
    },

    // Toggle patient status
    togglePatientStatus: async (id: string) => {
        const response = await api.patch(`/api/patients/${id}/toggle-status`);
        return response.data;
    },

    // Get patient statistics
    getPatientStats: async () => {
        // Use doctor-specific endpoint for doctors
        const response = await api.get('/api/doctors/my-patients/stats');
        return response.data;
    },
};
