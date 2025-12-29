'use client';

import { Box, Heading, Text, VStack, Container, Card, CardBody, Icon } from '@chakra-ui/react';
import { FiMail } from 'react-icons/fi';

export default function MessagesPage() {
    return (
        <Container maxW="container.xl" py={8}>
            <VStack spacing={6} align="stretch">
                <Box>
                    <Heading size="lg" mb={2}>Messages</Heading>
                    <Text color="gray.600">Communicate with your patients and colleagues</Text>
                </Box>

                <Card>
                    <CardBody py={10} textAlign="center">
                        <Icon as={FiMail} boxSize={12} color="blue.500" mb={4} />
                        <Heading size="md" mb={2}>Messaging System Coming Soon</Heading>
                        <Text color="gray.500">
                            Our secure messaging system is being finalized to ensure HIPAA compliance and data security.
                        </Text>
                    </CardBody>
                </Card>
            </VStack>
        </Container>
    );
}
