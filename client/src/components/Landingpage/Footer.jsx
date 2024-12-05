import {
  Box,
  Container,
  SimpleGrid,
  Stack,
  Text,
  Image,
  IconButton,
  Link,
  HStack,
  VStack,
  Divider,
} from "@chakra-ui/react";
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

const ListHeader = ({ children }) => {
  return (
    <Text fontWeight="600" fontSize="lg" mb={2} color="coffee.600">
      {children}
    </Text>
  );
};

export default function Footer() {
  return (
    <Box bg="milk.500">
      <Container as={Stack} maxW="6xl" py={10}>
        <SimpleGrid
          templateColumns={{ sm: "1fr 1fr", md: "2fr 1fr 1fr 1fr" }}
          spacing={8}
        >
          <Stack spacing={6}>
            <Box>
              <Image src="/images/POLLS.IO.png" alt="Polls.io" h="20px" />
            </Box>
            <Text fontSize="sm" color="gray.600" maxW="300px">
              Transform your voting experience with our secure blockchain-based
              platform. Making democracy more accessible and transparent.
            </Text>
            <HStack spacing={4}>
              <IconButton
                aria-label="Facebook"
                icon={<Facebook size={20} />}
                rounded="full"
                bg="coffee.600"
                color="white"
                _hover={{ bg: "coffee.700" }}
              />
              <IconButton
                aria-label="Twitter"
                icon={<Twitter size={20} />}
                rounded="full"
                bg="coffee.600"
                color="white"
                _hover={{ bg: "coffee.700" }}
              />
              <IconButton
                aria-label="Instagram"
                icon={<Instagram size={20} />}
                rounded="full"
                bg="coffee.600"
                color="white"
                _hover={{ bg: "coffee.700" }}
              />
              <IconButton
                aria-label="LinkedIn"
                icon={<Linkedin size={20} />}
                rounded="full"
                bg="coffee.600"
                color="white"
                _hover={{ bg: "coffee.700" }}
              />
            </HStack>
          </Stack>
          <Stack align="flex-start">
            <ListHeader>Company</ListHeader>
            <Link href="#" color="gray.600" _hover={{ color: "coffee.600" }}>
              About us
            </Link>
            <Link href="#" color="gray.600" _hover={{ color: "coffee.600" }}>
              Blog
            </Link>
            <Link href="#" color="gray.600" _hover={{ color: "coffee.600" }}>
              Contact us
            </Link>
            <Link href="#" color="gray.600" _hover={{ color: "coffee.600" }}>
              Pricing
            </Link>
            <Link href="#" color="gray.600" _hover={{ color: "coffee.600" }}>
              Testimonials
            </Link>
          </Stack>
          <Stack align="flex-start">
            <ListHeader>Support</ListHeader>
            <Link href="#" color="gray.600" _hover={{ color: "coffee.600" }}>
              Help Center
            </Link>
            <Link href="#" color="gray.600" _hover={{ color: "coffee.600" }}>
              Terms of Service
            </Link>
            <Link href="#" color="gray.600" _hover={{ color: "coffee.600" }}>
              Legal
            </Link>
            <Link href="#" color="gray.600" _hover={{ color: "coffee.600" }}>
              Privacy Policy
            </Link>
            <Link href="#" color="gray.600" _hover={{ color: "coffee.600" }}>
              Status
            </Link>
          </Stack>
          <Stack align="flex-start">
            <ListHeader>Get Started</ListHeader>
            <Link href="#" color="gray.600" _hover={{ color: "coffee.600" }}>
              Create Poll
            </Link>
            <Link href="#" color="gray.600" _hover={{ color: "coffee.600" }}>
              Join Poll
            </Link>
            <Link href="#" color="gray.600" _hover={{ color: "coffee.600" }}>
              View Results
            </Link>
            <Link href="#" color="gray.600" _hover={{ color: "coffee.600" }}>
              Features
            </Link>
            <Link href="#" color="gray.600" _hover={{ color: "coffee.600" }}>
              Documentation
            </Link>
          </Stack>
        </SimpleGrid>

        <Divider my={8} borderColor="gray.300" />

        <VStack>
          <Text pt={2} fontSize="sm" textAlign="center" color="gray.600">
            © 2024 Polls.io. All rights reserved
          </Text>
          <Text fontSize="sm" color="gray.500">
            Made with ❤️ by Polls.io Team
          </Text>
        </VStack>
      </Container>
    </Box>
  );
}
