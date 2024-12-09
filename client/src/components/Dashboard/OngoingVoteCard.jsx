import { Box, Text, VStack } from "@chakra-ui/react";

const OngoingVoteCard = () => {
  return (
    <Box
      w="50%"
      h="150px"
      bg="gray.800"
      borderRadius="xl"
      p={6}
      position="relative"
      boxShadow="md"
      color={"white"}
    >
      <VStack align="flex-start" justify="space-between">
        <Box>
          <Text fontSize="lg" mb={2} fontWeight="medium">
            Ongoing Votes
          </Text>
          <Text fontSize="md" color="gray.300">
            Your ongoing votes: 3
          </Text>
        </Box>
      </VStack>
    </Box>
  );
};

export default OngoingVoteCard;
