'use client';

import { useState } from 'react';
import {
    Box,
    Button,
    FormControl,
    FormLabel,
    Textarea,
    VStack,
    HStack,
    IconButton,
    Text,
    Divider,
    Checkbox,
    useToast,
    Icon,
    Heading,
    Image,
} from '@chakra-ui/react';
import { FiUpload, FiX, FiFileText } from 'react-icons/fi';

interface PrescriptionUploadFormChakraProps {
    appointmentId: string;
    patientName: string;
    onSuccess?: () => void;
    onCancel?: () => void;
}

export default function PrescriptionUploadFormChakra({
    appointmentId,
    patientName,
    onSuccess,
    onCancel
}: PrescriptionUploadFormChakraProps) {
    const [loading, setLoading] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [notes, setNotes] = useState('');
    const [saveAsDraft, setSaveAsDraft] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);
    const toast = useToast();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];

            const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
            if (!allowedTypes.includes(selectedFile.type)) {
                toast({
                    title: 'Invalid file type',
                    description: 'Please upload a PDF or image file (JPG, PNG)',
                    status: 'error',
                    duration: 3000,
                    isClosable: true,
                });
                return;
            }

            if (selectedFile.size > 15 * 1024 * 1024) {
                toast({
                    title: 'File too large',
                    description: 'File size must be less than 15MB',
                    status: 'error',
                    duration: 3000,
                    isClosable: true,
                });
                return;
            }

            setFile(selectedFile);

            if (selectedFile.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPreview(reader.result as string);
                };
                reader.readAsDataURL(selectedFile);
            } else {
                setPreview(null);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!file) {
            toast({
                title: 'No file selected',
                description: 'Please select a file to upload',
                status: 'warning',
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        setLoading(true);

        try {
            const token = localStorage.getItem('doctorToken');
            const formData = new FormData();
            formData.append('prescriptionFile', file);
            formData.append('appointmentId', appointmentId);
            formData.append('notes', notes);

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/prescriptions/upload`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: formData
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
                    title: saveAsDraft ? 'Prescription uploaded and saved as draft' : 'Prescription uploaded and issued successfully!',
                    status: 'success',
                    duration: 3000,
                    isClosable: true,
                });
                onSuccess?.();
            } else {
                toast({
                    title: 'Upload failed',
                    description: data.message || 'Failed to upload prescription',
                    status: 'error',
                    duration: 3000,
                    isClosable: true,
                });
            }
        } catch (error) {
            console.error('Error uploading prescription:', error);
            toast({
                title: 'Upload failed',
                description: 'Failed to upload prescription',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box p={6} maxH="85vh" overflowY="auto" w="full">
            <HStack justify="space-between" mb={6}>
                <Box>
                    <Heading size="lg">Upload Prescription</Heading>
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
                <VStack spacing={6} align="stretch" w="full">
                    {/* File Upload */}
                    <FormControl isRequired>
                        <FormLabel mb={2}>Prescription File</FormLabel>

                        <Box
                            as="label"
                            htmlFor="file-upload"
                            cursor="pointer"
                            borderWidth={2}
                            borderStyle="dashed"
                            borderColor={file ? 'blue.400' : 'gray.300'}
                            borderRadius="lg"
                            p={8}
                            textAlign="center"
                            bg={file ? 'blue.50' : 'gray.50'}
                            _hover={{ bg: file ? 'blue.100' : 'gray.100' }}
                            transition="all 0.2s"
                            w="full"
                            display="block"
                        >
                            {file ? (
                                <VStack spacing={3}>
                                    <Icon as={FiFileText} boxSize={12} color="blue.500" />
                                    <Text fontWeight="medium" color="gray.700">{file.name}</Text>
                                    <Text fontSize="sm" color="gray.500">
                                        {(file.size / 1024 / 1024).toFixed(2)} MB
                                    </Text>
                                    <Button
                                        size="sm"
                                        colorScheme="red"
                                        variant="ghost"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setFile(null);
                                            setPreview(null);
                                        }}
                                    >
                                        Remove file
                                    </Button>
                                </VStack>
                            ) : (
                                <VStack spacing={3}>
                                    <Icon as={FiUpload} boxSize={12} color="gray.400" />
                                    <Text fontWeight="medium" color="gray.600">
                                        Click to upload or drag and drop
                                    </Text>
                                    <Text fontSize="sm" color="gray.500">
                                        PDF, JPG, or PNG (Max 15MB)
                                    </Text>
                                </VStack>
                            )}
                            <input
                                id="file-upload"
                                type="file"
                                style={{ display: 'none' }}
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={handleFileChange}
                            />
                        </Box>

                        {/* Image Preview */}
                        {preview && (
                            <Box mt={4}>
                                <Text fontWeight="medium" mb={2}>Preview:</Text>
                                <Image
                                    src={preview}
                                    alt="Prescription preview"
                                    maxW="100%"
                                    borderRadius="md"
                                    border="1px"
                                    borderColor="gray.200"
                                />
                            </Box>
                        )}
                    </FormControl>

                    {/* Notes */}
                    <FormControl>
                        <FormLabel>Additional Notes</FormLabel>
                        <Textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Any additional notes about this prescription"
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
                            loadingText="Uploading..."
                            isDisabled={!file}
                        >
                            {saveAsDraft ? 'Upload as Draft' : 'Upload & Issue Prescription'}
                        </Button>
                    </HStack>
                </VStack>
            </form>
        </Box>
    );
}
