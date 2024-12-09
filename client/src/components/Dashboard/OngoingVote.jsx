import React from "react";
import {
  Box,
  Text,
  Heading,
  HStack,
  Icon,
  VStack,
  Container,
} from "@chakra-ui/react";
import OngoingVoteCard from "./OngoingVoteCard";

const OngoingVote = () => {
  return (
    <Box bg="milk.500" p={10} minH={"100vh"}>
      <Heading fontSize="2xl" mb={4}>
        Ongoing Vote
      </Heading>
      <Container maxW="container.lg" mt={8}>
        <OngoingVoteCard />
      </Container>
    </Box>
  );
};

export default OngoingVote;
