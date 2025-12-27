'use client'

import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Text,
  useToast,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Select,
  Flex,
  Link,
  IconButton,
  useColorModeValue,
  HStack,
  Stack,
  SimpleGrid,
  GridItem,
  useBreakpointValue,
  Image,
  Icon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Spinner,
} from "@chakra-ui/react";
import {
  FaUserMd,
  FaEye,
  FaEyeSlash,
  FaEnvelope,
  FaLock,
  FaClinicMedical,
  FaPhoneAlt,
  FaCalendarAlt,
  FaLinkedinIn,
  FaInstagram,

  FaTwitter,
  FaFacebookF,
  FaPhone,
} from "react-icons/fa";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";
import axios from "axios";

// 🎨 Refreshed blue/cyan palette
const PRIMARY_COLOR = "#0F4C75";
const PRIMARY_GRADIENT = "linear(to-br, #0EA5E9 0%, #0F4C75 100%)";
const ACCENT_COLOR = "#06B6D4";

const ambientBgImage =
  "https://images.unsplash.com/photo-1504439468489-c8920d796a29?auto=format&fit=crop&w=1400&q=80";
const heroImage =
  "https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=1200&q=80";

const Login = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [signupData, setSignupData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    gender: "",
    dateOfBirth: "",
  });
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [signupErrors, setSignupErrors] = useState({});
  const [loginErrors, setLoginErrors] = useState({});
  const [localLoading, setLocalLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const { login, signup } = useAuth();
  const toast = useToast();
  const router = useRouter();

  // Forgot Password State
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [forgotStep, setForgotStep] = useState(1); // 1 = email, 2 = reset
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotToken, setForgotToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (isSignup) {
      setSignupData((prev) => ({ ...prev, [name]: value }));
      setSignupErrors((prev) => ({ ...prev, [name]: "" }));
    } else {
      setLoginData((prev) => ({ ...prev, [name]: value }));
      setLoginErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLocalLoading(true);
    try {
      if (isSignup) {
        await signup(signupData);
        toast({
          title: "Registration Successful",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        setIsSignup(false);
      } else {
        await login(loginData);
        toast({
          title: "Welcome, Doctor!",
          status: "success",
          duration: 2500,
          isClosable: true,
        });
        router.push("/dashboard");
      }
    } catch (err: any) {
      toast({
        title: err.response?.data?.message || "Something went wrong",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLocalLoading(false);
    }
  };

  // Forgot Password Step 1: Request email
  const handleForgotPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setResetLoading(true);
    try {
      const res = await axios.post(
        "http://localhost:8080/api/doctor/auth/forgot-password",
        { email: forgotEmail }
      );
      toast({
        title: "Reset email sent",
        description: "Please check your email for the reset link/token.",
        status: "success",
        duration: 4000,
        isClosable: true,
      });
      setForgotStep(2);
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Could not initiate password reset.",
        status: "error",
        duration: 3500,
        isClosable: true,
      });
    } finally {
      setResetLoading(false);
    }
  };

  // Forgot Password Step 2: Enter token & new password
  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!forgotToken || !newPassword) {
      toast({
        title: "All fields are required.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    setResetLoading(true);
    try {
      await axios.post(
        `http://localhost:8080/api/doctor/auth/reset-password/${forgotToken}`,
        { newPassword }
      );
      toast({
        title: "Password Reset Successful",
        description: "You may now log in with your new password.",
        status: "success",
        duration: 3500,
        isClosable: true,
      });
      setForgotStep(1);
      setForgotEmail("");
      setForgotToken("");
      setNewPassword("");
      onClose();
    } catch (err: any) {
      toast({
        title: "Reset failed",
        description:
          err.response?.data?.message ||
          "Invalid token or something went wrong.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setResetLoading(false);
    }
  };

  const pageBg = useColorModeValue(
    "linear-gradient(135deg, #ECFEFF 0%, #E0F2FE 50%, #F8FAFC 100%)",
    "linear-gradient(135deg, #0F172A 0%, #0B1120 45%, #082F49 100%)"
  );
  const cardBg = useColorModeValue("rgba(255,255,255,0.78)", "rgba(15,23,42,0.9)");
  const inputBg = useColorModeValue("white", "rgba(15,23,42,0.85)");
  const subtleText = useColorModeValue("gray.600", "gray.300");
  const accentLinkColor = useColorModeValue("#0284C7", "#38BDF8");
  const layoutPadding = useBreakpointValue({ base: 6, md: 10 });
  const focusBorderColor = useColorModeValue("#38BDF8", "#22D3EE");
  const containerWidth = isSignup
    ? { base: "92%", md: "920px", lg: "100%" }
    : { base: "88%", md: "840px", lg: "900px" };
  const containerMaxWidth = isSignup ? "5xl" : "4xl";
  const formGridColumns = isSignup ? { base: 1, md: 2 } : { base: 1 };

  return (
    <Flex
      minH="100vh"
      align="center"
      justify="center"
      bg={pageBg}
      position="relative"
      overflow="hidden"
    >
      <Box
        position="absolute"
        inset={0}
        bgImage={`url(${ambientBgImage})`}
        bgSize="cover"
        bgPosition="center"
        opacity={0.18}
        filter="blur(6px)"
        zIndex={0}
      />
      <Box
        position="absolute"
        top={{ base: "-120px", md: "-180px" }}
        right={{ base: "-80px", md: "-160px" }}
        w={{ base: "260px", md: "420px" }}
        h={{ base: "260px", md: "420px" }}
        bgGradient="radial(#38BDF8 0%, transparent 65%)"
        opacity={0.45}
        filter="blur(2px)"
        zIndex={0}
      />
      <Box
        position="absolute"
        bottom={{ base: "-140px", md: "-200px" }}
        left={{ base: "-100px", md: "-180px" }}
        w={{ base: "300px", md: "480px" }}
        h={{ base: "300px", md: "480px" }}
        bgGradient="radial(#0EA5E9 0%, transparent 70%)"
        opacity={0.32}
        filter="blur(3px)"
        zIndex={0}
      />

      {/* Main Container */}
      <Flex
        position="relative"
        zIndex={1}
        bg={cardBg}
        backdropFilter="blur(18px)"
        border="1px solid rgba(14,165,233,0.18)"
        boxShadow="0 14px 42px -18px rgba(2,132,199,0.35)"
        rounded="3xl"
        overflow="hidden"
        w={containerWidth}
        maxW={containerMaxWidth}
      >
        {/* Left Illustration Section */}
        <Box
          display={{ base: "none", md: "flex" }}
          flex={isSignup ? 0.65 : 1}
          bgGradient="linear(to-br, rgba(14,165,233,0.95), rgba(15,76,117,0.98))"
          position="relative"
          color="white"
          p={10}
          overflow="hidden"
        >
          <Flex direction="column" justify="space-between" w="full">
            <Box>
              <HStack spacing={3}>
                <Box
                  w={10}
                  h={10}
                  bg="whiteAlpha.200"
                  rounded="xl"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  boxShadow="0 10px 25px -15px rgba(8,145,178,0.7)"
                >
                  <FaUserMd size={20} />
                </Box>
                <Box>
                  <Text fontWeight="bold" letterSpacing="wide">
                    Doctor Portal
                  </Text>
                  <Text fontSize="xs" >
                    Health Care Digitalized
                  </Text>
                </Box>
              </HStack>
            </Box>

            <Box position="relative" alignSelf="center" mt={8} mb={8}>
              <Box
                position="absolute"
                top="-20%"
                left="-20%"
                w="280px"
                h="280px"
                bg="whiteAlpha.200"
                rounded="50%"
                filter="blur(40px)"
              />
              <Box
                position="relative"
                w="260px"
                h="260px"
                bg="linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.05))"
                border="1px solid rgba(255,255,255,0.2)"
                rounded="3xl"
                display="flex"
                alignItems="center"
                justifyContent="center"
                overflow="hidden"
                boxShadow="0 20px 40px -18px rgba(8,47,73,0.7)"
              >
                <Image
                  src={heroImage}
                  alt="Doctor hero"
                  objectFit="cover"
                  w="full"
                  h="full"
                />
                <Box
                  position="absolute"
                  inset={0}
                  bg="linear-gradient(180deg, rgba(14,165,233,0.25) 0%, transparent 60%)"
                />
                <Box
                  position="absolute"
                  bottom="24px"
                  left="24px"
                  right="24px"
                  bg="rgba(8,47,73,0.65)"
                  rounded="lg"
                  px={4}
                  py={3}
                >
                  <Text fontWeight="semibold">Care That Fits Your Practice</Text>
                  <Text fontSize="xs" color="whiteAlpha.700">
                    Flexible scheduling tools designed for every medical team.
                  </Text>
                </Box>
              </Box>
              <Box
                position="absolute"
                top="18%"
                right="-18%"
                w="92px"
                h="92px"
                bg="linear-gradient(135deg, #22d3ee, #38bdf8)"
                rounded="3xl"
                transform="rotate(25deg)"
                boxShadow="0 12px 30px -16px rgba(34,211,238,0.8)"
              />
              <Box
                position="absolute"
                bottom="-12%"
                left="-14%"
                w="120px"
                h="120px"
                border="3px solid rgba(255,255,255,0.35)"
                rounded="full"
              />
            </Box>

            <Box>
              <Text fontSize="sm" color="whiteAlpha.800" maxW="80%" mt={-10}>
                "Keep every appointment on track with automated reminders and insightful analytics
                crafted for busy medical professionals."
              </Text>
            </Box>
          </Flex>

          <HStack
            position="absolute"
            bottom="4"
            right="10"
            spacing={3}
            color="whiteAlpha.800"
          >
            {[FaLinkedinIn, FaInstagram, FaTwitter, FaFacebookF].map((IconRef, index) => (
              <Flex
                key={index}
                align="center"
                justify="center"

                w={9}
                h={9}
                bg="whiteAlpha.200"
                rounded="full"
                border="1px solid rgba(255,255,255,0.25)"
              >
                <Icon as={IconRef} boxSize={4} />
              </Flex>
            ))}
          </HStack>
        </Box>


        <Box
          flex={1.1}
          p={layoutPadding}
          bg="rgba(255,255,255,0.6)"
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
        >
          <VStack
            spacing={8}
            w="full"
            maxW={isSignup ? { base: "full", md: "600px" } : { base: "full", md: "500px" }}
          >
            <HStack spacing={3} align="center">
              {/* <Box
                bg="white"
                color={PRIMARY_COLOR}
                p={2}
                rounded="full"
                boxShadow="0 10px 18px -12px rgba(15,76,117,0.45)"
              >
                <FaUserMd size={24} />
              </Box> */}
              <Text
                fontSize={{ base: "2xl", md: "3xl" }}
                fontWeight="bold"
                bgGradient={PRIMARY_GRADIENT}
                bgClip="text"
              >
                Doctor Portal
              </Text>
            </HStack>

            <Box
              bg="white"
              rounded="2xl"
              p={{ base: 6, md: 8 }}
              boxShadow="0 18px 35px -25px rgba(15,76,117,0.45)"
              border="1px solid rgba(148,163,184,0.15)"
            >
              <HStack
                spacing={1}
                bg="gray.100"
                p={1}
                rounded="full"
                mb={6}
              >
                <Button
                  flex={1}
                  variant="ghost"
                  onClick={() => setIsSignup(true)}
                  bg={isSignup ? "white" : "transparent"}
                  color={isSignup ? PRIMARY_COLOR : "gray.500"}
                  fontWeight="semibold"
                  size="sm"
                  rounded="full"
                  _hover={{ bg: isSignup ? "white" : "whiteAlpha.600" }}
                  boxShadow={isSignup ? "sm" : "none"}
                >
                  Sign Up
                </Button>
                <Button
                  flex={1}
                  variant="ghost"
                  onClick={() => setIsSignup(false)}
                  bg={!isSignup ? "white" : "transparent"}
                  color={!isSignup ? PRIMARY_COLOR : "gray.500"}
                  fontWeight="semibold"
                  size="sm"
                  rounded="full"
                  _hover={{ bg: !isSignup ? "white" : "whiteAlpha.600" }}
                  boxShadow={!isSignup ? "sm" : "none"}
                >
                  Sign In
                </Button>
              </HStack>

              <form onSubmit={handleSubmit}>
                <VStack spacing={4} align="stretch">
                  <SimpleGrid columns={formGridColumns} spacing={4} w="full">
                    {isSignup && (
                      <>
                        <GridItem>
                          <FormControl isRequired>
                            <FormLabel color={PRIMARY_COLOR} fontSize="sm">
                              Full Name
                            </FormLabel>
                            <InputGroup>
                              <InputLeftElement pointerEvents="none" color="cyan.500">
                                <FaUserMd />
                              </InputLeftElement>
                              <Input
                                name="name"
                                value={signupData.name}
                                onChange={handleChange}
                                placeholder="Dr. John Doe"
                                bg={inputBg}
                                borderColor="rgba(14,165,233,0.25)"
                                focusBorderColor={focusBorderColor}
                              />
                            </InputGroup>
                          </FormControl>
                        </GridItem>

                        <GridItem>
                          <FormControl isRequired>
                            <FormLabel color={PRIMARY_COLOR} fontSize="sm">
                              Phone
                            </FormLabel>
                            <InputGroup>
                              <InputLeftElement pointerEvents="none" color="cyan.500">
                                <FaPhoneAlt />
                              </InputLeftElement>
                              <Input
                                name="phone"
                                type="tel"
                                value={signupData.phone}
                                onChange={handleChange}
                                placeholder="10-digit phone number"
                                bg={inputBg}
                                borderColor="rgba(14,165,233,0.25)"
                                focusBorderColor={focusBorderColor}
                              />
                            </InputGroup>
                          </FormControl>
                        </GridItem>

                        <GridItem>
                          <FormControl isRequired>
                            <FormLabel color={PRIMARY_COLOR} fontSize="sm">
                              Gender
                            </FormLabel>
                            <Select
                              name="gender"
                              value={signupData.gender}
                              onChange={handleChange}
                              placeholder="Select gender"
                              bg={inputBg}
                              borderColor="rgba(14,165,233,0.25)"
                              focusBorderColor={focusBorderColor}
                            >
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                              <option value="Other">Other</option>
                            </Select>
                          </FormControl>
                        </GridItem>

                        <GridItem>
                          <FormControl isRequired>
                            <FormLabel color={PRIMARY_COLOR} fontSize="sm">
                              Date of Birth
                            </FormLabel>
                            <InputGroup>
                              <InputLeftElement pointerEvents="none" color="cyan.500">
                                <FaCalendarAlt />
                              </InputLeftElement>
                              <Input
                                name="dateOfBirth"
                                type="date"
                                value={signupData.dateOfBirth}
                                onChange={handleChange}
                                max={new Date().toISOString().split("T")[0]}
                                bg={inputBg}
                                borderColor="rgba(14,165,233,0.25)"
                                focusBorderColor={focusBorderColor}
                              />
                            </InputGroup>
                          </FormControl>
                        </GridItem>
                      </>
                    )}

                    <GridItem>
                      <FormControl isRequired>
                        <FormLabel color={PRIMARY_COLOR} fontSize="sm">
                          Email
                        </FormLabel>
                        <InputGroup>
                          <InputLeftElement pointerEvents="none" color="cyan.500">
                            <FaEnvelope />
                          </InputLeftElement>
                          <Input
                            name="email"
                            type="email"
                            placeholder="doctor@clinic.com"
                            value={isSignup ? signupData.email : loginData.email}
                            onChange={handleChange}
                            bg={inputBg}
                            borderColor="rgba(14,165,233,0.25)"
                            focusBorderColor={focusBorderColor}
                          />
                        </InputGroup>
                      </FormControl>
                    </GridItem>

                    <GridItem>
                      <FormControl isRequired>
                        <FormLabel color={PRIMARY_COLOR} fontSize="sm">
                          Password
                        </FormLabel>
                        <InputGroup>
                          <InputLeftElement pointerEvents="none" color="cyan.500">
                            <FaLock />
                          </InputLeftElement>
                          <Input
                            name="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter password"
                            value={isSignup ? signupData.password : loginData.password}
                            onChange={handleChange}
                            bg={inputBg}
                            borderColor="rgba(14,165,233,0.25)"
                            focusBorderColor={focusBorderColor}
                          />
                          <InputRightElement>
                            <IconButton
                              variant="ghost"
                              aria-label="toggle password"
                              icon={showPassword ? <FaEyeSlash /> : <FaEye />}
                              onClick={() => setShowPassword(!showPassword)}
                              color={ACCENT_COLOR}
                            />
                          </InputRightElement>
                        </InputGroup>
                      </FormControl>
                    </GridItem>
                  </SimpleGrid>

                  <Flex
                    w="full"
                    justify="space-between"
                    align={{ base: "flex-start", sm: "center" }}
                    direction={{ base: "column", sm: "row" }}
                    gap={3}
                  >
                    {!isSignup && (
                      <Link
                        color={accentLinkColor}
                        fontWeight="medium"
                        onClick={onOpen}
                        _hover={{ textDecoration: "underline" }}
                        mt={2}
                        fontSize="sm"
                        cursor="pointer"
                        tabIndex={0}
                      >
                        Forgot password?
                      </Link>
                    )}
                  </Flex>

                  <Button
                    type="submit"
                    w="full"
                    bgGradient={PRIMARY_GRADIENT}
                    color="white"
                    size="lg"
                    rounded="xl"
                    isLoading={localLoading}
                    boxShadow="0 18px 32px -18px rgba(14,165,233,0.55)"
                    transition="all 0.2s ease"
                    _hover={{
                      bgGradient: "linear(to-r, #0EA5E9, #0F4C75)",
                      transform: "translateY(-2px)",
                      boxShadow: "0 22px 38px -16px rgba(14,165,233,0.6)",
                    }}
                  >
                    {isSignup ? "Sign Up" : "Login"}
                  </Button>
                </VStack>
              </form>

              <Text textAlign="center" mt={6} color={PRIMARY_COLOR} fontSize="sm">
                {isSignup ? (
                  <>
                    Already have an account?{" "}
                    <Link
                      color={accentLinkColor}
                      fontWeight="bold"
                      onClick={() => setIsSignup(false)}
                      _hover={{ textDecoration: "underline" }}
                    >
                      Sign in here
                    </Link>
                  </>
                ) : (
                  <>
                    New doctor?{" "}
                    <Link
                      color={accentLinkColor}
                      fontWeight="bold"
                      onClick={() => setIsSignup(true)}
                      _hover={{ textDecoration: "underline" }}
                    >
                      Create an account
                    </Link>
                  </>
                )}
              </Text>
            </Box>

            <Stack spacing={2} align="center" color={subtleText} fontSize="xs">
              <HStack spacing={4}>
                <Link color={accentLinkColor} href="#">
                  Support
                </Link>
                <Text>•</Text>
                <Link color={accentLinkColor} href="#">
                  Privacy
                </Link>
                <Text>•</Text>
                <Link color={accentLinkColor} href="#">
                  Terms
                </Link>
              </HStack>
              <HStack spacing={3}>
                <Icon as={FaPhone} />
                <Text>+1 (800) 555-0123</Text>
              </HStack>
              <Text>hello@mycarelabs.com</Text>
            </Stack>
          </VStack>
        </Box>
      </Flex>

      {/* Forgot Password Modal */}
      <Modal isOpen={isOpen} onClose={() => {
        setForgotStep(1); setForgotEmail(""); setForgotToken(""); setNewPassword(""); onClose();
      }}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader color={PRIMARY_COLOR}>
            {forgotStep === 1 ? "Forgot Password" : "Reset Password"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {forgotStep === 1 ? (
              <form id="forgot-form" onSubmit={handleForgotPassword}>
                <FormControl isRequired mb={4}>
                  <FormLabel>Email address</FormLabel>
                  <Input
                    name="forgotEmail"
                    type="email"
                    placeholder="Your registered email"
                    value={forgotEmail}
                    onChange={e => setForgotEmail(e.target.value)}
                  />
                </FormControl>
              </form>
            ) : (
              <form id="reset-form" onSubmit={handleResetPassword}>
                <FormControl isRequired mb={4}>
                  <FormLabel>Token from your email</FormLabel>
                  <Input
                    name="forgotToken"
                    placeholder="Paste the reset token here"
                    value={forgotToken}
                    onChange={e => setForgotToken(e.target.value)}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>New Password</FormLabel>
                  <InputGroup>
                    <Input
                      name="newPassword"
                      type="password"
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                    />
                  </InputGroup>
                </FormControl>
              </form>
            )}
          </ModalBody>
          <ModalFooter>
            {forgotStep === 1 ? (
              <Button
                colorScheme="blue"
                mr={3}
                form="forgot-form"
                type="submit"
                isLoading={resetLoading}
                w="100%"
              >
                {resetLoading ? <Spinner size="sm" /> : "Send Reset Email"}
              </Button>
            ) : (
              <Button
                colorScheme="blue"
                mr={3}
                form="reset-form"
                type="submit"
                isLoading={resetLoading}
                w="100%"
              >
                {resetLoading ? <Spinner size="sm" /> : "Reset Password"}
              </Button>
            )}
            {forgotStep === 2 && (
              <Button
                variant="ghost"
                color={PRIMARY_COLOR}
                ml={2}
                onClick={() => {
                  setForgotStep(1);
                  setForgotToken("");
                  setNewPassword("");
                }}
              >
                Start Over
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
};

export default Login;