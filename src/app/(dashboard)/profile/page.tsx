'use client';

import React, { useState, useEffect } from 'react';
import {
    Box,
    VStack,
    HStack,
    Heading,
    Text,
    Button,
    Input,
    FormControl,
    FormLabel,
    Select,
    Textarea,
    Avatar,
    Badge,
    useToast,
    Spinner,
    Center,
    useColorModeValue,
    Icon,
    Grid,
    GridItem,
    IconButton,
    Tag,
    TagLabel,
    TagCloseButton,
    Wrap,
    WrapItem,
    Divider,
} from '@chakra-ui/react';
import { FiEdit2, FiSave, FiX, FiUser, FiBriefcase, FiDollarSign, FiClock, FiMapPin, FiPhone, FiMail } from 'react-icons/fi';
import { doctorProfileApi } from '@/utils/api';

interface DoctorProfile {
    _id: string;
    name: string;
    email: string;
    phone: string;
    mobile?: string;
    gender?: string;
    dateOfBirth?: string;
    age?: string;
    specialization?: string;
    qualification?: string;
    qualifications?: string[];
    experience?: number;
    yearsOfExperience?: number;
    licenseNumber?: string;
    medicalLicenseNumber?: string;
    department?: string;
    bio?: string;
    languagesSpoken?: string[];
    preferredCommunicationMethod?: string;
    consultationFee?: number;
    consultationFees?: {
        onsite?: number;
        voiceCall?: number;
        videoCall?: number;
        homeVisit?: number;
        followUpFee?: number;
    };
    operatingHours?: any;
    durationMinutes?: number;
    facilityId?: {
        name: string;
        address?: any;
        phone?: string;
        email?: string;
        facilityType?: string;
    };
    locationId?: {
        branchName: string;
        branchCode: string;
    };
}

