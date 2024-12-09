import React from "react";
import {
  Flex,
  Box,
  CircularProgress,
  CircularProgressLabel,
  Text,
  Divider,
} from "@chakra-ui/react";

const PollsCard = ({ totalVotes, candidate }) => {
  const votingPercentage =
    totalVotes > 0 ? (candidate?.voteCount / totalVotes) * 100 : 0;

  return (
    <Flex
      direction={"row"}
      w={"300px"}
      mx="auto"
      borderRadius="sm"
      border={"1px"}
      cursor={"pointer"}
      borderColor="black"
      transition={"all 0.2s"}
    >
      <Box
        bg="coffee.600"
        p={4}
        display={"flex"}
        flexDir={"row"}
        alignItems={"center"}
        gap={4}
      >
        <CircularProgress color="coffee.500" value={votingPercentage}>
          <CircularProgressLabel>
            <Text fontSize="sm" fontWeight="medium">
              {votingPercentage}%
            </Text>
          </CircularProgressLabel>
        </CircularProgress>

        <Box bg={"black"} w={"2px"} h={"100%"} rounded={"md"} />
      </Box>

      <Box
        bg="coffee.600"
        p={4}
        flex={1}
        display={"flex"}
        flexDir={"row"}
        alignItems={"center"}
        gap={4}
        pos={"relative"}
      >
        {candidate?.name}
        <Text
          position={"absolute"}
          right={4}
          bottom={0}
          fontSize="sm"
          fontWeight="light"
        >
          {candidate?.voteCount} votes
        </Text>
      </Box>
    </Flex>
  );
};

export default PollsCard;
