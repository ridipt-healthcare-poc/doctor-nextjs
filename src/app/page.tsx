'use client'

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Center, Spinner } from '@chakra-ui/react';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/login');
  }, [router]);

  return (
    <Center minH="100vh" bg="gray.50">
      <Spinner size="xl" color="blue.500" />
    </Center>
  );
}
