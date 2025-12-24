'use client'

import { Box, Button, Heading, Text, VStack } from "@chakra-ui/react";
import Link from "next/link";

export default function Home() {
  return (
    <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" bg="gray.50">
      <VStack spacing={6} textAlign="center">
        <Heading size="xl" color="blue.600">
          Doctor Appointment Management
        </Heading>
        <Text fontSize="lg" color="gray.600">
          Welcome to the doctor appointment booking system.
        </Text>
        <Button as={Link} href="/login" colorScheme="blue" size="lg">
          Go to Login
        </Button>
      </VStack>
    </Box>
  );
}
