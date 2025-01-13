"use client";

import {
  Box,
  Text,
  Flex,
  IconButton,
  Spacer,
  VStack,
  Heading,
  Container,
  useColorModeValue,
  Badge,
} from "@chakra-ui/react";
import { Calendar, ThumbsUp, ThumbsDown, Loader2 } from "lucide-react";
import { Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import useAuth from "../../context/useAuth";

function VoteCard({ vote }) {
  const bgColor = useColorModeValue("white", "milk.500");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const textColor = useColorModeValue("gray.600", "gray.400");

  // Get the voted candidate from the voters array
  const votedCandidate = vote?.candidates?.[vote?.voters?.[0]?.votedFor];

  return (
    <Box
      bg={bgColor}
      borderRadius="lg"
      borderWidth="1px"
      borderColor={borderColor}
      shadow="md"
      p={6}
      mb={4}
      transition="all 0.3s"
      _hover={{ shadow: "xl", transform: "translateY(-2px)" }}
    >
      <Flex alignItems="center" justifyContent="space-between" mb={4}>
        <Flex alignItems="center" color={textColor}>
          <Calendar strokeWidth={1.5} size={20} />
          <Text ml={2} fontSize="sm">
            {new Date(vote?.voters?.[0]?.votedAt).toLocaleDateString()}
          </Text>
        </Flex>
        <Badge
          colorScheme={vote?.status === "active" ? "green" : "red"}
          fontSize="sm"
        >
          {vote?.status?.toUpperCase()}
        </Badge>
      </Flex>
      <Heading as="h3" size="md" mb={2}>
        {vote?.title}
      </Heading>
      <Text color={textColor} fontSize="sm">
        You voted for {votedCandidate?.name}
      </Text>
      <Text color={textColor} fontSize="sm" mt={2}>
        Vote period: {new Date(vote?.startTime).toLocaleDateString()} -{" "}
        {new Date(vote?.endTime).toLocaleDateString()}
      </Text>
      <Flex mt={4} justifyContent="flex-end">
        <IconButton
          icon={<ThumbsUp size={20} />}
          aria-label="Vote cast"
          variant="ghost"
          colorScheme="blue"
          size="sm"
        />
      </Flex>
    </Box>
  );
}

const VotingHistoryList = () => {
  const { contract, currentUser } = useAuth();

  const { data: votes, isLoading, isError } = useQuery({
    queryKey: ["votingHistory", currentUser?.walletAddress],
    queryFn: async () => {
      if (!contract || !currentUser) return [];

      try {
        // Get all votes from blockchain
        const [voteIds] = await contract.getAllVotesPart1();

        const votingHistory = [];

        // Check each vote for user's participation
        for (const voteId of voteIds) {
          const hasVoted = await contract.hasUserVoted(voteId, currentUser.walletAddress);

          if (hasVoted) {
            // Get vote details
            const [
              title,
              description,
              startTime,
              endTime,
              isActive,
              creator,
              maxParticipants,
              currentParticipants,
              roomName,
              accessCode,
              status,
            ] = await contract.getVoteDetails(voteId);

            // Get vote options and user's vote
            const options = await contract.getVoteOptions(voteId);
            const userVoteInfo = await contract.getUserVote(voteId, currentUser.walletAddress);

            votingHistory.push({
              id: voteId.toString(),
              title,
              description,
              startTime: Number(startTime) * 1000,
              endTime: Number(endTime) * 1000,
              isActive,
              status,
              candidates: options.map(opt => ({
                name: opt.name,
                voteCount: opt.voteCount.toString()
              })),
              voters: [{
                votedFor: Number(userVoteInfo.votedOptionId),
                votedAt: Number(userVoteInfo.votedAt) * 1000
              }]
            });
          }
        }

        return votingHistory;
      } catch (error) {
        console.error("Error fetching voting history:", error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
    refetchOnMount: true,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <Text>Error loading voting history</Text>;
  if (!votes?.length) return <Text>No voting history found</Text>;

  return (
    <VStack spacing={4} align="stretch" w="100%">
      {votes.map((vote) => (
        <VoteCard key={vote.id} vote={vote} />
      ))}
    </VStack>
  );
};

function LoadingSpinner() {
  return (
    <Flex justify="center" align="center" height="200px">
      <Loader2 className="animate-spin" size={40} />
    </Flex>
  );
}

export default function VotingHistoryPage() {
  const bgColor = useColorModeValue("gray.50", "gray.900");

  return (
    <Box bg={bgColor} minHeight="100vh" py={8}>
      <Container maxW="container.md">
        <Heading as="h1" size="2xl" mb={8} textAlign="center">
          Your Voting History
        </Heading>
        <Suspense fallback={<LoadingSpinner />}>
          <VotingHistoryList />
        </Suspense>
      </Container>
    </Box>
  );
}
