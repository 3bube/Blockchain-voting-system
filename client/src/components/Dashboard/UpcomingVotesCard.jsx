import React from "react";
import { Box, Text, VStack, HStack, Heading, Icon } from "@chakra-ui/react";
import { ArrowRight } from "lucide-react";

const UpcomingVotesCard = () => {
  return (
    <Box
      w="full"
      h="200px"
      bg="linear-gradient(135deg, rgba(73,60,51,1) 0%, rgba(120,80,54,1) 100%)"
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
      <VStack align="flex-start" h="full" justify="space-between">
        <Box>
          <Text fontSize="lg" mb={2} fontWeight="medium">
            Upcoming Votes
          </Text>
          <Text fontSize="md" color="gray.300">
            Candidate 1, Candidate 2
          </Text>
        </Box>

        <VStack align="flex-start" spacing={1}>
          <Text fontSize="sm" color="gray.300">
            Starts in:
          </Text>
          <HStack justify="space-between" w="full">
            <Text fontSize="lg" fontWeight="bold">
              7 November 2023
            </Text>
            <Text fontSize="lg" fontWeight="bold">
              07:00 pm
            </Text>
          </HStack>
        </VStack>
      </VStack>
    </Box>
  );
};

export default UpcomingVotesCard;
