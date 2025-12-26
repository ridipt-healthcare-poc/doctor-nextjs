import api from '../utils/api';

export interface Appointment {
    _id: string;
    patient: any;
    doctor: any;
    facility: string;
    appointmentDate: string;
    appointmentTime: string;
    appointmentDateTime: string;
    status: string;
    reason?: string;
    notes?: string;
}

export interface AppointmentStats {
    total: number;
    scheduled: number;
    completed: number;
    cancelled: number;
}

export const appointmentService = {
    // Get all appointments
    getAppointments: async (params?: any) => {
        // Use doctor-specific endpoint for doctors
        const response = await api.get('/api/doctors/my-appointments', { params });
        return response.data;
    },

    // Get appointment by ID
    getAppointmentById: async (id: string) => {
        const response = await api.get(`/api/appointments/${id}`);
        return response.data;
    },

    // Create new appointment
    createAppointment: async (data: any) => {
        const response = await api.post('/api/appointments', data);
        return response.data;
    },

    // Update appointment
    updateAppointment: async (id: string, data: any) => {
        const response = await api.put(`/api/appointments/${id}`, data);
        return response.data;
    },

    // Update appointment status
    updateAppointmentStatus: async (id: string, status: string) => {
        const response = await api.patch(`/api/appointments/${id}/status`, { status });
        return response.data;
    },

    // Cancel appointment
    cancelAppointment: async (id: string) => {
        const response = await api.patch(`/api/appointments/${id}/cancel`);
        return response.data;
    },

    // Delete appointment
    deleteAppointment: async (id: string) => {
        const response = await api.delete(`/api/appointments/${id}`);
        return response.data;
    },

    // Get appointment statistics
    getAppointmentStats: async () => {
        // Use doctor-specific endpoint for doctors
        const response = await api.get('/api/doctors/my-appointments/stats');
        return response.data;
    },

    // Get available slots
    getAvailableSlots: async (params: any) => {
        const response = await api.get('/api/doctors/my-available-slots', { params });
        return response.data;
    },
};
