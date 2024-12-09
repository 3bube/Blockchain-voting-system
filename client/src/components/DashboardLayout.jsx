import { useState } from "react";
import {
  Box,
  Flex,
  IconButton,
  useColorModeValue,
  Text,
  VStack,
  Avatar,
  HStack,
  Icon,
} from "@chakra-ui/react";
import { Outlet, NavLink } from "react-router-dom";
import {
  Menu,
  Home,
  Vote,
  History,
  Settings,
  DoorOpen,
  Trash,
  CheckCheck,
} from "lucide-react";
import useAuth from "../context/useAuth";
import TimeStatus from "./Dashboard/TimeStatus";
import { useLocation } from "react-router-dom";

const SidebarLink = ({ icon, children, to, isCollapsed, onClick }) => {
  const activeBg = useColorModeValue("coffee.150", "coffee.900");
  const hoverBg = useColorModeValue("coffee.100", "coffee.800");

  const content = (
    <HStack
      w="full"
      px={4}
      py={3}
      cursor="pointer"
      bg={onClick ? "transparent" : undefined}
      _hover={{ bg: hoverBg }}
      transition="all 0.2s"
      spacing={4}
      onClick={onClick}
    >
      <Icon as={icon} boxSize={5} />
      {!isCollapsed && <Text>{children}</Text>}
    </HStack>
  );

  if (onClick) {
    return content;
  }

  return (
    <NavLink to={to}>
      {({ isActive }) => (
        <HStack
          w="full"
          px={4}
          py={3}
          cursor="pointer"
          bg={isActive ? activeBg : "transparent"}
          _hover={{ bg: !isActive && hoverBg }}
          transition="all 0.2s"
          spacing={4}
        >
          <Icon as={icon} boxSize={5} />
          {!isCollapsed && <Text>{children}</Text>}
        </HStack>
      )}
    </NavLink>
  );
};

const DashboardLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const { currentUser, logout } = useAuth();

  const isCreateVote = location.pathname.startsWith("/dashboard/create-vote");
  const isJoinRoom = location.pathname.startsWith("/dashboard/join-room");
  const isRoom = location.pathname.startsWith("/dashboard/room");
  const isVoteDetails = location.pathname.startsWith("/dashboard/vote-details");

  if (isCreateVote) return <Outlet />;
  if (isJoinRoom) return <Outlet />;
  if (isRoom) return <Outlet />;
  if (isVoteDetails) return <Outlet />;

  const sidebarBg = useColorModeValue("coffee.200", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  const sidebarLinks = [
    {
      section: "Dashboard",
      links: [
        { to: "/dashboard", icon: Home, label: "Dashboard" },
        // {
        //   to: "/dashboard/vote?ended=false",
        //   icon: Vote,
        //   label: "Ongoing Vote",
        // },
        // {
        //   to: "/dashboard/vote?ended=true",
        //   icon: ListEnd,
        //   label: "Ended Vote",
        // },
        { to: "/dashboard/history", icon: History, label: "History" },
        { to: "/dashboard/trash", icon: Trash, label: "Trash" },
      ],
    },
    {
      section: "Room",
      links: [{ to: "/dashboard/join-room", icon: CheckCheck, label: "Room" }],
    },
    {
      section: "Other",
      links: [
        { to: "/settings", icon: Settings, label: "Settings" },
        { icon: DoorOpen, label: "Logout", onClick: logout },
      ],
    },
  ];

  return (
    <Flex h="100vh">
      {/* Sidebar */}
      <Box
        w={isCollapsed ? "80px" : "240px"}
        bg={sidebarBg}
        h="full"
        borderRight="1px"
        borderColor={borderColor}
        transition="width 0.2s"
        position="relative"
      >
        {/* Logo/Header */}
        <Flex
          h="16"
          alignItems="center"
          justifyContent={isCollapsed ? "center" : "space-between"}
          px={4}
          borderColor={borderColor}
        >
          {!isCollapsed && (
            <Text fontWeight="bold" fontSize={20}>
              Polls.io
            </Text>
          )}
          <IconButton
            aria-label="Toggle Sidebar"
            icon={<Menu />}
            onClick={() => setIsCollapsed(!isCollapsed)}
            variant="ghost"
            size="sm"
          />
        </Flex>

        <Flex
          py={3}
          alignItems="center"
          direction={"column"}
          justifyContent="space-between"
          px={4}
        >
          {!isCollapsed && (
            <Avatar
              size="lg"
              name={currentUser?.name}
              src={currentUser?.photoURL}
            />
          )}
          {!isCollapsed && (
            <>
              <Text fontWeight="semibold" fontSize={20} color={"white"}>
                {currentUser?.name ?? "User"}
              </Text>
              <Text>Voter</Text>
            </>
          )}
        </Flex>

        {/* Navigation Links */}
        <VStack spacing={0} align="stretch" pt={4}>
          {sidebarLinks.map((section) => (
            <Box key={section.section}>
              <Text
                px={4}
                py={2}
                fontSize="sm"
                fontWeight="bold"
                color="gray.600"
              >
                {section.section}
              </Text>
              {section.links.map((link) => (
                <SidebarLink
                  key={link.label}
                  to={link.to}
                  icon={link.icon}
                  isCollapsed={isCollapsed}
                  onClick={link.onClick}
                >
                  {link.label}
                </SidebarLink>
              ))}
            </Box>
          ))}
        </VStack>
      </Box>

      {/* Main Content */}
      <Box flex={1} overflow="auto">
        <Outlet />
      </Box>

      {/* Right Sidebar */}
      <Box p={5} w={"340px"} bg={"milk.500"}>
        <TimeStatus />
      </Box>
    </Flex>
  );
};

export default DashboardLayout;
