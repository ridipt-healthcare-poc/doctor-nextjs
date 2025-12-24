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
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
} from '@chakra-ui/react';
import { FiArrowLeft, FiEdit, FiTrash2, FiCalendar, FiClock, FiUser, FiPhone, FiFileText, FiMoreVertical } from 'react-icons/fi';
import { appointmentService } from '@/services/appointmentService';
import { useRouter, useParams } from 'next/navigation';

export default function AppointmentDetailPage() {
    const [appointment, setAppointment] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const cancelRef = React.useRef<HTMLButtonElement>(null);
    const toast = useToast();
    const router = useRouter();
    const params = useParams();
    const appointmentId = params.id as string;

    const cardBg = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.600');
    const labelColor = useColorModeValue('gray.600', 'gray.400');

    useEffect(() => {
        if (appointmentId) {
            fetchAppointment();
        }
    }, [appointmentId]);

    const fetchAppointment = async () => {
        try {
            const response = await appointmentService.getAppointmentById(appointmentId);
            setAppointment(response.data || response.appointment);
        } catch (error: any) {
            toast({
                title: 'Error fetching appointment',
                description: error.response?.data?.message || 'Failed to load appointment details',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
            router.push('/appointments');
        } finally {
            setLoading(false);
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

    const handleDelete = async () => {
        try {
            await appointmentService.deleteAppointment(appointmentId);
            toast({
                title: 'Appointment deleted',
                description: 'The appointment has been successfully deleted.',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
            router.push('/appointments');
        } catch (error: any) {
            toast({
                title: 'Error deleting appointment',
                description: error.response?.data?.message || 'Failed to delete appointment',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        } finally {
            onClose();
        }
    };

    const handleUpdateStatus = async (newStatus: string) => {
        try {
            await appointmentService.updateAppointmentStatus(appointmentId, newStatus);
            toast({
                title: 'Status updated',
                description: `Appointment status changed to ${newStatus}.`,
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
            fetchAppointment(); // Refresh the appointment data
        } catch (error: any) {
            toast({
                title: 'Error updating status',
                description: error.response?.data?.message || 'Failed to update appointment status',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        }
    };

    if (loading) {
        return (
            <Center h="400px">
                <Spinner size="xl" color="blue.500" />
            </Center>
        );
    }

    if (!appointment) {
        return (
            <Box>
                <Text>Appointment not found</Text>
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
                        onClick={() => router.push('/appointments')}
                    >
                        Back to Appointments
                    </Button>
                    <Heading size="lg">Appointment Details</Heading>
                </HStack>
                <HStack spacing={3}>
                    <Button
                        leftIcon={<FiEdit />}
                        colorScheme="blue"
                        onClick={() => router.push(`/appointments/${appointmentId}/edit`)}
                    >
                        Edit
                    </Button>
                    <Menu>
                        <MenuButton
                            as={Button}
                            rightIcon={<FiMoreVertical />}
                            variant="outline"
                        >
                            Actions
                        </MenuButton>
                        <MenuList>
                            {appointment.status === 'Scheduled' && (
                                <>
                                    <MenuItem onClick={() => handleUpdateStatus('Confirmed')}>
                                        Mark as Confirmed
                                    </MenuItem>
                                    <MenuItem onClick={() => handleUpdateStatus('Completed')}>
                                        Mark as Completed
                                    </MenuItem>
                                </>
                            )}
                            {appointment.status === 'Confirmed' && (
                                <MenuItem onClick={() => handleUpdateStatus('Completed')}>
                                    Mark as Completed
                                </MenuItem>
                            )}
                            <Divider />
                            <MenuItem
                                icon={<FiTrash2 />}
                                color="red.500"
                                onClick={onOpen}
                            >
                                Delete Appointment
                            </MenuItem>
                        </MenuList>
                    </Menu>
                </HStack>
            </HStack>

            {/* Main Content */}
            <Grid templateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }} gap={6}>
                {/* Appointment Information */}
                <GridItem>
                    <Card bg={cardBg} borderRadius="xl" shadow="sm">
                        <CardBody>
                            <VStack align="stretch" spacing={4}>
                                <HStack justify="space-between">
                                    <Heading size="md">Appointment Information</Heading>
                                    <Badge colorScheme={getStatusColor(appointment.status)} fontSize="md" px={3} py={1}>
                                        {appointment.status}
                                    </Badge>
                                </HStack>
                                <Divider />

                                <Box>
                                    <HStack spacing={2} mb={2}>
                                        <FiCalendar color="gray" />
                                        <Text fontWeight="semibold" color={labelColor}>Date</Text>
                                    </HStack>
                                    <Text fontSize="lg">
                                        {new Date(appointment.appointmentDate).toLocaleDateString('en-US', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </Text>
                                </Box>

                                <Box>
                                    <HStack spacing={2} mb={2}>
                                        <FiClock color="gray" />
                                        <Text fontWeight="semibold" color={labelColor}>Time</Text>
                                    </HStack>
                                    <Text fontSize="lg">{appointment.appointmentTime}</Text>
                                </Box>

                                {appointment.reason && (
                                    <Box>
                                        <HStack spacing={2} mb={2}>
                                            <FiFileText color="gray" />
                                            <Text fontWeight="semibold" color={labelColor}>Reason for Visit</Text>
                                        </HStack>
                                        <Text>{appointment.reason}</Text>
                                    </Box>
                                )}

                                {appointment.notes && (
                                    <Box>
                                        <HStack spacing={2} mb={2}>
                                            <FiFileText color="gray" />
                                            <Text fontWeight="semibold" color={labelColor}>Notes</Text>
                                        </HStack>
                                        <Text>{appointment.notes}</Text>
                                    </Box>
                                )}
                            </VStack>
                        </CardBody>
                    </Card>
                </GridItem>

                {/* Patient Information */}
                <GridItem>
                    <Card bg={cardBg} borderRadius="xl" shadow="sm">
                        <CardBody>
                            <VStack align="stretch" spacing={4}>
                                <Heading size="md">Patient Information</Heading>
                                <Divider />

                                <Box>
                                    <HStack spacing={2} mb={2}>
                                        <FiUser color="gray" />
                                        <Text fontWeight="semibold" color={labelColor}>Name</Text>
                                    </HStack>
                                    <Text fontSize="lg" fontWeight="medium">
                                        {appointment.patientId?.fullName || appointment.patient?.fullName || 'N/A'}
                                    </Text>
                                </Box>

                                {(appointment.patientId?.mobile || appointment.patient?.mobile) && (
                                    <Box>
                                        <HStack spacing={2} mb={2}>
                                            <FiPhone color="gray" />
                                            <Text fontWeight="semibold" color={labelColor}>Phone</Text>
                                        </HStack>
                                        <Text>{appointment.patientId?.mobile || appointment.patient?.mobile}</Text>
                                    </Box>
                                )}

                                {(appointment.patientId?.email || appointment.patient?.email) && (
                                    <Box>
                                        <Text fontWeight="semibold" color={labelColor} mb={2}>Email</Text>
                                        <Text>{appointment.patientId?.email || appointment.patient?.email}</Text>
                                    </Box>
                                )}

                                {(appointment.patientId?.gender || appointment.patient?.gender) && (
                                    <Box>
                                        <Text fontWeight="semibold" color={labelColor} mb={2}>Gender</Text>
                                        <Text>{appointment.patientId?.gender || appointment.patient?.gender}</Text>
                                    </Box>
                                )}

                                {appointment.patientId?._id && (
                                    <Button
                                        variant="outline"
                                        colorScheme="blue"
                                        onClick={() => router.push(`/patients/${appointment.patientId._id}`)}
                                        mt={2}
                                    >
                                        View Patient Profile
                                    </Button>
                                )}
                            </VStack>
                        </CardBody>
                    </Card>
                </GridItem>
            </Grid>

            {/* Delete Confirmation Dialog */}
            <AlertDialog
                isOpen={isOpen}
                leastDestructiveRef={cancelRef}
                onClose={onClose}
            >
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader fontSize="lg" fontWeight="bold">
                            Delete Appointment
                        </AlertDialogHeader>

                        <AlertDialogBody>
                            Are you sure you want to delete this appointment? This action cannot be undone.
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
