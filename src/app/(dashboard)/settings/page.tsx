'use client';

import React from 'react';
import {
    Box,
    Heading,
    Text,
    VStack,
    useColorModeValue,
} from '@chakra-ui/react';

export default function SettingsPage() {
    const cardBg = useColorModeValue('white', 'gray.800');

    return (
        <Box>
            <Heading size="lg" mb={6}>
                Settings
            </Heading>

            <Box bg={cardBg} p={8} borderRadius="xl">
                <VStack align="stretch" spacing={4}>
                    <Text fontSize="lg" fontWeight="semibold">
                        Application Settings
                    </Text>
                    <Text color="gray.600">
                        Settings page is under development. More options will be available soon.
                    </Text>
                </VStack>
            </Box>
        </Box>
    );
}
