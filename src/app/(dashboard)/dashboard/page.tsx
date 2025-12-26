'use client';

import React, { useState, useEffect } from "react";
import {
  Box,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  Text,
  Heading,
  Flex,
  Icon,
  Avatar,
  VStack,
  HStack,
  Divider,
  Button,
  useColorModeValue,
  Badge,
  ButtonGroup,
  Tag,
  Stack,
  Spinner,
  Center,
} from "@chakra-ui/react";
import {
  FaUsers,
  FaUserPlus,
  FaUserFriends,
  FaFileMedical,
  FaCalendarAlt,
  FaCalendarCheck,
  FaPhoneAlt,
} from "react-icons/fa";
import {
  FiArrowRight,
  FiTrendingUp,
  FiCheckCircle,
  FiAlertCircle,
  FiClock,
} from "react-icons/fi";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { appointmentService } from "@/services/appointmentService";
import { patientService } from "@/services/patientService";

const quickActions = [
  {
    label: "Book Appointment",
    helper: "Schedule a new visit",
    icon: FaCalendarCheck,
    accentColor: "#2B6CB0",
    accentBg: "rgba(49, 130, 206, 0.15)",
  },
  {
    label: "Add Patient",
    helper: "Create a new patient profile",
    icon: FaUserPlus,
    accentColor: "#6B46C1",
    accentBg: "rgba(128, 90, 213, 0.15)",
  },
  {
    label: "Share Treatment Plan",
    helper: "Send post-visit notes",
    icon: FaFileMedical,
    accentColor: "#2C7A7B",
    accentBg: "rgba(44, 122, 123, 0.15)",
  },
  {
    label: "Contact Support",
    helper: "Reach out to our team",
    icon: FaPhoneAlt,
    accentColor: "#DD6B20",
    accentBg: "rgba(221, 107, 32, 0.18)",
  },
];

const chartData = [
  { day: "Mon", appointments: 5 },
  { day: "Tue", appointments: 8 },
  { day: "Wed", appointments: 6 },
  { day: "Thu", appointments: 12 },
  { day: "Fri", appointments: 9 },
  { day: "Sat", appointments: 14 },
  { day: "Sun", appointments: 7 },
];

const careReminders = [
  {
    title: "Review lab results",
    patient: "Ravi Kumar • CBC Panel",
    due: "Due today",
    urgency: "high",
  },
  {
    title: "Update availability",
    patient: "Dr. Anita Sharma • Next week",
    due: "Tomorrow",
    urgency: "medium",
  },
  {
    title: "Send discharge summary",
    patient: "Priya Patel • October 2",
    due: "In 2 days",
    urgency: "low",
  },
];

const activityFeed = [
  {
    title: "Appointment confirmed",
    description: "Reception confirmed John Doe for 10:30 AM slot.",
    time: "Just now",
    icon: FiCheckCircle,
    color: "green.500",
  },
  {
    title: "Follow-up pending",
    description: "Reminder sent to Priya Patel for follow-up booking.",
    time: "25 mins ago",
    icon: FiClock,
    color: "orange.400",
  },
  {
    title: "New referral",
    description: "Dr. Singh referred Dr. Ritu Kapoor to the network.",
    time: "1 hr ago",
    icon: FiTrendingUp,
    color: "blue.500",
  },
  {
    title: "Lab alert",
    description: "Abnormal results flagged for Ravi Kumar's CBC.",
    time: "2 hrs ago",
    icon: FiAlertCircle,
    color: "red.400",
  },
];

