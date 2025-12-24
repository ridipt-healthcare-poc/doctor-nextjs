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
import { patientService } from '@/services/patientService';
import { useRouter } from 'next/navigation';

export default function PatientsPage() {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deletePatientId, setDeletePatientId] = useState(null);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const cancelRef = React.useRef<HTMLButtonElement>(null);
    const toast = useToast();
    const router = useRouter();
    const cardBg = useColorModeValue('white', 'gray.800');
    const theadBg = useColorModeValue('gray.50', 'gray.700');

    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        try {
            const response = await patientService.getPatients();
            setPatients(response.data || response.patients || []);
        } catch (error: any) {
            toast({
                title: 'Error fetching patients',
                description: error.response?.data?.message || 'Failed to load patients',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDeletePatient = async () => {
        if (!deletePatientId) return;

        try {
            await patientService.deletePatient(deletePatientId);
            toast({
                title: 'Patient deleted',
                description: 'The patient has been successfully deleted.',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
            fetchPatients(); // Refresh the list
        } catch (error: any) {
            toast({
                title: 'Error deleting patient',
                description: error.response?.data?.message || 'Failed to delete patient',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setDeletePatientId(null);
            onClose();
        }
    };

    const handleToggleStatus = async (patientId: string) => {
        try {
            await patientService.togglePatientStatus(patientId);
            toast({
                title: 'Status updated',
                description: 'Patient status has been updated.',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
            fetchPatients(); // Refresh the list
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
                <Heading size="lg">Patients</Heading>
                <Button
                    leftIcon={<FiPlus />}
                    colorScheme="blue"
                    onClick={() => router.push('/patients/create')}
                >
                    Add Patient
                </Button>
            </HStack>

            {patients.length === 0 ? (
                <Box
                    bg={cardBg}
                    p={8}
                    borderRadius="xl"
                    textAlign="center"
                >
                    <Text color="gray.500">No patients found. Add your first patient!</Text>
                </Box>
            ) : (
                <Box bg={cardBg} borderRadius="xl" overflow="hidden">
                    <Table variant="simple">
                        <Thead bg={theadBg}>
                            <Tr>
                                <Th>Name</Th>
                                <Th>Phone</Th>
                                <Th>Email</Th>
                                <Th>Gender</Th>
                                <Th>Status</Th>
                                <Th>Actions</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {patients.map((patient: any) => (
                                <Tr key={patient._id}>
                                    <Td fontWeight="medium">
                                        {patient.fullName}
                                    </Td>
                                    <Td>{patient.mobile}</Td>
                                    <Td>{patient.email || '-'}</Td>
                                    <Td>{patient.gender || '-'}</Td>
                                    <Td>
                                        <Badge colorScheme={patient.isActive ? 'green' : 'gray'}>
                                            {patient.isActive ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </Td>
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
                                                    onClick={() => router.push(`/patients/${patient._id}`)}
                                                >
                                                    View Details
                                                </MenuItem>
                                                <MenuItem
                                                    icon={<FiEdit />}
                                                    onClick={() => router.push(`/patients/${patient._id}/edit`)}
                                                >
                                                    Edit
                                                </MenuItem>
                                                <MenuItem
                                                    onClick={() => handleToggleStatus(patient._id)}
                                                >
                                                    {patient.isActive ? 'Deactivate' : 'Activate'}
                                                </MenuItem>
                                                <MenuItem
                                                    icon={<FiTrash2 />}
                                                    color="red.500"
                                                    onClick={() => {
                                                        setDeletePatientId(patient._id);
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
                            <Button colorScheme="red" onClick={handleDeletePatient} ml={3}>
                                Delete
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </Box>
    );
}
