'use client';

import React, { useState } from "react";
import {
    Box,
    Flex,
    IconButton,
    Avatar,
    HStack,
    VStack,
    Text,
    Drawer,
    DrawerContent,
    DrawerOverlay,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    MenuDivider,
    Button,
    CloseButton,
    Badge,
    InputGroup,
    InputLeftElement,
    Input,
    useColorModeValue,
} from "@chakra-ui/react";
import {
    FiMenu,
    FiBell,
    FiSettings,
    FiUser,
    FiLogOut,
    FiChevronDown,
    FiHome,
    FiCalendar,
    FiUsers,
    FiUserPlus,
    FiSearch,
    FiHelpCircle,
} from "react-icons/fi";
import { MdCurrencyRupee } from "react-icons/md"
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";

const sidebarLinks = [
    { name: "Dashboard", icon: FiHome, path: "/dashboard" },
    { name: "Appointment", icon: FiCalendar, path: "/appointments" },
    { name: "Doctor", icon: FiUserPlus, path: "/referral-doctors" },
    { name: "Patients", icon: FiUsers, path: "/patients" },
    { name: "Profile", icon: FiUser, path: "/profile" },
    { name: "Payment", icon: MdCurrencyRupee, path: "/payment" },
    { name: "Message", icon: FiBell, path: "/messages" },
    { name: "Settings", icon: FiSettings, path: "/setting" },
];

interface SidebarContentProps {
    onClose: () => void;
}

const SidebarContent: React.FC<SidebarContentProps> = ({ onClose }) => {
    const pathname = usePathname();
    const router = useRouter();
    const auth = useAuth();
    const sidebarBg = useColorModeValue("white", "gray.900");
    const sidebarBorderColor = useColorModeValue("gray.100", "gray.700");
    const sidebarHighlight = useColorModeValue("blue.50", "whiteAlpha.100");
    const sidebarTextMuted = useColorModeValue("gray.500", "gray.400");
    const sidebarButtonColor = useColorModeValue("gray.700", "gray.200");
    const sidebarButtonHoverBg = useColorModeValue("gray.100", "whiteAlpha.100");
    const sidebarButtonHoverColor = useColorModeValue("gray.900", "white");

    const handleLogout = () => {
        if (typeof auth?.logout === "function") {
            auth.logout((path: string) => router.push(path));
        }
    };

    return (
        <Box
            position="fixed"
            top="0"
            left="0"
            h="100vh"
            w={{ base: "full", md: "250px" }}
            bg={sidebarBg}
            bgGradient={useColorModeValue("linear(to-b, white 70%, #ebf8ff)", "linear(to-b, #1a202c 60%, rgba(59,130,246,0.08))")}
            borderRight="1px solid"
            borderColor={sidebarBorderColor}
            p="6"
            zIndex="100"
            overflowY="auto"
            display="flex"
            flexDirection="column"
            boxShadow={{ base: "xl", md: "none" }}
        >
            {/* Logo */}
            <Flex h="12" alignItems="center" justifyContent="space-between" mb="8">
                <Text
                    fontSize="lg"
                    fontWeight="bold"
                    color={useColorModeValue("blue.600", "blue.300")}
                >
                    Doctor Portal
                </Text>

                <CloseButton
                    display={{ base: "flex", md: "none" }}
                    onClick={onClose}
                />
            </Flex>


            {/* Navigation Items */}
            <VStack align="stretch" spacing="2" flex="1">
                {sidebarLinks.map((link) => {
                    const isActive = pathname === link.path;
                    return (
                        <NavItem
                            key={link.name}
                            icon={link.icon}
                            to={link.path}
                            isActive={isActive}
                            onClick={onClose}
                        >
                            {link.name}
                        </NavItem>
                    );
                })}
            </VStack>

            {/* Bottom Section */}
            <VStack align="stretch" spacing="3" pt="6" borderTop="1px solid" borderColor={sidebarBorderColor}>
                <NavItem icon={FiHelpCircle} isActive={false} onClick={onClose}>
                    Help
                </NavItem>
                <Button
                    leftIcon={<FiLogOut />}
                    variant="ghost"
                    justifyContent="flex-start"
                    w="full"
                    color={sidebarButtonColor}
                    _hover={{ bg: sidebarButtonHoverBg, color: sidebarButtonHoverColor }}
                    onClick={handleLogout}
                >
                    Log out
                </Button>
            </VStack>
        </Box>
    );
};

