import { Link as ScrollLink } from "react-scroll";
import { Link as RouterLink } from "react-router-dom";
import { useState } from "react";
import {
  Box,
  Flex,
  Button,
  Stack,
  Container,
  Image,
  IconButton,
  useDisclosure,
  HStack,
  Link as ChakraLink,
} from "@chakra-ui/react";
import { Menu, X } from "lucide-react";

const NAV_ITEMS = [
  { label: "Home", to: "hero" },
  { label: "Features", to: "features" },
  { label: "About", to: "about" },
  { label: "Reviews", to: "reviews" },
];

const NavLink = ({ children, to }) => {
  const [active, setActive] = useState(false);

  return (
    <ScrollLink
      to={to}
      spy={true}
      smooth={true}
      duration={600}
      offset={-24}
      onSetActive={() => setActive(true)}
      onSetInactive={() => setActive(false)}
    >
      <ChakraLink
        px={2}
        py={1}
        rounded="md"
        color={active ? "coffee.600" : "black"}
        fontWeight={active ? "bold" : "normal"}
        _hover={{
          textDecoration: "none",
          bg: "milk.500",
        }}
      >
        {children}
      </ChakraLink>
    </ScrollLink>
  );
};

export default function Header() {
  const { isOpen, onToggle } = useDisclosure();

  return (
    <Box
      as="nav"
      position="fixed"
      top={0}
      left={0}
      right={0}
      p={4}
      w="100%"
      zIndex={999}
      backdropFilter="blur(10px)"
      bg="rgba(251, 248, 238, 0.9)"
    >
      <Container maxW="5xl">
        <Flex h={16} alignItems="center" justifyContent="space-between">
          <IconButton
            size="md"
            icon={isOpen ? <X /> : <Menu />}
            aria-label="Open Menu"
            display={{ md: "none" }}
            onClick={onToggle}
            variant="ghost"
            _hover={{
              bg: "milk.500",
            }}
          />

          <HStack spacing={8} alignItems="center">
            <Box>
              <Image src="/images/POLLS.IO.png" alt="logo" w="100px" />
            </Box>
          </HStack>
          <HStack as="nav" spacing={4} display={{ base: "none", md: "flex" }}>
            {NAV_ITEMS.map((navItem) => (
              <NavLink key={navItem.label} to={navItem.to}>
                {navItem.label}
              </NavLink>
            ))}
          </HStack>

          <Stack
            flex={{ base: 1, md: 0 }}
            justify="flex-end"
            direction="row"
            spacing={6}
          >
            <Button
              bg={"coffee.500"}
              display={{ base: "none", md: "inline-flex" }}
              as={RouterLink}
              to="/login"
            >
              Login
            </Button>
          </Stack>
        </Flex>

        {/* Mobile menu */}
        {isOpen && (
          <Box pb={4} display={{ md: "none" }}>
            <Stack as="nav" spacing={4}>
              {NAV_ITEMS.map((navItem) => (
                <NavLink key={navItem.label} to={navItem.to}>
                  {navItem.label}
                </NavLink>
              ))}
              <Button
                as={RouterLink}
                to="/login"
                w="full"
                fontSize="sm"
                variant="outline"
              >
                Login
              </Button>
            </Stack>
          </Box>
        )}
      </Container>
    </Box>
  );
}
