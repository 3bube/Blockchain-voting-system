import React from "react";
import {
  Box,
  Text,
  Heading,
  HStack,
  IconButton,
  Button,
  SimpleGrid,
} from "@chakra-ui/react";
import { PlusSquareIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import VoteCard from "./VoteCard";

const LatestVotes = () => {
  // Sample data - replace with actual data from your backend
  const votes = [
    {
      room: "4UJS08",
      candidates: "Candidate 1, Candidate 2",
      endTime: "03:21:22:10",
    },
    {
      room: "5UJS09",
      candidates: "Candidate 3, Candidate 4",
      endTime: "02:15:45:30",
    },
    // Add more sample votes as needed
  ];

  const navigate = useNavigate();

  return (
    <Box p={4} my={10} borderRadius={8}>
      <HStack alignItems={"center"} justifyContent={"space-between"} w={"full"}>
        <Heading color={"black"} fontWeight={"light"}>
          Latest Votes
        </Heading>

        <Button
          leftIcon={<PlusSquareIcon />}
          bg={"coffee.600"}
          transition={"all 0.2s"}
          transitionDuration={"0.2s"}
          _hover={{ bg: "coffee.700" }}
          boxShadow={"md"}
          colorScheme="blackAlpha"
          onClick={() => navigate("/dashboard/create-vote")}
        >
          Create Vote
        </Button>
      </HStack>

      <Box mt={8}>
        <Text fontSize="xl" fontWeight="bold" mb={4}>
          Latest Votes
        </Text>
        <SimpleGrid columns={1} spacing={4}>
          {votes.map((vote, index) => (
            <VoteCard
              key={index}
              room={vote.room}
              candidates={vote.candidates}
              endTime={vote.endTime}
            />
          ))}
        </SimpleGrid>
      </Box>
    </Box>
  );
};

export default LatestVotes;
