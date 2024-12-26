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
import { getVotingHistory } from "../../utils/vote.utils";

const votingHistory = [
  { id: 1, date: "2023-05-15", topic: "City Park Renovation", vote: "yes" },
  { id: 2, date: "2023-06-02", topic: "School Budget Increase", vote: "no" },
  { id: 3, date: "2023-06-20", topic: "New Recycling Program", vote: "yes" },
  {
    id: 4,
    date: "2023-07-05",
    topic: "Downtown Parking Expansion",
    vote: "no",
  },
  { id: 5, date: "2023-07-18", topic: "Public Library Funding", vote: "yes" },
];

function VoteCard({ date, topic, vote }) {
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const textColor = useColorModeValue("gray.600", "gray.400");

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
            {new Date(date).toLocaleDateString()}
          </Text>
        </Flex>
        <Badge colorScheme={vote === "yes" ? "green" : "red"} fontSize="sm">
          {vote.toUpperCase()}
        </Badge>
      </Flex>
      <Heading as="h3" size="md" mb={2}>
        {topic}
      </Heading>
      <Text color={textColor} fontSize="sm">
        You voted on this issue.
      </Text>
      <Flex mt={4} justifyContent="flex-end">
        <IconButton
          icon={
            vote === "yes" ? <ThumbsUp size={20} /> : <ThumbsDown size={20} />
          }
          aria-label={vote === "yes" ? "Thumbs up" : "Thumbs down"}
          variant="ghost"
          colorScheme={vote === "yes" ? "green" : "red"}
          size="sm"
        />
      </Flex>
    </Box>
  );
}

function VotingHistoryList() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["votingHistory"],
    queryFn: async () => getVotingHistory(),
    staleTime: 5 * 60 * 1000,
    refetchOnMount: true,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });

  return (
    <VStack spacing={6} align="stretch">
      {votingHistory.map((vote) => (
        <VoteCard key={vote.id} {...vote} />
      ))}
    </VStack>
  );
}

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
