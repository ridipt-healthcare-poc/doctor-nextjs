'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'sonner';
import {
    Box,
    Button,
    Card,
    Input,
    Textarea,
    Select,
    VStack,
    HStack,
    useColorModeValue,
    Spinner,
    Center,
    Text,
    Divider,
    FormLabel,
    SimpleGrid,
} from '@chakra-ui/react';
import {
    FaCalendarAlt,
    FaClock,
    FaArrowLeft,
    FaSave,
} from 'react-icons/fa';
import { useAuth } from '@/contexts/AuthContext';
import { patientService } from '@/services/patientService';
import { appointmentService } from '@/services/appointmentService';

interface Patient {
    _id: string;
    fullName: string;
    email: string;
    mobile: string;
    isActive: boolean;
}

interface AvailableSlot {
    start: string;
    end: string;
    duration: number;
    isBooked: boolean;
    isAvailable: boolean;
}

export default function EditAppointmentPage() {
    const router = useRouter();
    const params = useParams();
    const appointmentId = params.id as string;
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [dataLoading, setDataLoading] = useState(true);
    const [patients, setPatients] = useState<Patient[]>([]);
    const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
    const [slotsLoading, setSlotsLoading] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
    const [hasSelectedNewSlot, setHasSelectedNewSlot] = useState(false); // Track if user selected a new slot
    const [originalSlot, setOriginalSlot] = useState<any>(null); // Store original slot

    const [formData, setFormData] = useState({
        patientId: '',
        appointmentDate: '',
        appointmentTime: '',
        slot: { start: '', end: '' },
        appointmentType: 'onsite',
        visitType: 'First Visit',
        consultationFee: 0,
        reason: '',
        notes: '',
        status: 'Scheduled',
    });

    const cardBg = useColorModeValue('white', 'gray.800');
    const inputBg = useColorModeValue('gray.50', 'gray.700');

    useEffect(() => {
        if (appointmentId) {
            fetchAppointment();
            fetchPatients();
        }
    }, [appointmentId]);

    const fetchAppointment = async () => {
        try {
            const response = await appointmentService.getAppointmentById(appointmentId);
            const appointment = response.data || response.appointment;

            // Extract date from appointmentDate
            const date = new Date(appointment.appointmentDate).toISOString().split('T')[0];

            setFormData({
                patientId: appointment.patientId?._id || appointment.patient?._id || '',
                appointmentDate: date,
                appointmentTime: appointment.appointmentTime || '',
                slot: appointment.slot || { start: '', end: '' },
                appointmentType: appointment.appointmentType || 'onsite',
                visitType: appointment.visitType || 'First Visit',
                consultationFee: appointment.consultationFee || 0,
                reason: appointment.reason || '',
                notes: appointment.notes || '',
                status: appointment.status || 'Scheduled',
            });

            // Store original slot for comparison
            setOriginalSlot(appointment.slot);

            // Set the selected slot if available
            if (appointment.slot?.start) {
                setSelectedSlot({
                    start: appointment.slot.start,
                    end: appointment.slot.end,
                    duration: 0,
                    isBooked: false,
                    isAvailable: true,
                });
            }

            // Fetch available slots for the appointment date
            if (date) {
                fetchAvailableSlots(date);
            }
        } catch (error: any) {
            toast.error('Failed to load appointment details');
            router.push('/appointments');
        } finally {
            setDataLoading(false);
        }
    };

    const fetchPatients = async () => {
        try {
            const response = await patientService.getPatients();
            setPatients(response.data || response.patients || []);
        } catch (error: any) {
            toast.error('Failed to load patients');
        }
    };

    const fetchAvailableSlots = async (date: string) => {
        if (!date || !user?._id) return;

        setSlotsLoading(true);
        try {
            const response = await appointmentService.getAvailableSlots({ date });
            setAvailableSlots(response.data || []);
        } catch (error: any) {
            toast.error('Failed to load available slots');
            setAvailableSlots([]);
        } finally {
            setSlotsLoading(false);
        }
    };

    const handleSlotSelect = (slot: AvailableSlot) => {
        if (!slot.isAvailable) return;

        const slotStart = new Date(slot.start);
        const time = slotStart.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        });

        setSelectedSlot(slot);
        setHasSelectedNewSlot(true); // Mark that user selected a new slot
        setFormData((prev) => ({
            ...prev,
            appointmentTime: time,
            slot: {
                start: slot.start,
                end: slot.end,
            },
        }));
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'consultationFee' ? parseFloat(value) || 0 : value,
        }));

        // Fetch available slots when date changes
        if (name === 'appointmentDate' && value) {
            fetchAvailableSlots(value);
            // Reset selected slot when date changes
            setSelectedSlot(null);
            setHasSelectedNewSlot(false);
            setFormData(prev => ({ ...prev, appointmentTime: '', slot: { start: '', end: '' } }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.patientId || !formData.appointmentDate) {
            toast.error('Please fill all required fields');
            return;
        }

        setLoading(true);
        try {
            const appointmentData: any = {
                status: formData.status,
                appointmentType: formData.appointmentType,
                visitType: formData.visitType,
                consultationFee: formData.consultationFee,
                reasonForVisit: formData.reason,
                notes: formData.notes,
            };

            // Only include slot if user selected a new slot
            if (hasSelectedNewSlot && selectedSlot) {
                // Generate a valid ObjectId-like string (24 hex characters)
                const timestamp = Math.floor(Date.now() / 1000).toString(16).padStart(8, '0');
                const randomHex = Math.random().toString(16).substring(2, 18).padEnd(16, '0');
                const slotId = timestamp + randomHex;

                appointmentData.slot = {
                    slotId: slotId,
                    start: selectedSlot.start,
                    end: selectedSlot.end,
                };
                appointmentData.appointmentDate = formData.appointmentDate;
                appointmentData.appointmentDateTime = new Date(selectedSlot.start).toISOString();
            }

            await appointmentService.updateAppointment(appointmentId, appointmentData);
            toast.success('Appointment updated successfully');
            router.push(`/appointments/${appointmentId}`);
        } catch (error: any) {
            const message = error.response?.data?.message || 'Failed to update appointment';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    if (dataLoading) {
        return (
            <Center h="400px">
                <Spinner size="xl" color="blue.500" />
            </Center>
        );
    }

    return (
        <Box maxW="4xl" mx="auto">
            {/* Header */}
            <HStack mb={6}>
                <Button
                    leftIcon={<FaArrowLeft />}
                    variant="ghost"
                    onClick={() => router.push(`/appointments/${appointmentId}`)}
                >
                    Back to Details
                </Button>
            </HStack>

            <Card bg={cardBg} shadow="xl" borderRadius="2xl">
                <Box p={6} borderBottom="1px" borderColor="gray.100">
                    <HStack>
                        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                            <FaCalendarAlt className="h-5 w-5 text-blue-600" />
                        </div>
                        <Text fontSize="2xl" fontWeight="semibold">Edit Appointment</Text>
                    </HStack>
                </Box>

                <Box p={6}>
                    <form onSubmit={handleSubmit}>
                        <VStack spacing={6} align="stretch">
                            {/* Patient Selection */}
                            <Box>
                                <FormLabel htmlFor="patientId" className="text-gray-700 font-medium mb-2 block">
                                    Patient <span className="text-red-500">*</span>
                                </FormLabel>
                                <Select
                                    id="patientId"
                                    name="patientId"
                                    value={formData.patientId}
                                    onChange={handleInputChange}
                                    required
                                    bg={inputBg}
                                    border="1px solid"
                                    borderColor="gray.300"
                                    _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px blue.500' }}
                                    className="w-full px-3 py-2 rounded-lg"
                                >
                                    <option value="">Select Patient</option>
                                    {patients
                                        .filter(patient => patient.isActive)
                                        .map((patient) => (
                                            <option key={patient._id} value={patient._id}>
                                                {patient.fullName} - {patient.mobile}
                                            </option>
                                        ))}
                                </Select>
                            </Box>

                            {/* Appointment Details Section */}
                            <Box className="bg-purple-50 p-6 rounded-xl border border-purple-100/50 mb-6">
                                <HStack mb={4} spacing={2}>
                                    <FaClock className="text-purple-600" />
                                    <Text fontSize="lg" fontWeight="semibold" color="gray.800">Appointment Details</Text>
                                </HStack>

                                <VStack spacing={4} align="stretch">
                                    <Box>
                                        <FormLabel htmlFor="appointmentDate" className="text-gray-700 font-medium mb-2 block">
                                            Appointment Date <span className="text-red-500">*</span>
                                        </FormLabel>
                                        <Input
                                            id="appointmentDate"
                                            name="appointmentDate"
                                            type="date"
                                            value={formData.appointmentDate}
                                            onChange={handleInputChange}
                                            required
                                            min={new Date().toISOString().split('T')[0]}
                                            bg="white"
                                            border="1px solid"
                                            borderColor="gray.300"
                                            _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px blue.500' }}
                                            size="lg"
                                        />
                                    </Box>

                                    <Box>
                                        <FormLabel htmlFor="appointmentType" className="text-gray-700 font-medium mb-2 block">
                                            Appointment Type <span className="text-red-500">*</span>
                                        </FormLabel>
                                        <Select
                                            id="appointmentType"
                                            name="appointmentType"
                                            value={formData.appointmentType}
                                            onChange={handleInputChange}
                                            bg="white"
                                            border="1px solid"
                                            borderColor="gray.300"
                                            _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px blue.500' }}
                                            size="lg"
                                        >
                                            <option value="onsite">On-site Visit</option>
                                            <option value="voiceCall">Voice Call</option>
                                            <option value="videoCall">Video Call</option>
                                            <option value="homeVisit">Home Visit</option>
                                        </Select>
                                    </Box>

                                    <Box>
                                        <FormLabel htmlFor="status" className="text-gray-700 font-medium mb-2 block">
                                            Status
                                        </FormLabel>
                                        <Select
                                            id="status"
                                            name="status"
                                            value={formData.status}
                                            onChange={handleInputChange}
                                            bg="white"
                                            border="1px solid"
                                            borderColor="gray.300"
                                            _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px blue.500' }}
                                            size="lg"
                                        >
                                            <option value="Scheduled">Scheduled</option>
                                            <option value="Booked">Booked</option>
                                            <option value="Confirmed">Confirmed</option>
                                            <option value="Completed">Completed</option>
                                            <option value="Cancelled">Cancelled</option>
                                            <option value="No-Show">No-Show</option>
                                            <option value="Rescheduled">Rescheduled</option>
                                        </Select>
                                    </Box>
                                </VStack>
                            </Box>

                            {/* Available Slots */}
                            <Box mb={6}>
                                <FormLabel className="text-gray-700 font-medium mb-3 block">
                                    Select Time Slot <span className="text-red-500">*</span>
                                </FormLabel>
                                {availableSlots.length > 0 ? (
                                    <SimpleGrid columns={{ base: 3, sm: 4, md: 6 }} spacing={3}>
                                        {availableSlots.map((slot, index) => {
                                            const slotStart = new Date(slot.start);
                                            const timeStr = slotStart.toLocaleTimeString("en-US", {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                                hour12: true,
                                            });

                                            return (
                                                <Button
                                                    key={index}
                                                    variant={formData.slot.start === slot.start ? "solid" : "outline"}
                                                    colorScheme={formData.slot.start === slot.start ? "blue" : "gray"}
                                                    bg={formData.slot.start === slot.start ? "blue.600" : "white"}
                                                    color={formData.slot.start === slot.start ? "white" : "gray.700"}
                                                    borderColor={formData.slot.start === slot.start ? "blue.600" : "gray.300"}
                                                    _hover={{
                                                        borderColor: 'blue.500',
                                                        bg: formData.slot.start === slot.start ? "blue.700" : "blue.50"
                                                    }}
                                                    isDisabled={!slot.isAvailable}
                                                    onClick={() => handleSlotSelect(slot)}
                                                    size="sm"
                                                    py={5}
                                                    w="full"
                                                    borderRadius="lg"
                                                    height="auto"
                                                    fontWeight="medium"
                                                    boxShadow={formData.slot.start === slot.start ? "sm" : "none"}
                                                >
                                                    {timeStr}
                                                </Button>
                                            );
                                        })}
                                    </SimpleGrid>
                                ) : formData.appointmentDate && !slotsLoading ? (
                                    <Text fontSize="sm" color="red.500" mt={1}>
                                        No available slots for this date
                                    </Text>
                                ) : slotsLoading ? (
                                    <Text fontSize="sm" color="gray.500" mt={1}>
                                        Loading slots...
                                    </Text>
                                ) : (
                                    <Text fontSize="sm" color="gray.500" mt={1}>
                                        Select a date to view available slots
                                    </Text>
                                )}
                            </Box>

                            {/* Visit Type */}
                            <Box mb={6}>
                                <FormLabel htmlFor="visitType" className="text-gray-700 font-medium mb-2 block">
                                    Visit Type
                                </FormLabel>
                                <Select
                                    id="visitType"
                                    name="visitType"
                                    value={formData.visitType}
                                    onChange={handleInputChange}
                                    bg={inputBg}
                                    border="1px solid"
                                    borderColor="gray.300"
                                    _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px blue.500' }}
                                >
                                    <option value="First Visit">First Visit</option>
                                    <option value="Follow-Up">Follow-Up</option>
                                </Select>
                            </Box>

                            {/* Consultation Fee */}
                            <Box>
                                <FormLabel htmlFor="consultationFee" className="text-gray-700 font-medium mb-2 block">
                                    Consultation Fee (₹)
                                </FormLabel>
                                <Input
                                    id="consultationFee"
                                    name="consultationFee"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={formData.consultationFee || ''}
                                    onChange={handleInputChange}
                                    placeholder="Enter consultation fee"
                                    bg={inputBg}
                                    border="1px solid"
                                    borderColor="gray.300"
                                    _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px blue.500' }}
                                />
                            </Box>

                            {/* Reason for Visit */}
                            <Box>
                                <FormLabel htmlFor="reason" className="text-gray-700 font-medium mb-2 block">
                                    Reason for Visit
                                </FormLabel>
                                <Input
                                    id="reason"
                                    name="reason"
                                    value={formData.reason}
                                    onChange={handleInputChange}
                                    placeholder="Brief reason for the appointment"
                                    bg={inputBg}
                                    border="1px solid"
                                    borderColor="gray.300"
                                    _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px blue.500' }}
                                />
                            </Box>

                            {/* Additional Notes */}
                            <Box>
                                <FormLabel htmlFor="notes" className="text-gray-700 font-medium mb-2 block">
                                    Additional Notes
                                </FormLabel>
                                <Textarea
                                    id="notes"
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleInputChange}
                                    placeholder="Any additional notes or instructions"
                                    rows={3}
                                    bg={inputBg}
                                    border="1px solid"
                                    borderColor="gray.300"
                                    _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px blue.500' }}
                                />
                            </Box>

                            <Divider />

                            {/* Submit Buttons */}
                            <HStack spacing={4} justify="end">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.push(`/appointments/${appointmentId}`)}
                                    disabled={loading}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    colorScheme="blue"
                                    leftIcon={<FaSave />}
                                    disabled={loading}
                                    isLoading={loading}
                                    loadingText="Updating..."
                                >
                                    Update Appointment
                                </Button>
                            </HStack>
                        </VStack>
                    </form>
                </Box>
            </Card>
        </Box>
    );
}
