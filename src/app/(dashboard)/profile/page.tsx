'use client';

import React, { useEffect, useState } from 'react';
import {
    Box,
    Button,
    FormControl,
    FormLabel,
    Input,
    VStack,
    Heading,
    useToast,
    Spinner,
    Center,
    useColorModeValue,
    HStack,
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
    Select,
    Text,
    Divider,
    Grid,
    GridItem,
    IconButton,
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon } from '@chakra-ui/icons';
import { useAuth } from '@/contexts/AuthContext';

interface AvailabilitySlot {
    start: string;
    end: string;
}

interface DaySchedule {
    dayOfWeek: string;
    open: string;
    close: string;
    slotDuration: string;
}

export default function ProfilePage() {
    const { user, updateProfile, loading } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        mobile: '',
        phone: '',
        specialization: '',
        department: '',
        durationMinutes: 30,
    });
    const [availabilitySchedule, setAvailabilitySchedule] = useState<DaySchedule[]>([]);
    const [saving, setSaving] = useState(false);
    const toast = useToast();
    const cardBg = useColorModeValue('white', 'gray.800');

    const daysOfWeek = [
        'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
    ];

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                mobile: user.mobile || '',
                phone: user.phone || '',
                specialization: user.specialization || '',
                department: user.department || '',
                durationMinutes: user.durationMinutes || 30,
            });

            // Initialize operating hours
            if (user.operatingHours) {
                const schedule = daysOfWeek.map(day => ({
                    dayOfWeek: day,
                    open: user.operatingHours[day]?.open || '09:00',
                    close: user.operatingHours[day]?.close || '17:00',
                    slotDuration: user.operatingHours[day]?.slotDuration || '30',
                }));
                setAvailabilitySchedule(schedule);
            } else {
                // Initialize with default operating hours
                const defaultSchedule = daysOfWeek.map(day => ({
                    dayOfWeek: day,
                    open: '09:00',
                    close: day === 'Saturday' ? '14:00' : '17:00',
                    slotDuration: '30',
                }));
                setAvailabilitySchedule(defaultSchedule);
            }
        }
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.name === 'durationMinutes' ? parseInt(e.target.value) : e.target.value,
        });
    };

    const handleOperatingHoursChange = (dayIndex: number, field: 'open' | 'close' | 'slotDuration', value: string) => {
        const newSchedule = [...availabilitySchedule];
        newSchedule[dayIndex][field] = value;
        setAvailabilitySchedule(newSchedule);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            // Convert availabilitySchedule to operatingHours format
            const operatingHours: any = {};
            availabilitySchedule.forEach(day => {
                operatingHours[day.dayOfWeek] = {
                    open: day.open,
                    close: day.close,
                    slotDuration: day.slotDuration,
                };
            });

            const profileData = {
                ...formData,
                operatingHours,
            };
            await updateProfile(profileData);
            toast({
                title: 'Profile updated successfully',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
        } catch (error: any) {
            toast({
                title: 'Error updating profile',
                description: error.response?.data?.message || 'Failed to update profile',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setSaving(false);
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
            <Heading size="lg" mb={6}>
                Profile Settings
            </Heading>

            <Box bg={cardBg} borderRadius="xl" maxW="800px">
                <Tabs variant="enclosed">
                    <TabList>
                        <Tab>Basic Information</Tab>
                        <Tab>Availability & Slots</Tab>
                    </TabList>

                    <TabPanels>
                        <TabPanel>
                            <form onSubmit={handleSubmit}>
                                <VStack spacing={4} align="stretch">
                                    <FormControl isRequired>
                                        <FormLabel>Name</FormLabel>
                                        <Input
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="Dr. John Doe"
                                        />
                                    </FormControl>

                                    <FormControl isRequired>
                                        <FormLabel>Email</FormLabel>
                                        <Input
                                            name="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="doctor@example.com"
                                        />
                                    </FormControl>

                                    <FormControl>
                                        <FormLabel>Phone</FormLabel>
                                        <Input
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            placeholder="1234567890"
                                        />
                                    </FormControl>

                                    <FormControl>
                                        <FormLabel>Mobile</FormLabel>
                                        <Input
                                            name="mobile"
                                            value={formData.mobile}
                                            onChange={handleChange}
                                            placeholder="1234567890"
                                        />
                                    </FormControl>

                                    <FormControl>
                                        <FormLabel>Specialization</FormLabel>
                                        <Input
                                            name="specialization"
                                            value={formData.specialization}
                                            onChange={handleChange}
                                            placeholder="e.g., Cardiology"
                                        />
                                    </FormControl>

                                    <FormControl>
                                        <FormLabel>Department</FormLabel>
                                        <Input
                                            name="department"
                                            value={formData.department}
                                            onChange={handleChange}
                                            placeholder="e.g., Internal Medicine"
                                        />
                                    </FormControl>

                                    <FormControl>
                                        <FormLabel>Appointment Duration (minutes)</FormLabel>
                                        <Select
                                            name="durationMinutes"
                                            value={formData.durationMinutes}
                                            onChange={handleChange}
                                        >
                                            <option value={15}>15 minutes</option>
                                            <option value={30}>30 minutes</option>
                                            <option value={45}>45 minutes</option>
                                            <option value={60}>60 minutes</option>
                                        </Select>
                                    </FormControl>

                                    <HStack spacing={4} pt={4}>
                                        <Button
                                            type="submit"
                                            colorScheme="blue"
                                            isLoading={saving}
                                            loadingText="Saving..."
                                        >
                                            Save Changes
                                        </Button>
                                        <Button variant="outline" onClick={() => {
                                            if (user) {
                                                setFormData({
                                                    name: user.name || '',
                                                    email: user.email || '',
                                                    mobile: user.mobile || '',
                                                    phone: user.phone || '',
                                                    specialization: user.specialization || '',
                                                    department: user.department || '',
                                                    durationMinutes: user.durationMinutes || 30,
                                                });
                                            }
                                        }}>
                                            Cancel
                                        </Button>
                                    </HStack>
                                </VStack>
                            </form>
                        </TabPanel>

                        <TabPanel>
                            <VStack spacing={6} align="stretch">
                                <Text fontSize="sm" color="gray.600">
                                    Set your weekly availability schedule. Patients can only book appointments during your available time slots.
                                </Text>

                                {availabilitySchedule.map((daySchedule, dayIndex) => (
                                    <Box key={daySchedule.dayOfWeek} border="1px" borderColor="gray.200" borderRadius="md" p={4}>
                                        <Heading size="md" mb={3}>{daySchedule.dayOfWeek}</Heading>

                                        <HStack spacing={4}>
                                            <FormControl>
                                                <FormLabel fontSize="sm">Open Time</FormLabel>
                                                <Input
                                                    type="time"
                                                    value={daySchedule.open}
                                                    onChange={(e) => handleOperatingHoursChange(dayIndex, 'open', e.target.value)}
                                                    size="sm"
                                                />
                                            </FormControl>

                                            <FormControl>
                                                <FormLabel fontSize="sm">Close Time</FormLabel>
                                                <Input
                                                    type="time"
                                                    value={daySchedule.close}
                                                    onChange={(e) => handleOperatingHoursChange(dayIndex, 'close', e.target.value)}
                                                    size="sm"
                                                />
                                            </FormControl>

                                            <FormControl>
                                                <FormLabel fontSize="sm">Slot Duration (minutes)</FormLabel>
                                                <Select
                                                    value={daySchedule.slotDuration}
                                                    onChange={(e) => handleOperatingHoursChange(dayIndex, 'slotDuration', e.target.value)}
                                                    size="sm"
                                                >
                                                    <option value="15">15 min</option>
                                                    <option value="30">30 min</option>
                                                    <option value="45">45 min</option>
                                                    <option value="60">60 min</option>
                                                </Select>
                                            </FormControl>
                                        </HStack>
                                    </Box>
                                ))}

                                <Divider />

                                <HStack spacing={4} justify="end">
                                    <Button
                                        colorScheme="blue"
                                        onClick={handleSubmit}
                                        isLoading={saving}
                                        loadingText="Saving..."
                                    >
                                        Save Availability
                                    </Button>
                                </HStack>
                            </VStack>
                        </TabPanel>
                    </TabPanels>
                </Tabs>
            </Box>
        </Box>
    );
}
