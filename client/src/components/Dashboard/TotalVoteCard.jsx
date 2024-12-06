import { Box, Text, Heading, HStack, Icon, VStack } from "@chakra-ui/react";

const TotalVoteCard = () => {
  return (
    <Box
      w="full"
      h="200px"
      bg="linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.6) 100%)"
      borderRadius="xl"
      p={6}
      position="relative"
      boxShadow="xl"
      color="white"
      cursor="pointer"
      _hover={{
        transform: "translateY(-2px)",
        transition: "all 0.2s",
      }}
    >
      <VStack align="flex-start" justify="space-between">
        <Box>
          <Text fontSize="lg" mb={2} fontWeight="medium">
            Votes
          </Text>
          <Text fontSize="md" color="gray.300">
            Your Total Votes: 300
          </Text>
        </Box>
      </VStack>
    </Box>
  );
};

export default TotalVoteCard;