interface NavItemProps {
    icon: React.ComponentType<any>;
    children: React.ReactNode;
    to?: string;
    isActive: boolean;
    onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon: Icon, children, to, isActive, onClick }) => {
    const activeBg = useColorModeValue("rgba(59, 130, 246, 0.12)", "whiteAlpha.100");
    const hoverBg = useColorModeValue("gray.100", "whiteAlpha.100");
    const textColor = useColorModeValue("gray.600", "gray.300");
    const textActiveColor = useColorModeValue("blue.600", "blue.200");
    const hoverColor = useColorModeValue("gray.900", "white");
    const indicatorColor = useColorModeValue("blue.500", "blue.300");
    const iconContainerBg = useColorModeValue("blue.50", "whiteAlpha.100");
    const iconContainerActiveBg = useColorModeValue("blue.500", "blue.400");
    const iconColor = useColorModeValue("blue.600", "blue.200");

    if (to) {
        return (
            <Link href={to} onClick={onClick} style={{ textDecoration: "none" }}>
                <Flex
                    align="center"
                    gap="2"
                    px="2"
                    py="2"
                    borderRadius="xl"
                    position="relative"
                    bg={isActive ? activeBg : "transparent"}
                    color={isActive ? textActiveColor : textColor}
                    transition="all 0.2s ease"
                    _hover={{ bg: hoverBg, color: hoverColor, transform: "translateX(4px)" }}
                //boxShadow={isActive ? "0px 20px 35px -24px rgba(56, 161, 252, 0.9)" : "none"}
                >
                    <Flex
                        align="center"
                        justify="center"
                        w="8"
                        h="8"
                        borderRadius="lg"
                        bg={isActive ? iconContainerActiveBg : iconContainerBg}
                        color={isActive ? "white" : iconColor}
                        transition="all 0.2s ease"
                        boxShadow={isActive ? "inset 0 0 0 1px rgba(255,255,255,0.2)" : "none"}
                    >
                        <Icon size={18} />
                    </Flex>
                    <Text fontSize="sm" fontWeight={isActive ? "700" : "600"} letterSpacing="wide">
                        {children}
                    </Text>
                    {isActive && (
                        <Box
                            position="absolute"
                            right="3"
                            top="50%"
                            transform="translateY(-50%)"
                            w="2"
                            h="2"
                            borderRadius="full"
                            bg={indicatorColor}
                        />
                    )}
                </Flex>
            </Link>
        );
    }

    return (
        <Box onClick={onClick} cursor="pointer">
            <Flex
                align="center"
                gap="2"
                px="2"
                py="2"
                borderRadius="xl"
                position="relative"
                bg={isActive ? activeBg : "transparent"}
                color={isActive ? textActiveColor : textColor}
                transition="all 0.2s ease"
                _hover={{ bg: hoverBg, color: hoverColor, transform: "translateX(4px)" }}
            //boxShadow={isActive ? "0px 20px 35px -24px rgba(56, 161, 252, 0.9)" : "none"}
            >
                <Flex
                    align="center"
                    justify="center"
                    w="8"
                    h="8"
                    borderRadius="lg"
                    bg={isActive ? iconContainerActiveBg : iconContainerBg}
                    color={isActive ? "white" : iconColor}
                    transition="all 0.2s ease"
                    boxShadow={isActive ? "inset 0 0 0 1px rgba(255,255,255,0.2)" : "none"}
                >
                    <Icon size={18} />
                </Flex>
                <Text fontSize="sm" fontWeight={isActive ? "700" : "600"} letterSpacing="wide">
                    {children}
                </Text>
                {isActive && (
                    <Box
                        position="absolute"
                        right="3"
                        top="50%"
                        transform="translateY(-50%)"
                        w="2"
                        h="2"
                        borderRadius="full"
                        bg={indicatorColor}
                    />
                )}
            </Flex>
        </Box>
    );
};

interface AppBarProps {
    onOpen: () => void;
    user: any;
}