export default function DoctorProfilePage() {
    const [profile, setProfile] = useState<DoctorProfile | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState<Partial<DoctorProfile>>({});
    const [newLanguage, setNewLanguage] = useState('');
    const [newQualification, setNewQualification] = useState('');
    const toast = useToast();

    // Color mode values
    const bgGradient = useColorModeValue(
        'linear(to-br, blue.50, cyan.50, teal.50)',
        'linear(to-br, gray.900, blue.900, teal.900)'
    );
    const cardBg = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.700');
    const headingColor = useColorModeValue('blue.700', 'blue.200');
    const textColor = useColorModeValue('gray.800', 'white');
    const mutedColor = useColorModeValue('gray.600', 'gray.400');
    const sectionBg = useColorModeValue('gray.50', 'gray.700');

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await doctorProfileApi.getProfile();
            setProfile(response.data.data);
            setFormData(response.data.data);
        } catch (error: any) {
            toast({
                title: 'Error fetching profile',
                description: error.response?.data?.message || 'Failed to load profile',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await doctorProfileApi.updateProfile(formData);
            toast({
                title: 'Profile updated successfully',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
            setIsEditing(false);
            fetchProfile();
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

    const handleCancel = () => {
        setFormData(profile || {});
        setIsEditing(false);
    };

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const addLanguage = () => {
        if (newLanguage.trim()) {
            const languages = formData.languagesSpoken || [];
            handleChange('languagesSpoken', [...languages, newLanguage.trim()]);
            setNewLanguage('');
        }
    };

    const removeLanguage = (index: number) => {
        const languages = formData.languagesSpoken || [];
        handleChange('languagesSpoken', languages.filter((_, i) => i !== index));
    };

    const addQualification = () => {
        if (newQualification.trim()) {
            const qualifications = formData.qualifications || [];
            handleChange('qualifications', [...qualifications, newQualification.trim()]);
            setNewQualification('');
        }
    };

    const removeQualification = (index: number) => {
        const qualifications = formData.qualifications || [];
        handleChange('qualifications', qualifications.filter((_, i) => i !== index));
    };

    const handleOperatingHoursChange = (day: string, field: 'open' | 'close' | 'slotDuration', value: string) => {
        const operatingHours = formData.operatingHours || {};
        handleChange('operatingHours', {
            ...operatingHours,
            [day]: {
                ...(operatingHours[day] || {}),
                [field]: value
            }
        });
    };

    if (loading) {
        return (
            <Center minH="400px">
                <Spinner size="xl" color="blue.500" thickness="4px" />
            </Center>
        );
    }

    if (!profile) {
        return (
            <Center minH="400px">
                <Text>No profile data available</Text>
            </Center>
        );
    }

    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    return (
        <Box
            minH="100vh"
            bgGradient={bgGradient}
            p={6}
        >
            <VStack spacing={6} align="stretch" maxW="1200px" mx="auto">
                {/* Header Section */}
                <Box
                    bg={cardBg}
                    borderRadius="2xl"
                    p={8}
                    boxShadow="xl"
                    borderWidth={1}
                    borderColor={borderColor}
                    position="relative"
                    overflow="hidden"
                >
                    {/* Gradient Accent */}
                    <Box
                        position="absolute"
                        top={0}
                        left={0}
                        right={0}
                        h="6px"
                        bgGradient="linear(to-r, blue.400, cyan.400, teal.400)"
                    />

                    <HStack spacing={6} align="flex-start">
                        <Avatar
                            size="2xl"
                            name={isEditing ? formData.name : profile.name}
                            bg="blue.500"
                            color="white"
                            fontSize="3xl"
                        />

                        <VStack align="flex-start" spacing={3} flex={1}>
                            {isEditing ? (
                                <Input
                                    value={formData.name || ''}
                                    onChange={(e) => handleChange('name', e.target.value)}
                                    fontSize="2xl"
                                    fontWeight="bold"
                                    variant="flushed"
                                />
                            ) : (
                                <Heading size="xl" color={headingColor}>
                                    {profile.name}
                                </Heading>
                            )}

                            {isEditing ? (
                                <Input
                                    value={formData.email || ''}
                                    onChange={(e) => handleChange('email', e.target.value)}
                                    type="email"
                                    variant="flushed"
                                />
                            ) : (
                                <HStack>
                                    <Icon as={FiMail} color="blue.500" />
                                    <Text color={mutedColor}>{profile.email}</Text>
                                </HStack>
                            )}

                            <Wrap spacing={2}>
                                {profile.specialization && (
                                    <WrapItem>
                                        <Badge colorScheme="blue" px={3} py={1} borderRadius="full">
                                            {profile.specialization}
                                        </Badge>
                                    </WrapItem>
                                )}
                                {(profile.experience || profile.yearsOfExperience) && (
                                    <WrapItem>
                                        <Badge colorScheme="green" px={3} py={1} borderRadius="full">
                                            {profile.experience || profile.yearsOfExperience} years exp.
                                        </Badge>
                                    </WrapItem>
                                )}
                                {(profile.licenseNumber || profile.medicalLicenseNumber) && (
                                    <WrapItem>
                                        <Badge colorScheme="purple" px={3} py={1} borderRadius="full">
                                            Lic: {profile.licenseNumber || profile.medicalLicenseNumber}
                                        </Badge>
                                    </WrapItem>
                                )}
                            </Wrap>
                        </VStack>

                        <VStack spacing={2}>
                            {!isEditing ? (
                                <Button
                                    leftIcon={<FiEdit2 />}
                                    colorScheme="blue"
                                    onClick={() => setIsEditing(true)}
                                    size="lg"
                                >
                                    Edit Profile
                                </Button>
                            ) : (
                                <HStack>
                                    <Button
                                        leftIcon={<FiSave />}
                                        colorScheme="green"
                                        onClick={handleSave}
                                        isLoading={saving}
                                        loadingText="Saving..."
                                    >
                                        Save
                                    </Button>
                                    <Button
                                        leftIcon={<FiX />}
                                        variant="outline"
                                        onClick={handleCancel}
                                    >
                                        Cancel
                                    </Button>
                                </HStack>
                            )}
                        </VStack>
                    </HStack>
                </Box>

                {/* Personal Information */}
                <Box
                    bg={cardBg}
                    borderRadius="2xl"
                    p={6}
                    boxShadow="lg"
                    borderWidth={1}
                    borderColor={borderColor}
                >
                    <HStack mb={4}>
                        <Icon as={FiUser} boxSize={5} color="blue.500" />
                        <Heading size="md" color={headingColor}>Personal Information</Heading>
                    </HStack>

                    <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
                        <GridItem>
                            <FormControl>
                                <FormLabel fontSize="sm" color={mutedColor}>Phone</FormLabel>
                                {isEditing ? (
                                    <Input
                                        value={formData.phone || ''}
                                        onChange={(e) => handleChange('phone', e.target.value)}
                                    />
                                ) : (
                                    <Text fontWeight="medium">{profile.phone || 'Not provided'}</Text>
                                )}
                            </FormControl>
                        </GridItem>

                        <GridItem>
                            <FormControl>
                                <FormLabel fontSize="sm" color={mutedColor}>Mobile</FormLabel>
                                {isEditing ? (
                                    <Input
                                        value={formData.mobile || ''}
                                        onChange={(e) => handleChange('mobile', e.target.value)}
                                    />
                                ) : (
                                    <Text fontWeight="medium">{profile.mobile || 'Not provided'}</Text>
                                )}
                            </FormControl>
                        </GridItem>

                        <GridItem>
                            <FormControl>
                                <FormLabel fontSize="sm" color={mutedColor}>Gender</FormLabel>
                                {isEditing ? (
                                    <Select
                                        value={formData.gender || ''}
                                        onChange={(e) => handleChange('gender', e.target.value)}
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </Select>
                                ) : (
                                    <Text fontWeight="medium">{profile.gender || 'Not provided'}</Text>
                                )}
                            </FormControl>
                        </GridItem>

                        <GridItem>
                            <FormControl>
                                <FormLabel fontSize="sm" color={mutedColor}>Date of Birth</FormLabel>
                                {isEditing ? (
                                    <Input
                                        type="date"
                                        placeholder="dd/mm/yyyy"
                                        value={formData.dateOfBirth || ''}
                                        onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                                        max={new Date().toISOString().split('T')[0]}
                                        min="1900-01-01"
                                    />
                                ) : (
                                    <Text fontWeight="medium">{profile.dateOfBirth || 'Not provided'}</Text>
                                )}
                            </FormControl>
                        </GridItem>

                        <GridItem>
                            <FormControl>
                                <FormLabel fontSize="sm" color={mutedColor}>Age</FormLabel>
                                {isEditing ? (
                                    <Input
                                        value={formData.age || ''}
                                        onChange={(e) => handleChange('age', e.target.value)}
                                    />
                                ) : (
                                    <Text fontWeight="medium">{profile.age || 'Not provided'}</Text>
                                )}
                            </FormControl>
                        </GridItem>

                        <GridItem>
                            <FormControl>
                                <FormLabel fontSize="sm" color={mutedColor}>Preferred Contact Method</FormLabel>
                                {isEditing ? (
                                    <Select
                                        value={formData.preferredCommunicationMethod || ''}
                                        onChange={(e) => handleChange('preferredCommunicationMethod', e.target.value)}
                                    >
                                        <option value="Phone">Phone</option>
                                        <option value="Email">Email</option>
                                        <option value="WhatsApp">WhatsApp</option>
                                        <option value="SMS">SMS</option>
                                    </Select>
                                ) : (
                                    <Text fontWeight="medium">{profile.preferredCommunicationMethod || 'Phone'}</Text>
                                )}
                            </FormControl>
                        </GridItem>
                    </Grid>
                </Box>

                {/* Professional Information */}
                <Box
                    bg={cardBg}
                    borderRadius="2xl"
                    p={6}
                    boxShadow="lg"
                    borderWidth={1}
                    borderColor={borderColor}
                >
                    <HStack mb={4}>
                        <Icon as={FiBriefcase} boxSize={5} color="blue.500" />
                        <Heading size="md" color={headingColor}>Professional Information</Heading>
                    </HStack>

                    <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
                        <GridItem>
                            <FormControl>
                                <FormLabel fontSize="sm" color={mutedColor}>Specialization</FormLabel>
                                {isEditing ? (
                                    <Select
                                        value={formData.specialization || ''}
                                        onChange={(e) => handleChange('specialization', e.target.value)}
                                        placeholder="Select specialization"
                                    >
                                        <option value="General Physician">General Physician</option>
                                        <option value="Cardiologist">Cardiologist</option>
                                        <option value="Dermatologist">Dermatologist</option>
                                        <option value="Pediatrician">Pediatrician</option>
                                        <option value="Orthopedic">Orthopedic</option>
                                        <option value="Neurologist">Neurologist</option>
                                        <option value="Gynecologist">Gynecologist</option>
                                        <option value="Psychiatrist">Psychiatrist</option>
                                        <option value="Ophthalmologist">Ophthalmologist</option>
                                        <option value="ENT Specialist">ENT Specialist</option>
                                        <option value="Dentist">Dentist</option>
                                        <option value="Radiologist">Radiologist</option>
                                        <option value="Anesthesiologist">Anesthesiologist</option>
                                        <option value="Surgeon">Surgeon</option>
                                        <option value="Urologist">Urologist</option>
                                        <option value="Gastroenterologist">Gastroenterologist</option>
                                        <option value="Pulmonologist">Pulmonologist</option>
                                        <option value="Endocrinologist">Endocrinologist</option>
                                        <option value="Nephrologist">Nephrologist</option>
                                        <option value="Oncologist">Oncologist</option>
                                        <option value="Other">Other</option>
                                    </Select>
                                ) : (
                                    <Text fontWeight="medium">{profile.specialization || 'Not provided'}</Text>
                                )}
                            </FormControl>
                        </GridItem>

                        <GridItem>
                            <FormControl>
                                <FormLabel fontSize="sm" color={mutedColor}>Qualification</FormLabel>
                                {isEditing ? (
                                    <Select
                                        value={formData.qualification || ''}
                                        onChange={(e) => handleChange('qualification', e.target.value)}
                                        placeholder="Select qualification"
                                    >
                                        <option value="MBBS">MBBS</option>
                                        <option value="MD">MD</option>
                                        <option value="MS">MS</option>
                                        <option value="DNB">DNB</option>
                                        <option value="DM">DM</option>
                                        <option value="MCh">MCh</option>
                                        <option value="BDS">BDS</option>
                                        <option value="MDS">MDS</option>
                                        <option value="BAMS">BAMS</option>
                                        <option value="BHMS">BHMS</option>
                                        <option value="BUMS">BUMS</option>
                                        <option value="BPT">BPT</option>
                                        <option value="MPT">MPT</option>
                                        <option value="Other">Other</option>
                                    </Select>
                                ) : (
                                    <Text fontWeight="medium">{profile.qualification || 'Not provided'}</Text>
                                )}
                            </FormControl>
                        </GridItem>

                        <GridItem>
                            <FormControl>
                                <FormLabel fontSize="sm" color={mutedColor}>Experience (years)</FormLabel>
                                {isEditing ? (
                                    <Select
                                        value={formData.experience || formData.yearsOfExperience || ''}
                                        onChange={(e) => handleChange('experience', parseInt(e.target.value))}
                                        placeholder="Select experience"
                                    >
                                        <option value="0">Less than 1 year</option>
                                        <option value="1">1 year</option>
                                        <option value="2">2 years</option>
                                        <option value="3">3 years</option>
                                        <option value="4">4 years</option>
                                        <option value="5">5 years</option>
                                        <option value="6">6 years</option>
                                        <option value="7">7 years</option>
                                        <option value="8">8 years</option>
                                        <option value="9">9 years</option>
                                        <option value="10">10 years</option>
                                        <option value="15">15 years</option>
                                        <option value="20">20 years</option>
                                        <option value="25">25 years</option>
                                        <option value="30">30+ years</option>
                                    </Select>
                                ) : (
                                    <Text fontWeight="medium">{profile.experience || profile.yearsOfExperience || 'Not provided'} years</Text>
                                )}
                            </FormControl>
                        </GridItem>

                        <GridItem>
                            <FormControl>
                                <FormLabel fontSize="sm" color={mutedColor}>Medical License Number</FormLabel>
                                {isEditing ? (
                                    <Input
                                        value={formData.medicalLicenseNumber || formData.licenseNumber || ''}
                                        onChange={(e) => handleChange('medicalLicenseNumber', e.target.value)}
                                        placeholder="Enter medical license number"
                                    />
                                ) : (
                                    <Text fontWeight="medium">{profile.medicalLicenseNumber || profile.licenseNumber || 'Not provided'}</Text>
                                )}
                            </FormControl>
                        </GridItem>

                        <GridItem>
                            <FormControl>
                                <FormLabel fontSize="sm" color={mutedColor}>Department</FormLabel>
                                {isEditing ? (
                                    <Select
                                        value={formData.department || ''}
                                        onChange={(e) => handleChange('department', e.target.value)}
                                        placeholder="Select department"
                                    >
                                        <option value="Emergency">Emergency</option>
                                        <option value="Outpatient">Outpatient (OPD)</option>
                                        <option value="Inpatient">Inpatient (IPD)</option>
                                        <option value="ICU">Intensive Care Unit (ICU)</option>
                                        <option value="Surgery">Surgery</option>
                                        <option value="Cardiology">Cardiology</option>
                                        <option value="Neurology">Neurology</option>
                                        <option value="Pediatrics">Pediatrics</option>
                                        <option value="Obstetrics">Obstetrics & Gynecology</option>
                                        <option value="Orthopedics">Orthopedics</option>
                                        <option value="Radiology">Radiology</option>
                                        <option value="Laboratory">Laboratory</option>
                                        <option value="Pharmacy">Pharmacy</option>
                                        <option value="Physiotherapy">Physiotherapy</option>
                                        <option value="Dental">Dental</option>
                                        <option value="Other">Other</option>
                                    </Select>
                                ) : (
                                    <Text fontWeight="medium">{profile.department || 'Not provided'}</Text>
                                )}
                            </FormControl>
                        </GridItem>

                        <GridItem colSpan={{ base: 1, md: 2 }}>
                            <FormControl>
                                <FormLabel fontSize="sm" color={mutedColor}>Languages Spoken</FormLabel>
                                {isEditing ? (
                                    <VStack align="stretch" spacing={2}>
                                        <Wrap spacing={2}>
                                            {(formData.languagesSpoken || []).map((lang, index) => (
                                                <WrapItem key={index}>
                                                    <Tag size="lg" colorScheme="blue" borderRadius="full">
                                                        <TagLabel>{lang}</TagLabel>
                                                        <TagCloseButton onClick={() => removeLanguage(index)} />
                                                    </Tag>
                                                </WrapItem>
                                            ))}
                                        </Wrap>
                                        <HStack>
                                            <Input
                                                placeholder="Add language"
                                                value={newLanguage}
                                                onChange={(e) => setNewLanguage(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && addLanguage()}
                                            />
                                            <Button onClick={addLanguage} colorScheme="blue" size="sm">
                                                Add
                                            </Button>
                                        </HStack>
                                    </VStack>
                                ) : (
                                    <Wrap spacing={2}>
                                        {(profile.languagesSpoken || []).map((lang, index) => (
                                            <WrapItem key={index}>
                                                <Tag size="md" colorScheme="blue" borderRadius="full">
                                                    {lang}
                                                </Tag>
                                            </WrapItem>
                                        ))}
                                        {(!profile.languagesSpoken || profile.languagesSpoken.length === 0) && (
                                            <Text fontWeight="medium">Not provided</Text>
                                        )}
                                    </Wrap>
                                )}
                            </FormControl>
                        </GridItem>

                        <GridItem colSpan={{ base: 1, md: 2 }}>
                            <FormControl>
                                <FormLabel fontSize="sm" color={mutedColor}>Qualifications</FormLabel>
                                {isEditing ? (
                                    <VStack align="stretch" spacing={2}>
                                        <Wrap spacing={2}>
                                            {(formData.qualifications || []).map((qual, index) => (
                                                <WrapItem key={index}>
                                                    <Tag size="lg" colorScheme="green" borderRadius="full">
                                                        <TagLabel>{qual}</TagLabel>
                                                        <TagCloseButton onClick={() => removeQualification(index)} />
                                                    </Tag>
                                                </WrapItem>
                                            ))}
                                        </Wrap>
                                        <HStack>
                                            <Input
                                                placeholder="Add qualification"
                                                value={newQualification}
                                                onChange={(e) => setNewQualification(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && addQualification()}
                                            />
                                            <Button onClick={addQualification} colorScheme="green" size="sm">
                                                Add
                                            </Button>
                                        </HStack>
                                    </VStack>
                                ) : (
                                    <Wrap spacing={2}>
                                        {(profile.qualifications || []).map((qual, index) => (
                                            <WrapItem key={index}>
                                                <Tag size="md" colorScheme="green" borderRadius="full">
                                                    {qual}
                                                </Tag>
                                            </WrapItem>
                                        ))}
                                        {(!profile.qualifications || profile.qualifications.length === 0) && (
                                            <Text fontWeight="medium">Not provided</Text>
                                        )}
                                    </Wrap>
                                )}
                            </FormControl>
                        </GridItem>
                    </Grid>
                </Box>

                {/* Availability Slots */}
                <Box
                    bg={cardBg}
                    borderRadius="2xl"
                    p={6}
                    boxShadow="lg"
                    borderWidth={1}
                    borderColor={borderColor}
                >
                    <HStack mb={4}>
                        <Icon as={FiClock} boxSize={5} color="blue.500" />
                        <Heading size="md" color={headingColor}>Availability & Operating Hours</Heading>
                    </HStack>

                    <VStack align="stretch" spacing={3}>
                        <Text fontSize="sm" color={mutedColor} fontWeight="semibold">Weekly Schedule</Text>

                        {daysOfWeek.map((day) => {
                            const daySchedule = isEditing
                                ? formData.operatingHours?.[day] || { open: '09:00', close: '17:00', slotDuration: '30' }
                                : profile.operatingHours?.[day] || { open: '09:00', close: '17:00', slotDuration: '30' };

                            return (
                                <Box
                                    key={day}
                                    p={4}
                                    bg={sectionBg}
                                    borderRadius="lg"
                                    borderWidth={1}
                                    borderColor={borderColor}
                                >
                                    <VStack align="stretch" spacing={3}>
                                        <Text fontWeight="bold" fontSize="md" color={headingColor}>{day}</Text>

                                        {isEditing ? (
                                            <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={3}>
                                                <FormControl>
                                                    <FormLabel fontSize="xs" color={mutedColor}>Open Time</FormLabel>
                                                    <Input
                                                        type="time"
                                                        size="sm"
                                                        value={daySchedule.open}
                                                        onChange={(e) => handleOperatingHoursChange(day, 'open', e.target.value)}
                                                    />
                                                </FormControl>
                                                <FormControl>
                                                    <FormLabel fontSize="xs" color={mutedColor}>Close Time</FormLabel>
                                                    <Input
                                                        type="time"
                                                        size="sm"
                                                        value={daySchedule.close}
                                                        onChange={(e) => handleOperatingHoursChange(day, 'close', e.target.value)}
                                                    />
                                                </FormControl>
                                                <FormControl>
                                                    <FormLabel fontSize="xs" color={mutedColor}>Slot Duration</FormLabel>
                                                    <Select
                                                        size="sm"
                                                        value={daySchedule.slotDuration || '30'}
                                                        onChange={(e) => handleOperatingHoursChange(day, 'slotDuration', e.target.value)}
                                                    >
                                                        <option value="15">15 min</option>
                                                        <option value="30">30 min</option>
                                                        <option value="45">45 min</option>
                                                        <option value="60">60 min</option>
                                                    </Select>
                                                </FormControl>
                                            </Grid>
                                        ) : (
                                            <HStack spacing={4} flexWrap="wrap">
                                                <Badge colorScheme="blue" px={3} py={1} borderRadius="md">
                                                    {daySchedule.open} - {daySchedule.close}
                                                </Badge>
                                                <Badge colorScheme="green" px={3} py={1} borderRadius="md">
                                                    {daySchedule.slotDuration || '30'} min slots
                                                </Badge>
                                            </HStack>
                                        )}
                                    </VStack>
                                </Box>
                            );
                        })}
                    </VStack>
                </Box>

                {/* Consultation Fees */}
                <Box
                    bg={cardBg}
                    borderRadius="2xl"
                    p={6}
                    boxShadow="lg"
                    borderWidth={1}
                    borderColor={borderColor}
                >
                    <HStack mb={4}>
                        <Icon as={FiDollarSign} boxSize={5} color="blue.500" />
                        <Heading size="md" color={headingColor}>Consultation Fees</Heading>
                    </HStack>

                    <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
                        <GridItem>
                            <FormControl>
                                <FormLabel fontSize="sm" color={mutedColor}>Onsite Consultation (₹)</FormLabel>
                                {isEditing ? (
                                    <Input
                                        type="number"
                                        value={formData.consultationFees?.onsite || ''}
                                        onChange={(e) => handleChange('consultationFees', {
                                            ...formData.consultationFees,
                                            onsite: parseFloat(e.target.value)
                                        })}
                                    />
                                ) : (
                                    <Text fontWeight="medium">₹{profile.consultationFees?.onsite || 'Not set'}</Text>
                                )}
                            </FormControl>
                        </GridItem>

                        <GridItem>
                            <FormControl>
                                <FormLabel fontSize="sm" color={mutedColor}>Voice Call (₹)</FormLabel>
                                {isEditing ? (
                                    <Input
                                        type="number"
                                        value={formData.consultationFees?.voiceCall || ''}
                                        onChange={(e) => handleChange('consultationFees', {
                                            ...formData.consultationFees,
                                            voiceCall: parseFloat(e.target.value)
                                        })}
                                    />
                                ) : (
                                    <Text fontWeight="medium">₹{profile.consultationFees?.voiceCall || 'Not set'}</Text>
                                )}
                            </FormControl>
                        </GridItem>

                        <GridItem>
                            <FormControl>
                                <FormLabel fontSize="sm" color={mutedColor}>Video Call (₹)</FormLabel>
                                {isEditing ? (
                                    <Input
                                        type="number"
                                        value={formData.consultationFees?.videoCall || ''}
                                        onChange={(e) => handleChange('consultationFees', {
                                            ...formData.consultationFees,
                                            videoCall: parseFloat(e.target.value)
                                        })}
                                    />
                                ) : (
                                    <Text fontWeight="medium">₹{profile.consultationFees?.videoCall || 'Not set'}</Text>
                                )}
                            </FormControl>
                        </GridItem>

                        <GridItem>
                            <FormControl>
                                <FormLabel fontSize="sm" color={mutedColor}>Home Visit (₹)</FormLabel>
                                {isEditing ? (
                                    <Input
                                        type="number"
                                        value={formData.consultationFees?.homeVisit || ''}
                                        onChange={(e) => handleChange('consultationFees', {
                                            ...formData.consultationFees,
                                            homeVisit: parseFloat(e.target.value)
                                        })}
                                    />
                                ) : (
                                    <Text fontWeight="medium">₹{profile.consultationFees?.homeVisit || 'Not set'}</Text>
                                )}
                            </FormControl>
                        </GridItem>

                        <GridItem>
                            <FormControl>
                                <FormLabel fontSize="sm" color={mutedColor}>Follow-up Fee (₹)</FormLabel>
                                {isEditing ? (
                                    <Input
                                        type="number"
                                        value={formData.consultationFees?.followUpFee || ''}
                                        onChange={(e) => handleChange('consultationFees', {
                                            ...formData.consultationFees,
                                            followUpFee: parseFloat(e.target.value)
                                        })}
                                    />
                                ) : (
                                    <Text fontWeight="medium">₹{profile.consultationFees?.followUpFee || 'Not set'}</Text>
                                )}
                            </FormControl>
                        </GridItem>
                    </Grid>
                </Box>

                {/* Bio */}
                <Box
                    bg={cardBg}
                    borderRadius="2xl"
                    p={6}
                    boxShadow="lg"
                    borderWidth={1}
                    borderColor={borderColor}
                >
                    <Heading size="md" mb={4} color={headingColor}>Professional Bio</Heading>
                    <FormControl>
                        {isEditing ? (
                            <Textarea
                                value={formData.bio || ''}
                                onChange={(e) => handleChange('bio', e.target.value)}
                                placeholder="Tell us about yourself, your expertise, and experience..."
                                rows={5}
                                maxLength={500}
                            />
                        ) : (
                            <Text color={textColor}>{profile.bio || 'No bio provided'}</Text>
                        )}
                    </FormControl>
                </Box>

                {/* Facility Information (Read-only) */}
                {
                    profile.facilityId && (
                        <Box
                            bg={cardBg}
                            borderRadius="2xl"
                            p={6}
                            boxShadow="lg"
                            borderWidth={1}
                            borderColor={borderColor}
                        >
                            <HStack mb={4}>
                                <Icon as={FiMapPin} boxSize={5} color="blue.500" />
                                <Heading size="md" color={headingColor}>Facility Information</Heading>
                                <Badge colorScheme="gray">Read-only</Badge>
                            </HStack>

                            <VStack align="stretch" spacing={3}>
                                <HStack>
                                    <Text fontSize="sm" color={mutedColor} w="150px">Facility Name:</Text>
                                    <Text fontWeight="medium">{profile.facilityId.name}</Text>
                                </HStack>
                                {profile.facilityId.facilityType && (
                                    <HStack>
                                        <Text fontSize="sm" color={mutedColor} w="150px">Type:</Text>
                                        <Badge colorScheme="blue">{profile.facilityId.facilityType}</Badge>
                                    </HStack>
                                )}
                                {profile.facilityId.phone && (
                                    <HStack>
                                        <Text fontSize="sm" color={mutedColor} w="150px">Phone:</Text>
                                        <Text fontWeight="medium">{profile.facilityId.phone}</Text>
                                    </HStack>
                                )}
                                {profile.facilityId.email && (
                                    <HStack>
                                        <Text fontSize="sm" color={mutedColor} w="150px">Email:</Text>
                                        <Text fontWeight="medium">{profile.facilityId.email}</Text>
                                    </HStack>
                                )}
                                {profile.department && (
                                    <HStack>
                                        <Text fontSize="sm" color={mutedColor} w="150px">Department:</Text>
                                        <Text fontWeight="medium">{profile.department}</Text>
                                    </HStack>
                                )}
                            </VStack>
                        </Box>
                    )
                }
            </VStack >
        </Box >
    );
}
