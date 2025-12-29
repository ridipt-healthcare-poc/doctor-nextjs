'use client';

import { useState } from 'react';
import {
    Box,
    Button,
    FormControl,
    FormLabel,
    Input,
    Textarea,
    VStack,
    HStack,
    IconButton,
    Text,
    Divider,
    Checkbox,
    useToast,
    Card,
    CardBody,
    Heading,
    Grid,
    GridItem,
} from '@chakra-ui/react';
import { FiPlus, FiTrash2, FiX } from 'react-icons/fi';

interface Medication {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
}

interface PrescriptionFormChakraProps {
    appointmentId: string;
    patientName: string;
    onSuccess?: () => void;
    onCancel?: () => void;
}

export default function PrescriptionFormChakra({
    appointmentId,
    patientName,
    onSuccess,
    onCancel
}: PrescriptionFormChakraProps) {
    const [loading, setLoading] = useState(false);
    const [diagnosis, setDiagnosis] = useState('');
    const [symptoms, setSymptoms] = useState('');
    const [medications, setMedications] = useState<Medication[]>([
        { name: '', dosage: '', frequency: '', duration: '', instructions: '' }
    ]);
    const [labTests, setLabTests] = useState<string[]>(['']);
    const [followUpDate, setFollowUpDate] = useState('');
    const [notes, setNotes] = useState('');
    const [saveAsDraft, setSaveAsDraft] = useState(false);
    const toast = useToast();

    const addMedication = () => {
        setMedications([
            ...medications,
            { name: '', dosage: '', frequency: '', duration: '', instructions: '' }
        ]);
    };

    const removeMedication = (index: number) => {
        setMedications(medications.filter((_, i) => i !== index));
    };

    const updateMedication = (index: number, field: keyof Medication, value: string) => {
        const updated = [...medications];
        updated[index][field] = value;
        setMedications(updated);
    };

    const addLabTest = () => {
        setLabTests([...labTests, '']);
    };

    const removeLabTest = (index: number) => {
        setLabTests(labTests.filter((_, i) => i !== index));
    };

    const updateLabTest = (index: number, value: string) => {
        const updated = [...labTests];
        updated[index] = value;
        setLabTests(updated);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem('doctorToken');

            const validMedications = medications.filter(med => med.name.trim() !== '');
            const validLabTests = labTests.filter(test => test.trim() !== '');

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/prescriptions/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    appointmentId,
                    diagnosis,
                    symptoms,
                    medications: validMedications,
                    labTests: validLabTests,
                    followUpDate: followUpDate || null,
                    notes
                })
            });

            const data = await response.json();

            if (data.success) {
                if (!saveAsDraft) {
                    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/prescriptions/${data.data._id}/issue`, {
                        method: 'POST',
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    });
                }

                toast({
                    title: saveAsDraft ? 'Prescription saved as draft' : 'Prescription issued successfully!',
                    status: 'success',
                    duration: 3000,
                    isClosable: true,
                });
                onSuccess?.();
            } else {
                toast({
                    title: 'Error',
                    description: data.message || 'Failed to create prescription',
                    status: 'error',
                    duration: 3000,
                    isClosable: true,
                });
            }
        } catch (error) {
            console.error('Error creating prescription:', error);
            toast({
                title: 'Error',
                description: 'Failed to create prescription',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box p={6} maxH="85vh" overflowY="auto">
            <HStack justify="space-between" mb={6}>
                <Box>
                    <Heading size="lg">Create Prescription</Heading>
                    <Text color="gray.600" fontSize="sm" mt={1}>Patient: {patientName}</Text>
                </Box>
                {onCancel && (
                    <IconButton
                        aria-label="Close"
                        icon={<FiX />}
                        variant="ghost"
                        onClick={onCancel}
                    />
                )}
            </HStack>

            <form onSubmit={handleSubmit}>
                <VStack spacing={6} align="stretch">
                    {/* Diagnosis */}
                    <FormControl isRequired>
                        <FormLabel>Diagnosis</FormLabel>
                        <Input
                            value={diagnosis}
                            onChange={(e) => setDiagnosis(e.target.value)}
                            placeholder="Enter diagnosis"
                        />
                    </FormControl>

                    {/* Symptoms */}
                    <FormControl>
                        <FormLabel>Symptoms</FormLabel>
                        <Textarea
                            value={symptoms}
                            onChange={(e) => setSymptoms(e.target.value)}
                            placeholder="Describe symptoms"
                            rows={3}
                        />
                    </FormControl>

                    {/* Medications */}
                    <Box>
                        <HStack justify="space-between" mb={3}>
                            <FormLabel mb={0}>Medications</FormLabel>
                            <Button
                                size="sm"
                                leftIcon={<FiPlus />}
                                onClick={addMedication}
                                colorScheme="blue"
                                variant="ghost"
                            >
                                Add Medication
                            </Button>
                        </HStack>

                        <VStack spacing={4} align="stretch">
                            {medications.map((med, index) => (
                                <Card key={index} variant="outline">
                                    <CardBody>
                                        <HStack justify="space-between" mb={3}>
                                            <Text fontWeight="semibold">Medication {index + 1}</Text>
                                            {medications.length > 1 && (
                                                <IconButton
                                                    aria-label="Remove medication"
                                                    icon={<FiTrash2 />}
                                                    size="sm"
                                                    colorScheme="red"
                                                    variant="ghost"
                                                    onClick={() => removeMedication(index)}
                                                />
                                            )}
                                        </HStack>

                                        <Grid templateColumns="repeat(2, 1fr)" gap={3}>
                                            <GridItem>
                                                <FormControl isRequired>
                                                    <FormLabel fontSize="sm">Medicine Name</FormLabel>
                                                    <Input
                                                        value={med.name}
                                                        onChange={(e) => updateMedication(index, 'name', e.target.value)}
                                                        placeholder="Medicine name"
                                                        size="sm"
                                                    />
                                                </FormControl>
                                            </GridItem>
                                            <GridItem>
                                                <FormControl isRequired>
                                                    <FormLabel fontSize="sm">Dosage</FormLabel>
                                                    <Input
                                                        value={med.dosage}
                                                        onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                                                        placeholder="e.g., 500mg"
                                                        size="sm"
                                                    />
                                                </FormControl>
                                            </GridItem>
                                            <GridItem>
                                                <FormControl isRequired>
                                                    <FormLabel fontSize="sm">Frequency</FormLabel>
                                                    <Input
                                                        value={med.frequency}
                                                        onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                                                        placeholder="e.g., Twice daily"
                                                        size="sm"
                                                    />
                                                </FormControl>
                                            </GridItem>
                                            <GridItem>
                                                <FormControl isRequired>
                                                    <FormLabel fontSize="sm">Duration</FormLabel>
                                                    <Input
                                                        value={med.duration}
                                                        onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                                                        placeholder="e.g., 5 days"
                                                        size="sm"
                                                    />
                                                </FormControl>
                                            </GridItem>
                                            <GridItem colSpan={2}>
                                                <FormControl>
                                                    <FormLabel fontSize="sm">Special Instructions</FormLabel>
                                                    <Input
                                                        value={med.instructions}
                                                        onChange={(e) => updateMedication(index, 'instructions', e.target.value)}
                                                        placeholder="e.g., Take after meals"
                                                        size="sm"
                                                    />
                                                </FormControl>
                                            </GridItem>
                                        </Grid>
                                    </CardBody>
                                </Card>
                            ))}
                        </VStack>
                    </Box>

                    {/* Lab Tests */}
                    <Box>
                        <HStack justify="space-between" mb={3}>
                            <FormLabel mb={0}>Recommended Lab Tests</FormLabel>
                            <Button
                                size="sm"
                                leftIcon={<FiPlus />}
                                onClick={addLabTest}
                                colorScheme="blue"
                                variant="ghost"
                            >
                                Add Test
                            </Button>
                        </HStack>

                        <VStack spacing={2} align="stretch">
                            {labTests.map((test, index) => (
                                <HStack key={index}>
                                    <Input
                                        value={test}
                                        onChange={(e) => updateLabTest(index, e.target.value)}
                                        placeholder="Lab test name"
                                    />
                                    {labTests.length > 1 && (
                                        <IconButton
                                            aria-label="Remove test"
                                            icon={<FiTrash2 />}
                                            colorScheme="red"
                                            variant="ghost"
                                            onClick={() => removeLabTest(index)}
                                        />
                                    )}
                                </HStack>
                            ))}
                        </VStack>
                    </Box>

                    {/* Follow-up Date */}
                    <FormControl>
                        <FormLabel>Follow-up Date</FormLabel>
                        <Input
                            type="date"
                            value={followUpDate}
                            onChange={(e) => setFollowUpDate(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                        />
                    </FormControl>

                    {/* Additional Notes */}
                    <FormControl>
                        <FormLabel>Additional Notes</FormLabel>
                        <Textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Any additional instructions or notes"
                            rows={3}
                        />
                    </FormControl>

                    {/* Save as Draft */}
                    <Checkbox
                        isChecked={saveAsDraft}
                        onChange={(e) => setSaveAsDraft(e.target.checked)}
                    >
                        Save as draft (don't issue to patient yet)
                    </Checkbox>

                    <Divider />

                    {/* Action Buttons */}
                    <HStack spacing={3} justify="flex-end">
                        {onCancel && (
                            <Button variant="outline" onClick={onCancel} isDisabled={loading}>
                                Cancel
                            </Button>
                        )}
                        <Button
                            type="submit"
                            colorScheme="blue"
                            isLoading={loading}
                            loadingText="Creating..."
                        >
                            {saveAsDraft ? 'Save as Draft' : 'Create & Issue Prescription'}
                        </Button>
                    </HStack>
                </VStack>
            </form>
        </Box>
    );
}
