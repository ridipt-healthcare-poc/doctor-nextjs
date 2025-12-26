'use client';

import React, { useEffect, useState } from 'react';
import {
    Box,
    Button,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Badge,
    Heading,
    HStack,
    useToast,
    Spinner,
    Center,
    Text,
    useColorModeValue,
    Tabs,
    TabList,
    Tab,
    TabPanels,
    TabPanel,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    IconButton,
    AlertDialog,
    AlertDialogBody,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogContent,
    AlertDialogOverlay,
    useDisclosure,
} from '@chakra-ui/react';
import { FiPlus, FiMoreVertical, FiEdit, FiTrash2, FiEye } from 'react-icons/fi';
import { appointmentService } from '@/services/appointmentService';
import { useRouter } from 'next/navigation';

export default function AppointmentsPage() {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(0);
    const [deleteAppointmentId, setDeleteAppointmentId] = useState(null);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const cancelRef = React.useRef<HTMLButtonElement>(null);
    const toast = useToast();
    const router = useRouter();
    const cardBg = useColorModeValue('white', 'gray.800');
    const theadBg = useColorModeValue('gray.50', 'gray.700');

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            const response = await appointmentService.getAppointments();
            setAppointments(response.data || response.appointments || []);
        } catch (error: any) {
            toast({
                title: 'Error fetching appointments',
                description: error.response?.data?.message || 'Failed to load appointments',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
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

    const filterAppointments = (appointments: any[], tabIndex: number) => {
        const statusMap = ['all', 'Scheduled', 'Completed', 'Cancelled'];
        const status = statusMap[tabIndex];
        if (status === 'all') return appointments;
        return appointments.filter((appointment: any) =>
            appointment.status === status
        );
    };

    const handleDeleteAppointment = async () => {
        if (!deleteAppointmentId) return;

        try {
            await appointmentService.deleteAppointment(deleteAppointmentId);
            toast({
                title: 'Appointment deleted',
                description: 'The appointment has been successfully deleted.',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
            fetchAppointments(); // Refresh the list
        } catch (error: any) {
            toast({
                title: 'Error deleting appointment',
                description: error.response?.data?.message || 'Failed to delete appointment',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setDeleteAppointmentId(null);
            onClose();
        }
    };

    const handleUpdateStatus = async (appointmentId: string, newStatus: string) => {
        try {
            await appointmentService.updateAppointmentStatus(appointmentId, newStatus);
            toast({
                title: 'Status updated',
                description: `Appointment status changed to ${newStatus}.`,
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
            fetchAppointments(); // Refresh the list
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

    const getAppointmentCounts = () => {
        const all = appointments.length;
        const scheduled = appointments.filter((app: any) => app.status === 'Scheduled').length;
        const completed = appointments.filter((app: any) => app.status === 'Completed').length;
        const cancelled = appointments.filter((app: any) => app.status === 'Cancelled').length;

        return { all, scheduled, completed, cancelled };
    };

    const counts = getAppointmentCounts();
    const filteredAppointments = filterAppointments(appointments, activeTab);

    if (loading) {
        return (
            <Center h="400px">
                <Spinner size="xl" color="blue.500" />
            </Center>
        );
    }

    return (
        <Box>
            <HStack justify="space-between" mb={6}>
                <Heading size="lg">Appointments</Heading>
                <Button
                    leftIcon={<FiPlus />}
                    colorScheme="blue"
                    onClick={() => router.push('/appointments/create')}
                >
                    New Appointment
                </Button>
            </HStack>

            <Tabs index={activeTab} onChange={setActiveTab}>
                <TabList mb={4}>
                    <Tab>All ({counts.all})</Tab>
                    <Tab>Scheduled ({counts.scheduled})</Tab>
                    <Tab>Completed ({counts.completed})</Tab>
                    <Tab>Cancelled ({counts.cancelled})</Tab>
                </TabList>

                <TabPanels>
                    {/* All Appointments Tab */}
                    <TabPanel>
                        {filterAppointments(appointments, 0).length === 0 ? (
                            <Box
                                bg={cardBg}
                                p={8}
                                borderRadius="xl"
                                textAlign="center"
                            >
                                <Text color="gray.500">
                                    No appointments found. Create your first appointment!
                                </Text>
                            </Box>
                        ) : (
                            <Box bg={cardBg} borderRadius="xl" overflow="hidden">
                                <Table variant="simple">
                                    <Thead bg={theadBg}>
                                        <Tr>
                                            <Th>Patient</Th>
                                            <Th>Date</Th>
                                            <Th>Time</Th>
                                            <Th>Status</Th>
                                            <Th>Reason</Th>
                                            <Th>Actions</Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {filterAppointments(appointments, 0).map((appointment: any) => (
                                            <Tr key={appointment._id}>
                                                <Td fontWeight="medium">
                                                    {appointment.patientId?.fullName || appointment.patient?.fullName || 'N/A'}
                                                </Td>
                                                <Td>{new Date(appointment.appointmentDate).toLocaleDateString()}</Td>
                                                <Td>{new Date(appointment.appointmentDateTime || appointment.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Td>
                                                <Td>
                                                    <Badge colorScheme={getStatusColor(appointment.status)}>
                                                        {appointment.status}
                                                    </Badge>
                                                </Td>
                                                <Td>{appointment.reason || '-'}</Td>
                                                <Td>
                                                    <Menu>
                                                        <MenuButton
                                                            as={IconButton}
                                                            aria-label="Options"
                                                            icon={<FiMoreVertical />}
                                                            variant="ghost"
                                                            size="sm"
                                                        />
                                                        <MenuList>
                                                            <MenuItem
                                                                icon={<FiEye />}
                                                                onClick={() => router.push(`/appointments/${appointment._id}`)}
                                                            >
                                                                View Details
                                                            </MenuItem>
                                                            <MenuItem
                                                                icon={<FiEdit />}
                                                                onClick={() => router.push(`/appointments/${appointment._id}/edit`)}
                                                            >
                                                                Update
                                                            </MenuItem>
                                                            {appointment.status === 'Scheduled' && (
                                                                <>
                                                                    <MenuItem
                                                                        onClick={() => handleUpdateStatus(appointment._id, 'Confirmed')}
                                                                    >
                                                                        Mark as Confirmed
                                                                    </MenuItem>
                                                                    <MenuItem
                                                                        onClick={() => handleUpdateStatus(appointment._id, 'Completed')}
                                                                    >
                                                                        Mark as Completed
                                                                    </MenuItem>
                                                                </>
                                                            )}
                                                            {appointment.status === 'Confirmed' && (
                                                                <MenuItem
                                                                    onClick={() => handleUpdateStatus(appointment._id, 'Completed')}
                                                                >
                                                                    Mark as Completed
                                                                </MenuItem>
                                                            )}
                                                            <MenuItem
                                                                icon={<FiTrash2 />}
                                                                color="red.500"
                                                                onClick={() => {
                                                                    setDeleteAppointmentId(appointment._id);
                                                                    onOpen();
                                                                }}
                                                            >
                                                                Delete
                                                            </MenuItem>
                                                        </MenuList>
                                                    </Menu>
                                                </Td>
                                            </Tr>
                                        ))}
                                    </Tbody>
                                </Table>
                            </Box>
                        )}
                    </TabPanel>

                    {/* Scheduled Appointments Tab */}
                    <TabPanel>
                        {filterAppointments(appointments, 1).length === 0 ? (
                            <Box
                                bg={cardBg}
                                p={8}
                                borderRadius="xl"
                                textAlign="center"
                            >
                                <Text color="gray.500">
                                    No scheduled appointments found.
                                </Text>
                            </Box>
                        ) : (
                            <Box bg={cardBg} borderRadius="xl" overflow="hidden">
                                <Table variant="simple">
                                    <Thead bg={theadBg}>
                                        <Tr>
                                            <Th>Patient</Th>
                                            <Th>Date</Th>
                                            <Th>Time</Th>
                                            <Th>Status</Th>
                                            <Th>Reason</Th>
                                            <Th>Actions</Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {filterAppointments(appointments, 1).map((appointment: any) => (
                                            <Tr key={appointment._id}>
                                                <Td fontWeight="medium">
                                                    {appointment.patientId?.fullName || appointment.patient?.fullName || 'N/A'}
                                                </Td>
                                                <Td>{new Date(appointment.appointmentDate).toLocaleDateString()}</Td>
                                                <Td>{new Date(appointment.appointmentDateTime || appointment.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Td>
                                                <Td>
                                                    <Badge colorScheme={getStatusColor(appointment.status)}>
                                                        {appointment.status}
                                                    </Badge>
                                                </Td>
                                                <Td>{appointment.reason || '-'}</Td>
                                                <Td>
                                                    <Menu>
                                                        <MenuButton
                                                            as={IconButton}
                                                            aria-label="Options"
                                                            icon={<FiMoreVertical />}
                                                            variant="ghost"
                                                            size="sm"
                                                        />
                                                        <MenuList>
                                                            <MenuItem
                                                                icon={<FiEye />}
                                                                onClick={() => router.push(`/appointments/${appointment._id}`)}
                                                            >
                                                                View Details
                                                            </MenuItem>
                                                            <MenuItem
                                                                icon={<FiEdit />}
                                                                onClick={() => router.push(`/appointments/${appointment._id}/edit`)}
                                                            >
                                                                Update
                                                            </MenuItem>
                                                            {appointment.status === 'Scheduled' && (
                                                                <>
                                                                    <MenuItem
                                                                        onClick={() => handleUpdateStatus(appointment._id, 'Confirmed')}
                                                                    >
                                                                        Mark as Confirmed
                                                                    </MenuItem>
                                                                    <MenuItem
                                                                        onClick={() => handleUpdateStatus(appointment._id, 'Completed')}
                                                                    >
                                                                        Mark as Completed
                                                                    </MenuItem>
                                                                </>
                                                            )}
                                                            {appointment.status === 'Confirmed' && (
                                                                <MenuItem
                                                                    onClick={() => handleUpdateStatus(appointment._id, 'Completed')}
                                                                >
                                                                    Mark as Completed
                                                                </MenuItem>
                                                            )}
                                                            <MenuItem
                                                                icon={<FiTrash2 />}
                                                                color="red.500"
                                                                onClick={() => {
                                                                    setDeleteAppointmentId(appointment._id);
                                                                    onOpen();
                                                                }}
                                                            >
                                                                Delete
                                                            </MenuItem>
                                                        </MenuList>
                                                    </Menu>
                                                </Td>
                                            </Tr>
                                        ))}
                                    </Tbody>
                                </Table>
                            </Box>
                        )}
                    </TabPanel>

                    {/* Completed Appointments Tab */}
                    <TabPanel>
                        {filterAppointments(appointments, 2).length === 0 ? (
                            <Box
                                bg={cardBg}
                                p={8}
                                borderRadius="xl"
                                textAlign="center"
                            >
                                <Text color="gray.500">
                                    No completed appointments found.
                                </Text>
                            </Box>
                        ) : (
                            <Box bg={cardBg} borderRadius="xl" overflow="hidden">
                                <Table variant="simple">
                                    <Thead bg={theadBg}>
                                        <Tr>
                                            <Th>Patient</Th>
                                            <Th>Date</Th>
                                            <Th>Time</Th>
                                            <Th>Status</Th>
                                            <Th>Reason</Th>
                                            <Th>Actions</Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {filterAppointments(appointments, 2).map((appointment: any) => (
                                            <Tr key={appointment._id}>
                                                <Td fontWeight="medium">
                                                    {appointment.patientId?.fullName || appointment.patient?.fullName || 'N/A'}
                                                </Td>
                                                <Td>{new Date(appointment.appointmentDate).toLocaleDateString()}</Td>
                                                <Td>{new Date(appointment.appointmentDateTime || appointment.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Td>
                                                <Td>
                                                    <Badge colorScheme={getStatusColor(appointment.status)}>
                                                        {appointment.status}
                                                    </Badge>
                                                </Td>
                                                <Td>{appointment.reason || '-'}</Td>
                                                <Td>
                                                    <Menu>
                                                        <MenuButton
                                                            as={IconButton}
                                                            aria-label="Options"
                                                            icon={<FiMoreVertical />}
                                                            variant="ghost"
                                                            size="sm"
                                                        />
                                                        <MenuList>
                                                            <MenuItem
                                                                icon={<FiEye />}
                                                                onClick={() => router.push(`/appointments/${appointment._id}`)}
                                                            >
                                                                View Details
                                                            </MenuItem>
                                                            <MenuItem
                                                                icon={<FiEdit />}
                                                                onClick={() => router.push(`/appointments/${appointment._id}/edit`)}
                                                            >
                                                                Update
                                                            </MenuItem>
                                                            <MenuItem
                                                                icon={<FiTrash2 />}
                                                                color="red.500"
                                                                onClick={() => {
                                                                    setDeleteAppointmentId(appointment._id);
                                                                    onOpen();
                                                                }}
                                                            >
                                                                Delete
                                                            </MenuItem>
                                                        </MenuList>
                                                    </Menu>
                                                </Td>
                                            </Tr>
                                        ))}
                                    </Tbody>
                                </Table>
                            </Box>
                        )}
                    </TabPanel>

                    {/* Cancelled Appointments Tab */}
                    <TabPanel>
                        {filterAppointments(appointments, 3).length === 0 ? (
                            <Box
                                bg={cardBg}
                                p={8}
                                borderRadius="xl"
                                textAlign="center"
                            >
                                <Text color="gray.500">
                                    No cancelled appointments found.
                                </Text>
                            </Box>
                        ) : (
                            <Box bg={cardBg} borderRadius="xl" overflow="hidden">
                                <Table variant="simple">
                                    <Thead bg={theadBg}>
                                        <Tr>
                                            <Th>Patient</Th>
                                            <Th>Date</Th>
                                            <Th>Time</Th>
                                            <Th>Status</Th>
                                            <Th>Reason</Th>
                                            <Th>Actions</Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {filterAppointments(appointments, 3).map((appointment: any) => (
                                            <Tr key={appointment._id}>
                                                <Td fontWeight="medium">
                                                    {appointment.patientId?.fullName || appointment.patient?.fullName || 'N/A'}
                                                </Td>
                                                <Td>{new Date(appointment.appointmentDate).toLocaleDateString()}</Td>
                                                <Td>{new Date(appointment.appointmentDateTime || appointment.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Td>
                                                <Td>
                                                    <Badge colorScheme={getStatusColor(appointment.status)}>
                                                        {appointment.status}
                                                    </Badge>
                                                </Td>
                                                <Td>{appointment.reason || '-'}</Td>
                                                <Td>
                                                    <Menu>
                                                        <MenuButton
                                                            as={IconButton}
                                                            aria-label="Options"
                                                            icon={<FiMoreVertical />}
                                                            variant="ghost"
                                                            size="sm"
                                                        />
                                                        <MenuList>
                                                            <MenuItem
                                                                icon={<FiEye />}
                                                                onClick={() => router.push(`/appointments/${appointment._id}`)}
                                                            >
                                                                View Details
                                                            </MenuItem>
                                                            <MenuItem
                                                                icon={<FiEdit />}
                                                                onClick={() => router.push(`/appointments/${appointment._id}/edit`)}
                                                            >
                                                                Update
                                                            </MenuItem>
                                                            <MenuItem
                                                                icon={<FiTrash2 />}
                                                                color="red.500"
                                                                onClick={() => {
                                                                    setDeleteAppointmentId(appointment._id);
                                                                    onOpen();
                                                                }}
                                                            >
                                                                Delete
                                                            </MenuItem>
                                                        </MenuList>
                                                    </Menu>
                                                </Td>
                                            </Tr>
                                        ))}
                                    </Tbody>
                                </Table>
                            </Box>
                        )}
                    </TabPanel>
                </TabPanels>
            </Tabs>

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
                            <Button colorScheme="red" onClick={handleDeleteAppointment} ml={3}>
                                Delete
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </Box>
    );
}