const AppBar: React.FC<AppBarProps> = ({ onOpen, user }) => {
    const auth = useAuth();
    const router = useRouter();
    const appBarBg = useColorModeValue("whiteAlpha.900", "gray.900");
    const appBarBorderColor = useColorModeValue("gray.100", "gray.700");
    const searchBg = useColorModeValue("gray.100", "gray.800");
    const searchTextColor = useColorModeValue("gray.600", "gray.300");
    const iconHoverBg = useColorModeValue("gray.100", "whiteAlpha.100");
    const badgeBg = useColorModeValue("blue.50", "whiteAlpha.100");
    const menuBg = useColorModeValue("white", "gray.800");
    const menuBorder = useColorModeValue("gray.100", "gray.700");
    const menuHoverBg = useColorModeValue("gray.100", "whiteAlpha.100");
    const firstName =
        typeof user?.name === "string" && user.name.trim()
            ? user.name.trim().split(" ")[0]
            : null;

    const handleLogout = () => {
        if (typeof auth?.logout === "function") {
            auth.logout((path: string) => router.push(path));
        }
    };

    return (
        <Flex
            position="sticky"
            top="0"
            left="0"
            right="0"
            height="80px"
            alignItems="center"
            justifyContent="space-between"
            px={{ base: "4", md: "8" }}
            bg={appBarBg}
            borderBottom="1px solid"
            borderColor={appBarBorderColor}
            boxShadow="0 20px 45px -28px rgba(59, 130, 246, 0.6)"
            backdropFilter="saturate(180%) blur(18px)"
            zIndex="90"
        >
            {/* Left Side */}
            <Flex align="center" gap="4" flex="1">
                <IconButton
                    display={{ base: "flex", md: "none" }}
                    onClick={onOpen}
                    variant="ghost"
                    aria-label="open menu"
                    icon={<FiMenu size={24} />}
                    rounded="xl"
                    _hover={{ bg: iconHoverBg }}
                />
                {/* <Box display={{ base: "none", lg: "flex" }} flexDir="column" gap="1">
                    <Badge
                        colorScheme="blue"
                        variant="subtle"
                        fontWeight="600"
                        textTransform="uppercase"
                        letterSpacing="widest"
                        px="2"
                        py="1"
                        borderRadius="md"
                        bg={badgeBg}
                        color={useColorModeValue("blue.600", "blue.200")}
                        w="fit-content"
                    >
                        Welcome back
                    </Badge>
                    <Text fontSize="lg" fontWeight="700" color={useColorModeValue("gray.800", "gray.100")}>
                        {firstName ? `Hello, ${firstName}` : "Let's make today productive"}
                    </Text>
                </Box> */}
                <InputGroup
                    display={{ base: "none", md: "flex" }}
                    maxW="350px"
                    bg={searchBg}
                    borderRadius="xl"
                    size="md"
                    border="1px solid"
                    borderColor={useColorModeValue("rgba(59,130,246,0.18)", "rgba(59,130,246,0.35)")}
                    boxShadow="inset 0 1px 2px rgba(15, 23, 42, 0.08)"
                >
                    <InputLeftElement pointerEvents="none" children={<FiSearch color="gray.400" />} />
                    <Input
                        placeholder="Search"
                        border="none"
                        bg="transparent"
                        fontSize="sm"
                        color={searchTextColor}
                        _focus={{ bg: "white", boxShadow: "0 0 0 2px rgba(66,153,225,0.1)" }}
                    />
                </InputGroup>
            </Flex>

            {/* Right Side */}
            <HStack spacing="6">
                {/* <IconButton
                    variant="ghost"
                    aria-label="mail"
                    icon={<FiUser size={20} />}
                    _hover={{ bg: "gray.100" }}
                /> */}

                <IconButton
                    variant="ghost"
                    aria-label="notifications"
                    icon={
                        <Box position="relative">
                            <FiBell size={20} />
                            <Badge
                                colorScheme="red"
                                borderRadius="full"
                                position="absolute"
                                top="-2"
                                right="-2"
                                fontSize="0.65em"
                                minW="18px"
                                h="18px"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                            >
                                5
                            </Badge>
                        </Box>
                    }
                    rounded="xl"
                    _hover={{ bg: iconHoverBg }}
                />

                <Menu>
                    <MenuButton
                        as={Button}
                        variant="ghost"
                        rightIcon={<FiChevronDown size={18} />}
                        px="3"
                        py="2"
                        borderRadius="xl"
                        _hover={{ bg: iconHoverBg }}
                    >
                        <HStack spacing="2">
                            <Avatar
                                size="sm"
                                name={user?.name || "Doctor"}
                                src={user?.avatar || "https://t4.ftcdn.net/jpg/02/69/98/99/240_F_269989951_9Gf7PWaRtrpm2EochO3D5WVn22sFZbNZ.jpg"}
                            />
                            <VStack display={{ base: "none", md: "flex" }} spacing="0" align="flex-start">
                                <Text fontSize="sm" fontWeight="600" color={useColorModeValue("gray.900", "gray.100")}>
                                    {user?.name || "Doctor"}
                                </Text>
                                <Text fontSize="xs" color={useColorModeValue("gray.500", "gray.400")}>
                                    {user?.email || "doctor@example.com"}
                                </Text>
                            </VStack>
                        </HStack>
                    </MenuButton>
                    <MenuList boxShadow="xl" border="1px solid" borderColor={menuBorder} bg={menuBg} py="2">
                        <MenuItem as={Link} href="/profile" icon={<FiUser size={16} />} _hover={{ bg: menuHoverBg }}>
                            Profile
                        </MenuItem>
                        <MenuItem as={Link} href="/setting" icon={<FiSettings size={16} />} _hover={{ bg: menuHoverBg }}>
                            Settings
                        </MenuItem>
                        <MenuDivider />
                        <MenuItem icon={<FiLogOut size={16} />} onClick={handleLogout} _hover={{ bg: menuHoverBg }}>
                            Logout
                        </MenuItem>
                    </MenuList>
                </Menu>
            </HStack>
        </Flex>
    );
};

