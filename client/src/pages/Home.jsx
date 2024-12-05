import { Box, Heading, Text, VStack } from "@chakra-ui/react";

function Home() {
  return (
    <VStack spacing={4} align="center">
      <Heading as="h1" size="2xl" color="gray.800">
        Blockchain Voting System
      </Heading>
      <Text fontSize="xl" color="gray.600">
        Welcome to the secure and transparent voting platform
      </Text>
    </VStack>
  );
}

export default Home;
