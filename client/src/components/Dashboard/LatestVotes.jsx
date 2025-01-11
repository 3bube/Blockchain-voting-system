import {
  Box,
  Text,
  Heading,
  HStack,
  Button,
  SimpleGrid,
  Skeleton,
  SkeletonText,
} from "@chakra-ui/react";
import { PlusSquareIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import VoteCard from "./VoteCard";
import { getAllVotes, getAllBlockchainVotes } from "../../utils/vote.utils";
import { useQuery, useQueries } from "@tanstack/react-query";
import { getRoomByVoteId } from "../../utils/room.utils";
import useAuth from "../../context/useAuth";

const LatestVotes = () => {
  const { contract } = useAuth();
  const navigate = useNavigate();

  // Fetch backup data from MongoDB
  const {
    data: backUpData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["votes"],
    queryFn: async () => await getAllVotes(),
    refetchOnMount: true,
    refetchOnReconnect: true,
    refetchOnWindowFocus: false,
  });

  // Fetch blockchain data
  const {
    data: voteBlockchainData,
    isLoading: voteLoading,
    isError: voteError,
  } = useQuery({
    queryKey: ["votes", contract],
    queryFn: async () => await getAllBlockchainVotes(contract),
    refetchOnMount: true,
    refetchOnReconnect: true,
    refetchOnWindowFocus: false,
  });

  // Merge blockchain and MongoDB votes
  const votes = (voteBlockchainData ?? []).map((blockchainVote) => {
    const backupVote = backUpData?.votes?.find(
      (backup) => backup._id === blockchainVote.id
    );

    return {
      ...backupVote, // Fallback to backup data fields
      ...blockchainVote, // Prioritize blockchain data fields
    };
  });

  const roomQueries = useQueries({
    queries: votes.map((vote) => ({
      queryKey: ["room", vote._id],
      queryFn: () => getRoomByVoteId(vote._id),
      enabled: !!vote._id,
    })),
  });

  const accessCodes = roomQueries.map((query) => query.data?.accessCode);

  if (isError) {
    console.error(error);
    return (
      <Box p={4} my={10} borderRadius={8}>
        <HStack
          alignItems={"center"}
          justifyContent={"space-between"}
          w={"full"}
          mb={6}
        >
          <Heading color={"black"} fontWeight={"light"}>
            Latest Votes
          </Heading>
        </HStack>
        <Box mt={8}>
          <Text fontSize="xl" fontWeight="bold" mb={4}>
            Latest Votes
          </Text>
          <SimpleGrid columns={1} spacing={4}>
            <Text>{error.message}</Text>
          </SimpleGrid>
        </Box>
      </Box>
    );
  }

  const isVotesEmpty = votes.length === 0;

  return (
    <Box p={4} my={10} borderRadius={8}>
      <Box>
        <HStack
          alignItems={"center"}
          justifyContent={"space-between"}
          w={"full"}
          mb={6}
        >
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
            {voteLoading ? (
              <Skeleton
                startColor="coffee.300"
                endColor="coffee.600"
                w="full"
                p={4}
                borderRadius={8}
              >
                <SkeletonText noOfLines={4} />
              </Skeleton>
            ) : isVotesEmpty ? (
              <Text>No votes available.</Text>
            ) : (
              votes?.map((vote, index) => {
                console.log(vote);
                return (
                  <VoteCard
                    key={vote.id ?? index}
                    vote={vote}
                    accessCode={vote.accessCode}
                  />
                );
              })
            )}
          </SimpleGrid>
        </Box>
      </Box>
    </Box>
  );
};

export default LatestVotes;
