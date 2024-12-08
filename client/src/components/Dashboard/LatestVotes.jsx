import React from "react";
import {
  Box,
  Text,
  Heading,
  HStack,
  IconButton,
  Button,
  SimpleGrid,
  Skeleton,
  SkeletonText,
} from "@chakra-ui/react";
import { PlusSquareIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import VoteCard from "./VoteCard";
import { getAllVotes } from "../../utils/vote.utils";
import { useQuery, useQueries } from "@tanstack/react-query";
import { getAccessCodeByVoteId } from "../../utils/room.utils";

const LatestVotes = () => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["votes"],
    queryFn: async () => await getAllVotes(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnMount: false,
    refetchOnReconnect: true,
    refetchOnWindowFocus: false,
  });

  const accessCodeQueries = useQueries({
    queries: (data?.votes || []).map((vote) => ({
      queryKey: ["accessCode", vote._id],
      queryFn: () => getAccessCodeByVoteId(vote._id),
      enabled: !!vote._id,
    })),
  });

  const accessCodes = accessCodeQueries.map((query) => query.data);

  const votes = data?.votes || [];

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
          {isLoading ? (
            <Skeleton
              startColor="coffee.300"
              endColor="coffee.600"
              w="full"
              p={4}
              borderRadius={8}
            >
              <SkeletonText noOfLines={4} />
            </Skeleton>
          ) : (
            votes?.map((vote, index) => (
              <VoteCard
                key={index}
                vote={vote}
                accessCode={accessCodes[index]}
              />
            ))
          )}
        </SimpleGrid>
      </Box>
    </Box>
  );
};

export default LatestVotes;
