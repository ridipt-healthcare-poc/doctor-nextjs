'use client';

import { Box, Heading, Text, VStack, Container, Card, CardBody, Icon } from '@chakra-ui/react';
import { FiCreditCard } from 'react-icons/fi';

export default function PaymentsPage() {
    return (
        <Container maxW="container.xl" py={8}>
            <VStack spacing={6} align="stretch">
                <Box>
                    <Heading size="lg" mb={2}>Payments & Revenue</Heading>
                    <Text color="gray.600">Track your earnings and manage transaction history</Text>
                </Box>

                <Card>
                    <CardBody py={10} textAlign="center">
                        <Icon as={FiCreditCard} boxSize={12} color="blue.500" mb={4} />
                        <Heading size="md" mb={2}>Payments Dashboard Coming Soon</Heading>
                        <Text color="gray.500">
                            Detailed revenue reports and payout management will be available here soon.
                        </Text>
                    </CardBody>
                </Card>
            </VStack>
        </Container>
    );
}
