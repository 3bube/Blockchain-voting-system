import {
  Container,
  Stack,
  Flex,
  Box,
  Heading,
  Text,
  Button,
  Icon,
  Image,
} from "@chakra-ui/react";
import { ArrowRight } from "lucide-react";
import { Element } from "react-scroll";

export default function Hero() {
  return (
    <Element name="hero">
      <Box bg="milk.500">
        <Container maxW={"5xl"}>
          <Stack
            align={"center"}
            spacing={{ base: 8, md: 10 }}
            py={{ base: 20, md: 28 }}
            direction={{ base: "column", md: "row" }}
          >
            <Stack flex={1} spacing={{ base: 5, md: 10 }}>
              <Heading
                lineHeight={1.1}
                fontWeight={600}
                fontSize={{ base: "3xl", sm: "4xl", lg: "6xl" }}
              >
                <Text
                  as={"span"}
                  position={"relative"}
                  color="coffee.500"
                  _after={{
                    content: "''",
                    width: "full",
                    height: "30%",
                    position: "absolute",
                    bottom: 1,
                    left: 0,
                    bg: "milk.400",
                    zIndex: -1,
                  }}
                >
                  Secure Voting,
                </Text>
                <br />
                <Text as={"span"} color={"coffee.400"}>
                  Powered by Blockchain
                </Text>
              </Heading>
              <Text color={"gray.500"} fontSize={{ base: "lg", lg: "xl" }}>
                Experience the future of voting with our cutting-edge blockchain
                technology. Secure, transparent, and tamper-proof elections are
                now at your fingertips.
              </Text>
              <Stack
                spacing={{ base: 4, sm: 6 }}
                direction={{ base: "column", sm: "row" }}
              >
                <Button
                  rounded={"full"}
                  size={"lg"}
                  fontWeight={"normal"}
                  px={6}
                  bg={"coffee.500"}
                  color={"milk.500"}
                  _hover={{ bg: "coffee.600" }}
                >
                  Get Started
                  <Icon as={ArrowRight} ml={2} />
                </Button>
                <Button
                  rounded={"full"}
                  size={"lg"}
                  fontWeight={"normal"}
                  px={6}
                  variant="outline"
                  borderColor="coffee.500"
                  color="coffee.500"
                  _hover={{
                    bg: "milk.500",
                  }}
                >
                  Learn More
                </Button>
              </Stack>
            </Stack>
            <Flex
              flex={1}
              justify={"center"}
              align={"center"}
              position={"relative"}
              w={"full"}
            >
              <Box
                position={"relative"}
                height={"400px"}
                rounded={"2xl"}
                width={"full"}
                overflow={"hidden"}
                bg="milk.500"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Image src="/images/Refer a friend.png" alt="hero" w="100%" />
              </Box>
            </Flex>
          </Stack>
        </Container>
      </Box>
    </Element>
  );
}