interface DashboardProps {
    children: React.ReactNode;
}

export default function Dashboard({ children }: DashboardProps) {
    const [isOpen, setIsOpen] = useState(false);
    const auth = useAuth();
    const user = auth?.user;
    const layoutBg = useColorModeValue("gray.50", "gray.900");
    const contentBg = useColorModeValue("white", "gray.800");
    const contentBorder = useColorModeValue("rgba(226, 232, 240, 0.9)", "rgba(255, 255, 255, 0.08)");
    const contentShadow = useColorModeValue("0 25px 50px -30px rgba(30, 64, 175, 0.45)", "0 25px 50px -30px rgba(0, 0, 0, 0.85)");
    const drawerBg = useColorModeValue("white", "gray.900");

    const handleClose = () => setIsOpen(false);

    // Fetch user profile on component mount to ensure we have the latest data
    React.useEffect(() => {
        const loadUserProfile = async () => {
            if (auth?.fetchUserProfile && !user) {
                try {
                    await auth.fetchUserProfile();
                } catch (error) {
                    console.error('Failed to fetch user profile:', error);
                }
            }
        };

        loadUserProfile();
    }, [auth, user]);

    return (
        <Box minH="100vh" bg={layoutBg} transition="background-color 0.2s ease" suppressHydrationWarning>
            {/* Desktop Sidebar */}
            <Box display={{ base: "none", md: "block" }}>
                <SidebarContent onClose={handleClose} />
            </Box>

            {/* Mobile Drawer */}
            <Drawer isOpen={isOpen} placement="left" onClose={handleClose} size="xs">
                <DrawerOverlay />
                <DrawerContent bg={drawerBg} boxShadow="2xl">
                    <SidebarContent onClose={handleClose} />
                </DrawerContent>
            </Drawer>

            {/* Main Content */}
            <Box ml={{ base: 0, md: "250px" }} minH="100vh" transition="margin 0.2s ease">
                <AppBar onOpen={() => setIsOpen(true)} user={user} />

                <Box
                    as="main"
                    px={{ base: 4, md: 8, lg: 12 }}
                    py={{ base: 6, md: 8, lg: 10 }}
                    bg="transparent"
                    minH="calc(100vh - 80px)"
                >
                    <Box
                        bg={contentBg}
                        borderRadius="2xl"
                        border="1px solid"
                        borderColor={contentBorder}
                        boxShadow={contentShadow}
                        h="full"
                        minH={{ base: "calc(100vh - 120px)", md: "calc(100vh - 140px)" }}
                        p={{ base: 4, md: 6, lg: 8 }}
                    >
                        {children}
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}
