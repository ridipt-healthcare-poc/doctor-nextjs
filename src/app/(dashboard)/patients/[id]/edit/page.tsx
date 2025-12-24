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
    Text,
    Divider,
    FormLabel,
    Spinner,
    Center,
} from '@chakra-ui/react';
import {
    FaUser,
    FaMapMarkerAlt,
    FaArrowLeft,
    FaSave,
    FaHeart,
    FaPhone,
} from 'react-icons/fa';
import { patientService } from '@/services/patientService';

export default function EditPatientPage() {
    const router = useRouter();
    const params = useParams();
    const patientId = params.id as string;
    const [loading, setLoading] = useState(false);
    const [dataLoading, setDataLoading] = useState(true);

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        mobile: '',
        gender: 'Male',
        dateOfBirth: '',
        age: '',
        bloodGroup: '',
        street: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India',
        preferredContactMethod: 'Phone',
        knownAllergies: '',
        medicalConditions: '',
        medications: '',
        emergencyContactName: '',
        emergencyContactRelationship: '',
        emergencyContactPhone: '',
    });

    const cardBg = useColorModeValue('white', 'gray.800');
    const inputBg = useColorModeValue('gray.50', 'gray.700');

    useEffect(() => {
        if (patientId) {
            fetchPatient();
        }
    }, [patientId]);

    const fetchPatient = async () => {
        try {
            const response = await patientService.getPatientById(patientId);
            const patient = response.data || response.patient;

            setFormData({
                fullName: patient.fullName || '',
                email: patient.email || '',
                mobile: patient.mobile || '',
                gender: patient.gender || 'Male',
                dateOfBirth: patient.dateOfBirth || '',
                age: patient.age || '',
                bloodGroup: patient.bloodGroup || '',
                street: patient.address?.street || '',
                city: patient.address?.city || '',
                state: patient.address?.state || '',
                pincode: patient.address?.pincode || '',
                country: patient.address?.country || 'India',
                preferredContactMethod: patient.preferredContactMethod || 'Phone',
                knownAllergies: patient.knownAllergies ? patient.knownAllergies.join(', ') : '',
                medicalConditions: patient.medicalConditions ? patient.medicalConditions.join(', ') : '',
                medications: patient.medications ? patient.medications.join(', ') : '',
                emergencyContactName: patient.emergencyContact?.name || '',
                emergencyContactRelationship: patient.emergencyContact?.relationship || '',
                emergencyContactPhone: patient.emergencyContact?.phone || '',
            });
        } catch (error: any) {
            toast.error('Failed to load patient details');
            router.push('/patients');
        } finally {
            setDataLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.fullName || !formData.email || !formData.mobile) {
            toast.error('Please fill all required fields');
            return;
        }

        setLoading(true);
        try {
            const patientData = {
                fullName: formData.fullName,
                email: formData.email,
                mobile: formData.mobile,
                gender: formData.gender,
                dateOfBirth: formData.dateOfBirth || undefined,
                age: formData.age || undefined,
                bloodGroup: formData.bloodGroup || undefined,
                address: (formData.street || formData.city || formData.state || formData.pincode || formData.country) ? {
                    street: formData.street || undefined,
                    city: formData.city || undefined,
                    state: formData.state || undefined,
                    pincode: formData.pincode || undefined,
                    country: formData.country || undefined,
                } : undefined,
                preferredContactMethod: formData.preferredContactMethod,
                knownAllergies: formData.knownAllergies ? formData.knownAllergies.split(',').map(a => a.trim()) : undefined,
                medicalConditions: formData.medicalConditions ? formData.medicalConditions.split(',').map(c => c.trim()) : undefined,
                medications: formData.medications ? formData.medications.split(',').map(m => m.trim()) : undefined,
                emergencyContact: (formData.emergencyContactName || formData.emergencyContactPhone) ? {
                    name: formData.emergencyContactName || undefined,
                    relationship: formData.emergencyContactRelationship || undefined,
                    phone: formData.emergencyContactPhone || undefined,
                } : undefined,
            };

            await patientService.updatePatient(patientId, patientData);
            toast.success('Patient updated successfully');
            router.push(`/patients/${patientId}`);
        } catch (error: any) {
            const message = error.response?.data?.message || 'Failed to update patient';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

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
                    onClick={() => router.push(`/patients/${patientId}`)}
                >
                    Back to Details
                </Button>
            </HStack>

            <Card bg={cardBg} shadow="xl" borderRadius="2xl">
                <Box p={6} borderBottom="1px" borderColor="gray.100">
                    <HStack>
                        <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                            <FaUser className="h-5 w-5 text-purple-600" />
                        </div>
                        <Text fontSize="2xl" fontWeight="semibold">Edit Patient</Text>
                    </HStack>
                </Box>

                <Box p={6}>
                    <form onSubmit={handleSubmit}>
                        <VStack spacing={6} align="stretch">
                            {/* Basic Information */}
                            <Box>
                                <Text fontSize="lg" fontWeight="semibold" mb={4} display="flex" alignItems="center" gap={2}>
                                    <FaUser className="h-5 w-5 text-blue-600" />
                                    Basic Information
                                </Text>

                                <VStack spacing={4}>
                                    <HStack spacing={4} width="full">
                                        <Box flex="1">
                                            <FormLabel htmlFor="fullName" className="text-gray-700 font-medium">
                                                Full Name <span className="text-red-500">*</span>
                                            </FormLabel>
                                            <Input
                                                id="fullName"
                                                name="fullName"
                                                placeholder="Enter full name"
                                                value={formData.fullName}
                                                onChange={handleInputChange}
                                                required
                                                bg={inputBg}
                                                border="1px solid"
                                                borderColor="gray.300"
                                                _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px blue.500' }}
                                                mt={1}
                                            />
                                        </Box>

                                        <Box flex="1">
                                            <FormLabel htmlFor="gender" className="text-gray-700 font-medium">
                                                Gender
                                            </FormLabel>
                                            <Select
                                                id="gender"
                                                name="gender"
                                                value={formData.gender}
                                                onChange={handleInputChange}
                                                bg={inputBg}
                                                border="1px solid"
                                                borderColor="gray.300"
                                                _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px blue.500' }}
                                                mt={1}
                                            >
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                                <option value="Other">Other</option>
                                            </Select>
                                        </Box>
                                    </HStack>

                                    <HStack spacing={4} width="full">
                                        <Box flex="1">
                                            <FormLabel htmlFor="email" className="text-gray-700 font-medium">
                                                Email <span className="text-red-500">*</span>
                                            </FormLabel>
                                            <Input
                                                id="email"
                                                name="email"
                                                type="email"
                                                placeholder="patient@example.com"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                required
                                                bg={inputBg}
                                                border="1px solid"
                                                borderColor="gray.300"
                                                _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px blue.500' }}
                                                mt={1}
                                            />
                                        </Box>

                                        <Box flex="1">
                                            <FormLabel htmlFor="mobile" className="text-gray-700 font-medium">
                                                Mobile Number <span className="text-red-500">*</span>
                                            </FormLabel>
                                            <Input
                                                id="mobile"
                                                name="mobile"
                                                placeholder="1234567890"
                                                value={formData.mobile}
                                                onChange={handleInputChange}
                                                required
                                                bg={inputBg}
                                                border="1px solid"
                                                borderColor="gray.300"
                                                _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px blue.500' }}
                                                mt={1}
                                            />
                                        </Box>
                                    </HStack>

                                    <HStack spacing={4} width="full">
                                        <Box flex="1">
                                            <FormLabel htmlFor="dateOfBirth" className="text-gray-700 font-medium">
                                                Date of Birth
                                            </FormLabel>
                                            <Input
                                                id="dateOfBirth"
                                                name="dateOfBirth"
                                                type="date"
                                                value={formData.dateOfBirth}
                                                onChange={handleInputChange}
                                                bg={inputBg}
                                                border="1px solid"
                                                borderColor="gray.300"
                                                _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px blue.500' }}
                                                mt={1}
                                            />
                                        </Box>

                                        <Box flex="1">
                                            <FormLabel htmlFor="age" className="text-gray-700 font-medium">
                                                Age
                                            </FormLabel>
                                            <Input
                                                id="age"
                                                name="age"
                                                placeholder="25"
                                                value={formData.age}
                                                onChange={handleInputChange}
                                                bg={inputBg}
                                                border="1px solid"
                                                borderColor="gray.300"
                                                _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px blue.500' }}
                                                mt={1}
                                            />
                                        </Box>
                                    </HStack>

                                    <Box width="full">
                                        <FormLabel htmlFor="bloodGroup" className="text-gray-700 font-medium">
                                            Blood Group
                                        </FormLabel>
                                        <Select
                                            id="bloodGroup"
                                            name="bloodGroup"
                                            value={formData.bloodGroup}
                                            onChange={handleInputChange}
                                            bg={inputBg}
                                            border="1px solid"
                                            borderColor="gray.300"
                                            _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px blue.500' }}
                                            mt={1}
                                        >
                                            <option value="">Select Blood Group</option>
                                            {bloodGroups.map((bg) => (
                                                <option key={bg} value={bg}>
                                                    {bg}
                                                </option>
                                            ))}
                                        </Select>
                                    </Box>
                                </VStack>
                            </Box>

                            <Divider />

                            {/* Address Information */}
                            <Box>
                                <Text fontSize="lg" fontWeight="semibold" mb={4} display="flex" alignItems="center" gap={2}>
                                    <FaMapMarkerAlt className="h-5 w-5 text-green-600" />
                                    Address Information
                                </Text>

                                <VStack spacing={4}>
                                    <Box width="full">
                                        <FormLabel htmlFor="street" className="text-gray-700 font-medium">
                                            Street Address
                                        </FormLabel>
                                        <Input
                                            id="street"
                                            name="street"
                                            placeholder="Enter street address"
                                            value={formData.street}
                                            onChange={handleInputChange}
                                            bg={inputBg}
                                            border="1px solid"
                                            borderColor="gray.300"
                                            _focus={{ borderColor: 'green.500', boxShadow: '0 0 0 1px green.500' }}
                                            mt={1}
                                        />
                                    </Box>

                                    <HStack spacing={4} width="full">
                                        <Box flex="1">
                                            <FormLabel htmlFor="city" className="text-gray-700 font-medium">
                                                City
                                            </FormLabel>
                                            <Input
                                                id="city"
                                                name="city"
                                                placeholder="Enter city"
                                                value={formData.city}
                                                onChange={handleInputChange}
                                                bg={inputBg}
                                                border="1px solid"
                                                borderColor="gray.300"
                                                _focus={{ borderColor: 'green.500', boxShadow: '0 0 0 1px green.500' }}
                                                mt={1}
                                            />
                                        </Box>

                                        <Box flex="1">
                                            <FormLabel htmlFor="state" className="text-gray-700 font-medium">
                                                State
                                            </FormLabel>
                                            <Input
                                                id="state"
                                                name="state"
                                                placeholder="Enter state"
                                                value={formData.state}
                                                onChange={handleInputChange}
                                                bg={inputBg}
                                                border="1px solid"
                                                borderColor="gray.300"
                                                _focus={{ borderColor: 'green.500', boxShadow: '0 0 0 1px green.500' }}
                                                mt={1}
                                            />
                                        </Box>
                                    </HStack>

                                    <HStack spacing={4} width="full">
                                        <Box flex="1">
                                            <FormLabel htmlFor="pincode" className="text-gray-700 font-medium">
                                                Pincode
                                            </FormLabel>
                                            <Input
                                                id="pincode"
                                                name="pincode"
                                                placeholder="123456"
                                                value={formData.pincode}
                                                onChange={handleInputChange}
                                                bg={inputBg}
                                                border="1px solid"
                                                borderColor="gray.300"
                                                _focus={{ borderColor: 'green.500', boxShadow: '0 0 0 1px green.500' }}
                                                mt={1}
                                            />
                                        </Box>

                                        <Box flex="1">
                                            <FormLabel htmlFor="country" className="text-gray-700 font-medium">
                                                Country
                                            </FormLabel>
                                            <Input
                                                id="country"
                                                name="country"
                                                placeholder="India"
                                                value={formData.country}
                                                onChange={handleInputChange}
                                                bg={inputBg}
                                                border="1px solid"
                                                borderColor="gray.300"
                                                _focus={{ borderColor: 'green.500', boxShadow: '0 0 0 1px green.500' }}
                                                mt={1}
                                            />
                                        </Box>
                                    </HStack>
                                </VStack>
                            </Box>

                            <Divider />

                            {/* Medical Information */}
                            <Box>
                                <Text fontSize="lg" fontWeight="semibold" mb={4} display="flex" alignItems="center" gap={2}>
                                    <FaHeart className="h-5 w-5 text-red-600" />
                                    Medical Information
                                </Text>

                                <VStack spacing={4}>
                                    <HStack spacing={4} width="full">
                                        <Box flex="1">
                                            <FormLabel htmlFor="knownAllergies" className="text-gray-700 font-medium">
                                                Known Allergies
                                            </FormLabel>
                                            <Input
                                                id="knownAllergies"
                                                name="knownAllergies"
                                                placeholder="e.g., Penicillin, Nuts"
                                                value={formData.knownAllergies}
                                                onChange={handleInputChange}
                                                bg={inputBg}
                                                border="1px solid"
                                                borderColor="gray.300"
                                                _focus={{ borderColor: 'red.500', boxShadow: '0 0 0 1px red.500' }}
                                                mt={1}
                                            />
                                        </Box>

                                        <Box flex="1">
                                            <FormLabel htmlFor="medicalConditions" className="text-gray-700 font-medium">
                                                Medical Conditions
                                            </FormLabel>
                                            <Input
                                                id="medicalConditions"
                                                name="medicalConditions"
                                                placeholder="e.g., Diabetes, Hypertension"
                                                value={formData.medicalConditions}
                                                onChange={handleInputChange}
                                                bg={inputBg}
                                                border="1px solid"
                                                borderColor="gray.300"
                                                _focus={{ borderColor: 'red.500', boxShadow: '0 0 0 1px red.500' }}
                                                mt={1}
                                            />
                                        </Box>
                                    </HStack>

                                    <Box width="full">
                                        <FormLabel htmlFor="medications" className="text-gray-700 font-medium">
                                            Current Medications
                                        </FormLabel>
                                        <Textarea
                                            id="medications"
                                            name="medications"
                                            placeholder="List current medications (one per line)"
                                            value={formData.medications}
                                            onChange={handleInputChange}
                                            rows={3}
                                            bg={inputBg}
                                            border="1px solid"
                                            borderColor="gray.300"
                                            _focus={{ borderColor: 'red.500', boxShadow: '0 0 0 1px red.500' }}
                                            mt={1}
                                        />
                                    </Box>
                                </VStack>
                            </Box>

                            <Divider />

                            {/* Emergency Contact */}
                            <Box>
                                <Text fontSize="lg" fontWeight="semibold" mb={4} display="flex" alignItems="center" gap={2}>
                                    <FaPhone className="h-5 w-5 text-orange-600" />
                                    Emergency Contact
                                </Text>

                                <VStack spacing={4}>
                                    <HStack spacing={4} width="full">
                                        <Box flex="1">
                                            <FormLabel htmlFor="emergencyContactName" className="text-gray-700 font-medium">
                                                Contact Name
                                            </FormLabel>
                                            <Input
                                                id="emergencyContactName"
                                                name="emergencyContactName"
                                                placeholder="Emergency contact name"
                                                value={formData.emergencyContactName}
                                                onChange={handleInputChange}
                                                bg={inputBg}
                                                border="1px solid"
                                                borderColor="gray.300"
                                                _focus={{ borderColor: 'orange.500', boxShadow: '0 0 0 1px orange.500' }}
                                                mt={1}
                                            />
                                        </Box>

                                        <Box flex="1">
                                            <FormLabel htmlFor="emergencyContactRelationship" className="text-gray-700 font-medium">
                                                Relationship
                                            </FormLabel>
                                            <Input
                                                id="emergencyContactRelationship"
                                                name="emergencyContactRelationship"
                                                placeholder="e.g., Spouse, Parent"
                                                value={formData.emergencyContactRelationship}
                                                onChange={handleInputChange}
                                                bg={inputBg}
                                                border="1px solid"
                                                borderColor="gray.300"
                                                _focus={{ borderColor: 'orange.500', boxShadow: '0 0 0 1px orange.500' }}
                                                mt={1}
                                            />
                                        </Box>
                                    </HStack>

                                    <Box width="full">
                                        <FormLabel htmlFor="emergencyContactPhone" className="text-gray-700 font-medium">
                                            Emergency Phone
                                        </FormLabel>
                                        <Input
                                            id="emergencyContactPhone"
                                            name="emergencyContactPhone"
                                            placeholder="Emergency contact phone"
                                            value={formData.emergencyContactPhone}
                                            onChange={handleInputChange}
                                            bg={inputBg}
                                            border="1px solid"
                                            borderColor="gray.300"
                                            _focus={{ borderColor: 'orange.500', boxShadow: '0 0 0 1px orange.500' }}
                                            mt={1}
                                        />
                                    </Box>
                                </VStack>
                            </Box>

                            {/* Submit Buttons */}
                            <Divider />
                            <HStack spacing={4} justify="end">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.push(`/patients/${patientId}`)}
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
                                    Update Patient
                                </Button>
                            </HStack>
                        </VStack>
                    </form>
                </Box>
            </Card>
        </Box>
    );
}