const patientFiles = [
  { name: "Medical History", icon: FaFileMedical },
  { name: "Prescription Reports", icon: FaFileMedical },
  { name: "Insurance Records", icon: FaFileMedical },
  { name: "Lab Results", icon: FaFileMedical },
];

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    appointments: { total: 0, today: 0, upcoming: 0, completed: 0, cancelled: 0 },
    patients: { total: 0, active: 0, inactive: 0 },
  });
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);

  const cardBg = useColorModeValue("white", "gray.800");
  const cardShadow = useColorModeValue(
    "0 18px 35px rgba(15, 23, 42, 0.08)",
    "0 18px 35px rgba(0, 0, 0, 0.5)"
  );

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Check if token exists, if not wait a bit for login to complete
        let token = localStorage.getItem('doctorToken');
        if (!token) {
          console.log('⏳ Token not found, waiting for login to complete...');
          await new Promise(resolve => setTimeout(resolve, 500));
          token = localStorage.getItem('doctorToken');
        }

        if (!token) {
          console.warn('⚠️ No token available after waiting, skipping data fetch');
          setLoading(false);
          return;
        }

        // Fetch all dashboard data in parallel
        const [appointmentStats, patientStats, appointments] = await Promise.all([
          appointmentService.getAppointmentStats(),
          patientService.getPatientStats(),
          appointmentService.getAppointments({ limit: 5, status: 'Scheduled' }),
        ]);

        setStats({
          appointments: appointmentStats.data || appointmentStats,
          patients: patientStats.data || patientStats,
        });

        // Filter upcoming appointments (next 5)
        const upcoming = (appointments.data || appointments)
          .filter((appt: any) => new Date(appt.appointmentDate) >= new Date())
          .slice(0, 3);
        setUpcomingAppointments(upcoming);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const statsData = [
    {
      label: "Appointments Today",
      value: stats.appointments.today,
      icon: FaCalendarAlt,
      change: `+${stats.appointments.upcoming} upcoming`,
      changeType: "increase",
      subtext: `${stats.appointments.total} total appointments`,
    },
    {
      label: "Total Patients",
      value: stats.patients.total,
      icon: FaUsers,
      change: `+${stats.patients.active} active`,
      changeType: "increase",
      subtext: "This month",
    },
    {
      label: "Completed Appointments",
      value: stats.appointments.completed,
      icon: FaUserPlus,
      change: `${stats.appointments.cancelled} cancelled`,
      changeType: "decrease",
      subtext: "This month",
    },
    {
      label: "Upcoming Appointments",
      value: stats.appointments.upcoming,
      icon: FaUserFriends,
      change: "Scheduled",
      changeType: "increase",
      subtext: "Next 7 days",
    },
  ];

  if (loading) {
    return (
      <Center h="400px">
        <Spinner size="xl" color="blue.500" />
      </Center>
    );
  }

  return (
    <Box maxW="1200px" mx="auto">
      {/* Hero Section */}
      <Box
        position="relative"
        overflow="hidden"
        borderRadius="3xl"
        px={{ base: 6, md: 10 }}
        py={{ base: 8, md: 10 }}
        bgGradient="linear(to-r, blue.600, teal.500)"
        color="white"
        mb={8}
      >
        <Box
          position="absolute"
          top="-10"
          right="-10"
          w="260px"
          h="260px"
          borderRadius="full"
          bg="whiteAlpha.200"
        />
        <Flex
          direction={{ base: "column", md: "row" }}
          align={{ base: "flex-start", md: "center" }}
          gap={{ base: 6, md: 10 }}
        >
          <Box>
            <Text textTransform="uppercase" fontWeight="semibold" fontSize="xs" letterSpacing="wide">
              Welcome back
            </Text>
            <Heading fontSize={{ base: "2xl", md: "3xl" }} mt={2} maxW="lg" lineHeight="1.3">
              Manage your clinic with a clear and confident overview.
            </Heading>
            <Text mt={4} fontSize="sm" color="whiteAlpha.800" maxW="md">
              Track appointments, follow-ups, and team updates in one place. Stay ahead with smart
              reminders and real-time activity alerts tailored for you.
            </Text>
            <HStack spacing={4} mt={6}>
              <Button colorScheme="whiteAlpha" bg="white" color="blue.600" _hover={{ bg: "blue.50" }}>
                View today&apos;s schedule
              </Button>
              <Button
                variant="outline"
                color="white"
                borderColor="whiteAlpha.600"
                _hover={{ bg: "whiteAlpha.200" }}
              >
                Add quick note
              </Button>
            </HStack>
          </Box>
          <Flex
            direction="column"
            bg="whiteAlpha.100"
            borderRadius="2xl"
            p={6}
            minW={{ base: "full", md: "280px" }}
            gap={4}
          >
            <Text fontSize="sm" color="whiteAlpha.700">
              Today at a glance
            </Text>
            <Flex justify="space-between" align="center">
              <Stat>
                <StatLabel color="whiteAlpha.700">Next appointment</StatLabel>
                <StatNumber fontSize="2xl">{stats.appointments.today > 0 ? "10:30 AM" : "No appointments"}</StatNumber>
              </Stat>
              <Icon as={FaCalendarCheck} boxSize={10} color="whiteAlpha.800" />
            </Flex>
            <Divider opacity={0.2} />
            <HStack spacing={4}>
              <VStack align="flex-start" spacing={1}>
                <Text fontSize="xs" color="whiteAlpha.700">
                  Upcoming
                </Text>
                <Text fontWeight="semibold">{stats.appointments.upcoming}</Text>
              </VStack>
              <VStack align="flex-start" spacing={1}>
                <Text fontSize="xs" color="whiteAlpha.700">
                  Completed
                </Text>
                <Text fontWeight="semibold">{stats.appointments.completed}</Text>
              </VStack>
            </HStack>
          </Flex>
        </Flex>
      </Box>

      {/* Quick Actions */}
      <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={4} mb={8}>
        {quickActions.map((action) => (
          <Box
            key={action.label}
            as="button"
            textAlign="left"
            p={5}
            borderRadius="xl"
            bg={cardBg}
            boxShadow="0 1px 3px rgba(15, 23, 42, 0.12)"
            _hover={{ transform: "translateY(-4px)", boxShadow: cardShadow }}
            transition="all 0.25s ease"
          >
            <Flex align="center" justify="space-between">
              <HStack spacing={3} align="flex-start">
                <Flex
                  w={10}
                  h={10}
                  borderRadius="full"
                  align="center"
                  justify="center"
                  bg={action.accentBg}
                  color={action.accentColor}
                >
                  <Icon as={action.icon} boxSize={5} />
                </Flex>
                <Box>
                  <Text fontWeight="semibold" color="gray.800">
                    {action.label}
                  </Text>
                  <Text fontSize="xs" color="gray.500" mt={1}>
                    {action.helper}
                  </Text>
                </Box>
              </HStack>
              <Icon as={FiArrowRight} color="gray.400" />
            </Flex>
          </Box>
        ))}
      </SimpleGrid>

      {/* Stats Cards */}
      <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} spacing={6} mb={8}>
        {statsData.map((stat) => (
          <Box
            key={stat.label}
            bg={cardBg}
            p={6}
            borderRadius="2xl"
            boxShadow={cardShadow}
            transition="all 0.3s"
            _hover={{ transform: "translateY(-6px)", boxShadow: "lg" }}
          >
            <Flex justify="space-between" align="center" mb={6}>
              <Flex
                w={12}
                h={12}
                borderRadius="full"
                align="center"
                justify="center"
                bg="blue.50"
                color="blue.600"
              >
                <Icon as={stat.icon} boxSize={6} />
              </Flex>
              <Badge
                borderRadius="full"
                px={3}
                py={1}
                fontSize="0.65rem"
                colorScheme={stat.changeType === "increase" ? "green" : "red"}
              >
                {stat.change}
              </Badge>
            </Flex>
            <Stat>
              <StatLabel fontSize="sm" color="gray.500">
                {stat.label}
              </StatLabel>
              <StatNumber fontSize="3xl" fontWeight="semibold" color="gray.800">
                {stat.value}
              </StatNumber>
            </Stat>
            <Text mt={3} fontSize="sm" color="gray.500">
              {stat.subtext}
            </Text>
          </Box>
        ))}
      </SimpleGrid>

      {/* Chart, Appointments, Reminders */}
      <SimpleGrid columns={{ base: 1, xl: 3 }} spacing={6}>
        <Box
          p={6}
          pb={4}
          bg={cardBg}
          borderRadius="2xl"
          boxShadow={cardShadow}
          gridColumn={{ xl: "span 2" }}
        >
          <Flex justify="space-between" align="center" flexWrap="wrap" gap={4} mb={6}>
            <Box>
              <Text fontSize="lg" fontWeight="600" color="blue.700">
                Weekly Appointments Overview
              </Text>
              <Text fontSize="sm" color="gray.500">
                Compare performance across the last 7 days
              </Text>
            </Box>
            <ButtonGroup size="sm" variant="ghost">
              <Button colorScheme="blue" bg="blue.500" color="white" _hover={{ bg: "blue.600" }}>
                Week
              </Button>
              <Button>Month</Button>
              <Button>Year</Button>
            </ButtonGroup>
          </Flex>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <defs>
                <linearGradient id="colorBlue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3182CE" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="#3182CE" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="day" stroke="#A0AEC0" />
              <YAxis stroke="#A0AEC0" />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="appointments"
                stroke="#2B6CB0"
                strokeWidth={3}
                fill="url(#colorBlue)"
                dot={{ fill: "#2B6CB0", r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
          <HStack spacing={3} mt={2}>
            <Badge
              colorScheme="green"
              px={3}
              py={1}
              borderRadius="full"
              display="flex"
              alignItems="center"
              gap={1}
            >
              <Icon as={FiTrendingUp} />
              <Text fontSize="xs" fontWeight="semibold">
                18% more bookings
              </Text>
            </Badge>
            <Text fontSize="sm" color="gray.500" mt={0.5}>
              compared to last week
            </Text>
          </HStack>
        </Box>

        <Flex direction="column" gap={6}>
          <Box p={6} bg={cardBg} borderRadius="2xl" boxShadow={cardShadow}>
            <Flex justify="space-between" align="center" mb={4}>
              <Box>
                <Text fontSize="lg" fontWeight="600" color="blue.700">
                  Upcoming Appointments
                </Text>
                <Text fontSize="sm" color="gray.500">
                  Stay on top of today&apos;s schedule
                </Text>
              </Box>
              <Button variant="ghost" size="sm" colorScheme="blue">
                View all
              </Button>
            </Flex>
            <VStack align="stretch" spacing={4}>
              {upcomingAppointments.length > 0 ? upcomingAppointments.map((appt: any) => (
                <Box
                  key={appt._id}
                  p={4}
                  borderRadius="xl"
                  bg="blue.50"
                  _hover={{ bg: "blue.100" }}
                  transition="all 0.2s ease"
                >
                  <HStack align="flex-start" spacing={3}>
                    <Avatar name={appt.patientId?.fullName || "Patient"} src="" size="sm" />
                    <Box flex="1">
                      <Text fontWeight="600" color="blue.800">
                        {appt.patientId?.fullName || "Patient"}
                      </Text>
                      <Text fontSize="sm" color="blue.500">
                        {new Date(appt.appointmentDateTime || appt.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                      <Text fontSize="xs" color="blue.500" mt={1}>
                        {appt.reason || "General check-up"}
                      </Text>
                    </Box>
                    <VStack spacing={1} align="flex-end">
                      <Text color="blue.600" fontWeight="600">
                        {new Date(appt.appointmentDate).toLocaleDateString()}
                      </Text>
                      <Tag size="sm" colorScheme="green">
                        {appt.status}
                      </Tag>
                    </VStack>
                  </HStack>
                </Box>
              )) : (
                <Text color="gray.500" textAlign="center" py={4}>
                  No upcoming appointments
                </Text>
              )}
            </VStack>
          </Box>

          <Box p={6} bg={cardBg} borderRadius="2xl" boxShadow={cardShadow}>
            <Flex justify="space-between" align="center" mb={4}>
              <Box>
                <Text fontSize="lg" fontWeight="600" color="blue.700">
                  Care Reminders
                </Text>
                <Text fontSize="sm" color="gray.500">
                  Suggested follow-ups to close out today
                </Text>
              </Box>
              <Button variant="ghost" size="sm" colorScheme="blue">
                Manage
              </Button>
            </Flex>
            <Stack spacing={4} divider={<Divider borderColor="gray.100" />}>
              {careReminders.map((reminder) => (
                <Flex key={reminder.title} justify="space-between" align="flex-start" gap={3}>
                  <Box>
                    <Text fontWeight="600" color="gray.800">
                      {reminder.title}
                    </Text>
                    <Text fontSize="sm" color="gray.500">
                      {reminder.patient}
                    </Text>
                  </Box>
                  <Badge
                    borderRadius="full"
                    px={3}
                    py={1}
                    colorScheme={
                      reminder.urgency === "high"
                        ? "red"
                        : reminder.urgency === "medium"
                          ? "orange"
                          : "blue"
                    }
                  >
                    {reminder.due}
                  </Badge>
                </Flex>
              ))}
            </Stack>
          </Box>
        </Flex>
      </SimpleGrid>

      {/* Patient Files & Activity */}
      <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={6} mt={4}>
        <Box p={6} bg={cardBg} borderRadius="2xl" boxShadow={cardShadow}>
          <Flex justify="space-between" align="center" mb={4}>
            <Box>
              <Text fontSize="lg" fontWeight="600" color="blue.700">
                Patient Files
              </Text>
              <Text fontSize="sm" color="gray.500">
                Quick access to frequently used folders
              </Text>
            </Box>
            <Button size="sm" colorScheme="blue" variant="solid">
              View all
            </Button>
          </Flex>
          <Divider mb={4} />
          <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
            {patientFiles.map((file) => (
              <Flex
                key={file.name}
                align="center"
                p={4}
                bg="blue.50"
                borderRadius="xl"
                boxShadow="sm"
                transition="0.3s"
                _hover={{ bg: "blue.100" }}
              >
                <Flex
                  bg="blue.200"
                  borderRadius="full"
                  p={3}
                  align="center"
                  justify="center"
                  mr={3}
                >
                  <Icon as={file.icon} boxSize={5} color="blue.800" />
                </Flex>
                <Text fontWeight="500" color="blue.800">
                  {file.name}
                </Text>
              </Flex>
            ))}
          </SimpleGrid>
        </Box>

        <Box p={6} bg={cardBg} borderRadius="2xl" boxShadow={cardShadow}>
          <Flex justify="space-between" align="center" mb={4}>
            <Box>
              <Text fontSize="lg" fontWeight="600" color="blue.700">
                Recent Activity
              </Text>
              <Text fontSize="sm" color="gray.500">
                Keep an eye on what&apos;s happening across your practice
              </Text>
            </Box>
            <Button size="sm" variant="ghost" colorScheme="blue">
              See history
            </Button>
          </Flex>
          <Stack spacing={5}>
            {activityFeed.map((activity) => (
              <HStack key={activity.title} align="flex-start" spacing={3}>
                <Flex
                  w={10}
                  h={10}
                  borderRadius="lg"
                  align="center"
                  justify="center"
                  bg="gray.100"
                  color={activity.color}
                >
                  <Icon as={activity.icon} boxSize={5} />
                </Flex>
                <Box flex="1">
                  <Text fontWeight="600" color="gray.800">
                    {activity.title}
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    {activity.description}
                  </Text>
                </Box>
                <Text fontSize="xs" color="gray.400">
                  {activity.time}
                </Text>
              </HStack>
            ))}
          </Stack>
        </Box>
      </SimpleGrid>
    </Box>
  );
}