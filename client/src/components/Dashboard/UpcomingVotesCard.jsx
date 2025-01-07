import React, { useState, useEffect } from "react";
import { Box, Text, VStack, HStack, Skeleton } from "@chakra-ui/react";
import { getAllVotes } from "../../utils/vote.utils";
import { useQuery } from "@tanstack/react-query";

const UpcomingVotesCard = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const { data, isLoading } = useQuery({
    queryKey: ["votes"],
    queryFn: async () => getAllVotes(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const upcomingVotes =
    data?.votes?.filter((vote) => new Date(vote.startTime) > new Date()) || [];

  useEffect(() => {
    if (currentIndex >= upcomingVotes.length && upcomingVotes.length > 0) {
      setCurrentIndex(0);
    }
    const interval = setInterval(() => {
      if (upcomingVotes.length > 0) {
        setCurrentIndex((prev) => (prev + 1) % upcomingVotes.length);
      }
    }, 5000); // Auto-rotate every 5 seconds

    return () => clearInterval(interval);
  }, [upcomingVotes.length, currentIndex]);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const currentVote = upcomingVotes[currentIndex];

  if (isLoading) {
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
      >
        <VStack align="flex-start" spacing={4}>
          <Skeleton height="24px" width="200px" />
          <Skeleton height="20px" width="300px" />
          <Skeleton height="20px" width="150px" />
        </VStack>
      </Box>
    );
  }

  if (upcomingVotes.length === 0) {
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
      >
        <VStack align="center" justify="center" h="full">
          <Text fontSize="lg" textAlign="center">
            No upcoming votes scheduled
          </Text>
        </VStack>
      </Box>
    );
  }

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
      sx={{
        "::-webkit-scrollbar": {
          width: "0px",
          background: "transparent",
        },
        overflowY: "scroll",
      }}
      onClick={() =>
        setCurrentIndex((prev) => (prev + 1) % upcomingVotes.length)
      }
    >
      <VStack align="flex-start" h="full" justify="space-between">
        <Box>
          <Text fontSize="lg" mb={2} fontWeight="medium">
            {currentVote?.title || "Upcoming Vote"}
          </Text>
          <Text fontSize="md" color="gray.300">
            {currentVote?.candidates?.map((c) => c.name).join(", ")}
          </Text>
        </Box>

        <VStack align="flex-start" spacing={1}>
          <Text fontSize="sm" color="gray.300">
            Starts in:
          </Text>
          <HStack justify="space-between" w="full">
            <Text fontSize="lg" fontWeight="bold">
              {formatDate(currentVote?.startTime)}
            </Text>
          </HStack>
        </VStack>

        {upcomingVotes.length > 1 && (
          <HStack position="absolute" bottom={4} left={4} spacing={1}>
            {upcomingVotes.map((_, index) => (
              <Box
                key={index}
                w="6px"
                h="6px"
                borderRadius="full"
                bg={index === currentIndex ? "white" : "whiteAlpha.500"}
              />
            ))}
          </HStack>
        )}
      </VStack>
    </Box>
  );
};

export default UpcomingVotesCard;
