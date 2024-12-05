import {
  Box,
  Button,
  Container,
  Heading,
  Text,
  VStack,
  useColorModeValue,
} from "@chakra-ui/react";
import { ArrowRight } from "lucide-react";

export default function CTA() {
  return (
    <Box py={20} bg="coffee.700">
      <Container maxW="5xl">
        <VStack spacing={8} textAlign="center">
          <Heading
            fontSize={{ base: "3xl", md: "5xl" }}
            fontWeight="bold"
            color="white"
            fontFamily="Oxanium"
            lineHeight="1.2"
            letterSpacing="wide"
          >
            Ready to Transform Your
            <Text
              as="span"
              position="relative"
              color="coffee.600"
              _after={{
                content: '""',
                width: "full",
                height: "20%",
                position: "absolute",
                bottom: 1,
                left: 0,
                bg: "milk.500",
                opacity: 0.3,
                zIndex: -1,
              }}
            >
              {" "}
              Voting Experience?
            </Text>
          </Heading>

          <Text
            fontSize={{ base: "lg", md: "xl" }}
            color="whiteAlpha.900"
            maxW="2xl"
            fontFamily="Oxanium"
          >
            Join thousands of organizations worldwide who have already modernized
            their voting process with our blockchain technology.
          </Text>

          <Button
            rightIcon={<ArrowRight />}
            bg="coffee.600"
            color="white"
            size="lg"
            px={8}
            fontSize="md"
            fontWeight="bold"
            fontFamily="Oxanium"
            _hover={{
              bg: "coffee.500",
              transform: "translateY(-2px)",
            }}
            _active={{
              bg: "coffee.700",
            }}
            transition="all 0.2s"
            rounded="full"
          >
            Get Started Now
          </Button>
        </VStack>
      </Container>
    </Box>
  );
}
