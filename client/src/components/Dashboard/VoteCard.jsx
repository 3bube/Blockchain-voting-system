import React from "react";
import { Box, HStack, Text, Icon } from "@chakra-ui/react";
import { ArrowUpRight } from "lucide-react";

const VoteCard = ({ room, candidates, endTime }) => {
  return (
    <Box
      w="full"
      bg="#D9C3AE"
      borderRadius="xl"
      p={4}
      position="relative"
      cursor="pointer"
      _hover={{
        transform: "translateY(-2px)",
        transition: "all 0.2s",
      }}
    >
      <HStack justify="space-between" mb={2}>
        <Text fontSize="sm" color="gray.700">
          Room: {room}
        </Text>
        <Icon as={ArrowUpRight} boxSize={4} color="gray.700" />
      </HStack>

      <Text fontSize="md" fontWeight="medium" mb={1}>
        {candidates}
      </Text>

      <HStack spacing={2} align="center">
        <Text fontSize="xs" color="gray.600">
          Ends in:
        </Text>
        <Text fontSize="xs" fontWeight="medium" color="gray.700">
          {endTime}
        </Text>
      </HStack>
    </Box>
  );
};

export default VoteCard;
