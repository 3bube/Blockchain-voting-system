import {
  Box,
  Container,
  Heading,
  Text,
  Flex,
  Image,
  Stack,
  VStack,
} from "@chakra-ui/react";
import { Element } from "react-scroll";

export default function About() {
  return (
    <Element name="about">
      <Box py={{ base: 10, md: 20 }} bg="milk.500">
        <Container maxW="6xl" px={{ base: 4, md: 8 }}>
          <VStack spacing={{ base: 4, md: 6 }} mb={{ base: 8, md: 12 }}>
            <Heading
              textAlign="center"
              fontSize={{ base: "2xl", md: "4xl" }}
              fontWeight="600"
              color="coffee.700"
            >
              If you are confused
            </Heading>
            <Text
              textAlign="center"
              fontSize={{ base: "md", md: "lg" }}
              fontWeight="light"
              color="coffee.800"
            >
              This application will make it easier for you to make votes
            </Text>
          </VStack>

          <Flex
            direction={{ base: "column", md: "row" }}
            align="center"
            justify="center"
            gap={{ base: 8, md: 16 }}
          >
            <Box
              flex={{ base: "1", md: "0.8" }}
              maxW={{ base: "100%", md: "450px" }}
            >
              <Image
                src="/images/Image About.png"
                alt="About Polls.io"
                w="100%"
                h="auto"
                objectFit="contain"
              />
            </Box>

            <Stack
              flex="1"
              spacing={{ base: 4, md: 6 }}
              maxW={{ base: "100%", md: "500px" }}
            >
              <Text
                fontSize={{ base: "md", md: "lg" }}
                fontWeight="light"
                lineHeight="tall"
                color="coffee.800"
              >
                Often times we do voting to choose something with a wide enough
                scope, but this is sometimes difficult to do. But don't worry,
                here we made the polls.io application for all of you to solve
                this problem and this application is also made free for the
                public.
              </Text>

              <Text
                fontSize={{ base: "lg", md: "xl" }}
                fontWeight="bold"
                color="coffee.700"
              >
                "Make your voting fast, simple and fair"
              </Text>
            </Stack>
          </Flex>
        </Container>
      </Box>
    </Element>
  );
}
