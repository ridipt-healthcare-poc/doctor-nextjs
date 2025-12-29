'use client';

import {
    Box,
    Button,
    Badge,
    VStack,
    HStack,
    Text,
    useToast,
    useColorModeValue,
    Card,
    CardBody,
    Divider,
    SimpleGrid,
} from '@chakra-ui/react';
import { FiFileText, FiDownload, FiEdit, FiSend, FiTrash2 } from 'react-icons/fi';

interface PrescriptionPreviewChakraProps {
    prescription: any;
    onEdit?: () => void;
    onIssue?: () => void;
    onDownload?: () => void;
    onDelete?: () => void;
}

export default function PrescriptionPreviewChakra({
    prescription,
    onEdit,
    onIssue,
    onDownload,
    onDelete
}: PrescriptionPreviewChakraProps) {
    const toast = useToast();
    const cardBg = useColorModeValue('gray.50', 'gray.700');
    const labelColor = useColorModeValue('gray.600', 'gray.400');

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            draft: 'yellow',
            issued: 'green',
            cancelled: 'red'
        };
        return colors[status] || 'gray';
    };

    const handleDownload = () => {
        if (!prescription?.fileUrl) {
            toast({
                title: 'Download failed',
                description: 'File URL not available',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        const fileUrl = prescription.fileUrl.startsWith('http')
            ? prescription.fileUrl
            : `${process.env.NEXT_PUBLIC_API_URL}${prescription.fileUrl}`;

        window.open(fileUrl, '_blank');
    };

    return (
        <Card
            bg={cardBg}
            borderRadius="lg"
            shadow="sm"
            _hover={{ shadow: 'md', transform: 'translateY(-2px)' }}
            transition="all 0.2s"
        >
            <CardBody>
                <VStack align="stretch" spacing={4}>
                    {/* Header */}
                    <HStack justify="space-between">
                        <HStack>
                            <FiFileText size={24} color="blue" />
                            <Text fontWeight="bold" fontSize="md">
                                Prescription Details
                            </Text>
                        </HStack>
                        <Badge colorScheme={getStatusColor(prescription.status)} fontSize="sm">
                            {prescription.status?.toUpperCase()}
                        </Badge>
                    </HStack>

                    <Divider />

                    {/* Prescription Info */}
                    <Box>
                        <Text fontSize="sm" color={labelColor} mb={1}>
                            Created on
                        </Text>
                        <Text fontWeight="medium">
                            {new Date(prescription.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </Text>
                    </Box>

                    {prescription.issuedAt && (
                        <Box>
                            <Text fontSize="sm" color={labelColor} mb={1}>
                                Issued on
                            </Text>
                            <Text fontWeight="medium">
                                {new Date(prescription.issuedAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </Text>
                        </Box>
                    )}

                    {/* Type Badge */}
                    <Box>
                        <Text fontSize="sm" color={labelColor} mb={1}>
                            Type
                        </Text>
                        <Badge colorScheme="purple" fontSize="sm">
                            {prescription.prescriptionType === 'uploaded' ? 'Uploaded File' : 'Generated Prescription'}
                        </Badge>
                    </Box>

                    {/* File Info */}
                    {prescription.fileName && (
                        <Box>
                            <HStack spacing={2}>
                                <FiFileText size={20} color="gray" />
                                <Box flex={1}>
                                    <Text fontWeight="bold" fontSize="sm" noOfLines={2}>
                                        {prescription.fileName}
                                    </Text>
                                    {prescription.fileSize && (
                                        <Text fontSize="xs" color="gray.500">
                                            {(prescription.fileSize / 1024).toFixed(1)} KB
                                        </Text>
                                    )}
                                </Box>
                            </HStack>
                        </Box>
                    )}

                    {/* Generated Prescription Details */}
                    {prescription.prescriptionType === 'generated' && (
                        <>
                            {prescription.diagnosis && (
                                <Box>
                                    <Text fontSize="sm" color={labelColor} mb={1}>
                                        Diagnosis
                                    </Text>
                                    <Text fontWeight="medium">{prescription.diagnosis}</Text>
                                </Box>
                            )}

                            {prescription.medications && prescription.medications.length > 0 && (
                                <Box>
                                    <Text fontSize="sm" color={labelColor} mb={2}>
                                        Medications ({prescription.medications.length})
                                    </Text>
                                    <VStack align="stretch" spacing={2}>
                                        {prescription.medications.slice(0, 3).map((med: any, index: number) => (
                                            <Box
                                                key={index}
                                                p={2}
                                                bg={useColorModeValue('white', 'gray.600')}
                                                borderRadius="md"
                                                fontSize="sm"
                                            >
                                                <Text fontWeight="semibold">{med.name}</Text>
                                                <Text fontSize="xs" color={labelColor}>
                                                    {med.dosage} • {med.frequency} • {med.duration}
                                                </Text>
                                            </Box>
                                        ))}
                                        {prescription.medications.length > 3 && (
                                            <Text fontSize="xs" color={labelColor} fontStyle="italic">
                                                +{prescription.medications.length - 3} more medications
                                            </Text>
                                        )}
                                    </VStack>
                                </Box>
                            )}
                        </>
                    )}

                    {/* Notes */}
                    {prescription.notes && (
                        <Box>
                            <Text fontSize="sm" color={labelColor} mb={1}>
                                Notes
                            </Text>
                            <Text fontSize="sm" noOfLines={2}>
                                {prescription.notes}
                            </Text>
                        </Box>
                    )}

                    <Divider />

                    {/* Action Buttons */}
                    <VStack spacing={2} align="stretch">
                        <SimpleGrid columns={prescription.status === 'draft' ? 3 : 1} spacing={2}>
                            <Button
                                size="sm"
                                colorScheme="blue"
                                leftIcon={<FiDownload />}
                                onClick={onDownload || handleDownload}
                            >
                                Download
                            </Button>

                            {prescription.status === 'draft' && onEdit && (
                                <Button
                                    size="sm"
                                    colorScheme="gray"
                                    variant="outline"
                                    leftIcon={<FiEdit />}
                                    onClick={onEdit}
                                >
                                    Edit
                                </Button>
                            )}

                            {prescription.status === 'draft' && onIssue && (
                                <Button
                                    size="sm"
                                    colorScheme="green"
                                    leftIcon={<FiSend />}
                                    onClick={onIssue}
                                >
                                    Issue
                                </Button>
                            )}
                        </SimpleGrid>

                        {/* Delete/Cancel Button */}
                        {onDelete && (
                            <Button
                                size="sm"
                                colorScheme="red"
                                variant="outline"
                                leftIcon={<FiTrash2 />}
                                onClick={onDelete}
                            >
                                {prescription.status === 'draft' ? 'Delete' : 'Cancel'} Prescription
                            </Button>
                        )}
                    </VStack>
                </VStack>
            </CardBody>
        </Card>
    );
}
