'use client';

import React, { useEffect, useState } from 'react';
import {
    Box,
    Button,
    Badge,
    Heading,
    HStack,
    VStack,
    Text,
    useToast,
    Spinner,
    Center,
    useColorModeValue,
    Divider,
    Grid,
    GridItem,
    Card,
    CardBody,
    AlertDialog,
    AlertDialogBody,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogContent,
    AlertDialogOverlay,
    useDisclosure,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    SimpleGrid,
} from '@chakra-ui/react';
import { FiArrowLeft, FiEdit, FiTrash2, FiUser, FiPhone, FiMail, FiMapPin, FiHeart, FiCalendar, FiToggleLeft, FiToggleRight } from 'react-icons/fi';
import { patientService } from '@/services/patientService';
import { appointmentService } from '@/services/appointmentService';
import { useRouter, useParams } from 'next/navigation';

export default function PatientDetailPage() {
    const [patient, setPatient] = useState<any>(null);
    const [appointments, setAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const cancelRef = React.useRef<HTMLButtonElement>(null);
    const toast = useToast();
    const router = useRouter();
    const params = useParams();
    const patientId = params.id as string;

    const cardBg = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.600');
    const labelColor = useColorModeValue('gray.600', 'gray.400');
    const theadBg = useColorModeValue('gray.50', 'gray.700');

    useEffect(() => {
        if (patientId) {
            fetchPatient();
            fetchPatientAppointments();
        }
    }, [patientId]);

    const fetchPatient = async () => {
        try {
            const response = await patientService.getPatientById(patientId);
            setPatient(response.data || response.patient);
        } catch (error: any) {
            toast({
                title: 'Error fetching patient',
                description: error.response?.data?.message || 'Failed to load patient details',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
            router.push('/patients');
        } finally {
            setLoading(false);
        }
    };

    const fetchPatientAppointments = async () => {
        try {
            const response = await appointmentService.getAppointments({ patientId });
            setAppointments(response.data || response.appointments || []);
        } catch (error: any) {
            console.error('Error fetching patient appointments:', error);
        }
    };

    const handleDelete = async () => {
        try {
            await patientService.deletePatient(patientId);
            toast({
                title: 'Patient deleted',
                description: 'The patient has been successfully deleted.',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
            router.push('/patients');
        } catch (error: any) {
            toast({
                title: 'Error deleting patient',
                description: error.response?.data?.message || 'Failed to delete patient',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        } finally {
            onClose();
        }
    };

    const handleToggleStatus = async () => {
        try {
            await patientService.togglePatientStatus(patientId);
            toast({
                title: 'Status updated',
                description: 'Patient status has been updated.',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
            fetchPatient(); // Refresh patient data
        } catch (error: any) {
            toast({
                title: 'Error updating status',
                description: error.response?.data?.message || 'Failed to update patient status',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const getStatusColor = (status: string) => {
        const statusColors: Record<string, string> = {
            Scheduled: 'blue',
            Booked: 'purple',
            Confirmed: 'green',
            Completed: 'gray',
            Cancelled: 'red',
            'No-Show': 'orange',
            Rescheduled: 'yellow',
        };
        return statusColors[status] || 'gray';
    };

    if (loading) {
        return (
            <Center h="400px">
                <Spinner size="xl" color="blue.500" />
            </Center>
        );
    }

    if (!patient) {
        return (
            <Box>
                <Text>Patient not found</Text>
            </Box>
        );
    }

    return (
        <Box>
            {/* Header */}
            <HStack justify="space-between" mb={6}>
                <HStack spacing={4}>
                    <Button
                        leftIcon={<FiArrowLeft />}
                        variant="ghost"
                        onClick={() => router.push('/patients')}
                    >
                        Back to Patients
                    </Button>
                    <Heading size="lg">Patient Details</Heading>
                </HStack>
                <HStack spacing={3}>
                    <Button
                        leftIcon={patient.isActive ? <FiToggleRight /> : <FiToggleLeft />}
                        colorScheme={patient.isActive ? 'green' : 'gray'}
                        variant="outline"
                        onClick={handleToggleStatus}
                    >
                        {patient.isActive ? 'Active' : 'Inactive'}
                    </Button>
                    <Button
                        leftIcon={<FiEdit />}
                        colorScheme="blue"
                        onClick={() => router.push(`/patients/${patientId}/edit`)}
                    >
                        Edit
                    </Button>
                    <Button
                        leftIcon={<FiTrash2 />}
                        colorScheme="red"
                        variant="outline"
                        onClick={onOpen}
                    >
                        Delete
                    </Button>
                </HStack>
            </HStack>

            <Grid templateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }} gap={6} mb={6}>
                {/* Basic Information */}
                <GridItem>
                    <Card bg={cardBg} borderRadius="xl" shadow="sm">
                        <CardBody>
                            <VStack align="stretch" spacing={4}>
                                <HStack justify="space-between">
                                    <Heading size="md">Basic Information</Heading>
                                    <Badge colorScheme={patient.isActive ? 'green' : 'gray'} fontSize="md" px={3} py={1}>
                                        {patient.isActive ? 'Active' : 'Inactive'}
                                    </Badge>
                                </HStack>
                                <Divider />

                                <Box>
                                    <HStack spacing={2} mb={2}>
                                        <FiUser color="gray" />
                                        <Text fontWeight="semibold" color={labelColor}>Full Name</Text>
                                    </HStack>
                                    <Text fontSize="lg" fontWeight="medium">{patient.fullName}</Text>
                                </Box>

                                <Box>
                                    <HStack spacing={2} mb={2}>
                                        <FiPhone color="gray" />
                                        <Text fontWeight="semibold" color={labelColor}>Phone</Text>
                                    </HStack>
                                    <Text>{patient.mobile}</Text>
                                </Box>

                                {patient.email && (
                                    <Box>
                                        <HStack spacing={2} mb={2}>
                                            <FiMail color="gray" />
                                            <Text fontWeight="semibold" color={labelColor}>Email</Text>
                                        </HStack>
                                        <Text>{patient.email}</Text>
                                    </Box>
                                )}

                                <SimpleGrid columns={2} spacing={4}>
                                    {patient.gender && (
                                        <Box>
                                            <Text fontWeight="semibold" color={labelColor} mb={1}>Gender</Text>
                                            <Text>{patient.gender}</Text>
                                        </Box>
                                    )}
                                    {patient.dateOfBirth && (
                                        <Box>
                                            <Text fontWeight="semibold" color={labelColor} mb={1}>Date of Birth</Text>
                                            <Text>{patient.dateOfBirth}</Text>
                                        </Box>
                                    )}
                                </SimpleGrid>
                            </VStack>
                        </CardBody>
                    </Card>
                </GridItem>

                {/* Medical Information */}
                <GridItem>
                    <Card bg={cardBg} borderRadius="xl" shadow="sm">
                        <CardBody>
                            <VStack align="stretch" spacing={4}>
                                <HStack>
                                    <FiHeart color="red" />
                                    <Heading size="md">Medical Information</Heading>
                                </HStack>
                                <Divider />

                                {patient.allergies && patient.allergies.length > 0 && (
                                    <Box>
                                        <Text fontWeight="semibold" color={labelColor} mb={2}>Allergies</Text>
                                        <HStack spacing={2} flexWrap="wrap">
                                            {patient.allergies.map((allergy: string, index: number) => (
                                                <Badge key={index} colorScheme="red" fontSize="sm">
                                                    {allergy}
                                                </Badge>
                                            ))}
                                        </HStack>
                                    </Box>
                                )}

                                {patient.medicalHistory && (
                                    <Box>
                                        <Text fontWeight="semibold" color={labelColor} mb={2}>Medical History</Text>
                                        <Text>{patient.medicalHistory}</Text>
                                    </Box>
                                )}

                                {!patient.allergies?.length && !patient.medicalHistory && (
                                    <Text color="gray.500" fontStyle="italic">No medical information available</Text>
                                )}
                            </VStack>
                        </CardBody>
                    </Card>
                </GridItem>

                {/* Address Information */}
                {patient.address && (
                    <GridItem>
                        <Card bg={cardBg} borderRadius="xl" shadow="sm">
                            <CardBody>
                                <VStack align="stretch" spacing={4}>
                                    <HStack>
                                        <FiMapPin color="gray" />
                                        <Heading size="md">Address</Heading>
                                    </HStack>
                                    <Divider />

                                    <Text>
                                        {patient.address.street && `${patient.address.street}, `}
                                        {patient.address.city && `${patient.address.city}, `}
                                        {patient.address.state && `${patient.address.state} `}
                                        {patient.address.pincode && `- ${patient.address.pincode}`}
                                    </Text>
                                </VStack>
                            </CardBody>
                        </Card>
                    </GridItem>
                )}
            </Grid>

            {/* Appointment History */}
            <Card bg={cardBg} borderRadius="xl" shadow="sm">
                <CardBody>
                    <VStack align="stretch" spacing={4}>
                        <HStack>
                            <FiCalendar color="gray" />
                            <Heading size="md">Appointment History</Heading>
                        </HStack>
                        <Divider />

                        {appointments.length > 0 ? (
                            <Box overflowX="auto">
                                <Table variant="simple">
                                    <Thead bg={theadBg}>
                                        <Tr>
                                            <Th>Date</Th>
                                            <Th>Time</Th>
                                            <Th>Status</Th>
                                            <Th>Reason</Th>
                                            <Th>Actions</Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {appointments.map((appointment: any) => (
                                            <Tr key={appointment._id}>
                                                <Td>{new Date(appointment.appointmentDate).toLocaleDateString()}</Td>
                                                <Td>{appointment.appointmentTime}</Td>
                                                <Td>
                                                    <Badge colorScheme={getStatusColor(appointment.status)}>
                                                        {appointment.status}
                                                    </Badge>
                                                </Td>
                                                <Td>{appointment.reason || '-'}</Td>
                                                <Td>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        colorScheme="blue"
                                                        onClick={() => router.push(`/appointments/${appointment._id}`)}
                                                    >
                                                        View
                                                    </Button>
                                                </Td>
                                            </Tr>
                                        ))}
                                    </Tbody>
                                </Table>
                            </Box>
                        ) : (
                            <Text color="gray.500" fontStyle="italic">No appointments found for this patient</Text>
                        )}
                    </VStack>
                </CardBody>
            </Card>

            {/* Delete Confirmation Dialog */}
            <AlertDialog
                isOpen={isOpen}
                leastDestructiveRef={cancelRef}
                onClose={onClose}
            >
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader fontSize="lg" fontWeight="bold">
                            Delete Patient
                        </AlertDialogHeader>

                        <AlertDialogBody>
                            Are you sure you want to delete this patient? This action cannot be undone.
                        </AlertDialogBody>

                        <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={onClose}>
                                Cancel
                            </Button>
                            <Button colorScheme="red" onClick={handleDelete} ml={3}>
                                Delete
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </Box>
    );
}
