import { useState, useEffect, useMemo } from "react";
import {
  Box,
  Container,
  Grid,
  GridItem,
  Text,
  VStack,
  HStack,
  useToast,
  Button,
  Heading,
} from "@chakra-ui/react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { CircleCheck } from "lucide-react";
import useAuth from "../context/useAuth";

const VoteCard = ({
  candidate,
  candidateIndex,
  selectedCandidateIndex,
  onSelect,
  totalVotes,
}) => {
  const votingPercentage =
    totalVotes > 0
      ? (Number(candidate.voteCount.toString()) / totalVotes) * 100
      : 0;

  return (
    <Grid
      templateColumns="repeat(3, 1fr)"
      w={"300px"}
      mx="auto"
      borderRadius="sm"
      border={"1px"}
      cursor={"pointer"}
      onClick={() => onSelect(candidateIndex)}
      shadow={selectedCandidateIndex === candidateIndex ? "lg" : "none"}
      _hover={{
        shadow: "lg",
      }}
      borderColor="black"
      transition={"all 0.2s"}
    >
      <GridItem>
        <Box
          border={"1px "}
          borderLeft={"none"}
          borderTop={"none"}
          borderBottom={"none"}
          borderColor="black"
          bg="coffee.600"
          w="full"
          h="full"
          p={4}
        >
          <Box
            w={10}
            h={10}
            border={"4px"}
            borderColor={"coffee.500"}
            rounded={"full"}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            {selectedCandidateIndex === candidateIndex && (
              <CircleCheck size={30} color="green" />
            )}
          </Box>
        </Box>
      </GridItem>
      <GridItem>
        <Box
          border={"1px "}
          borderLeft={"none"}
          borderTop={"none"}
          borderBottom={"none"}
          borderColor="black"
          textAlign={"center"}
          fontWeight="semibold"
          bg="coffee.600"
          w="full"
          h="full"
          p={4}
        >
          {candidate.name}
        </Box>
      </GridItem>
      <GridItem>
        <Box
          borderColor="black"
          textAlign={"center"}
          fontSize={"xl"}
          bg="coffee.600"
          w="full"
          h="full"
          p={4}
        >
          {votingPercentage.toFixed(1)}%
        </Box>
      </GridItem>
    </Grid>
  );
};

const Room = () => {
  const [searchParams] = useSearchParams();
  const accessCode = searchParams.get("accessCode");
  const { contract, currentUser } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [vote, setVote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCandidateIndex, setSelectedCandidateIndex] = useState(null);

  // Function to get vote ID by access code
  const getVoteIdByAccessCode = async () => {
    try {
      // Get all vote IDs from the blockchain
      const [voteIds] = await contract.getAllVotesPart1();

      // Iterate through all votes to find the one with matching access code
      for (let i = 0; i < voteIds.length; i++) {
        const voteId = Number(voteIds[i]);
        try {
          const voteDetails = await contract.getVoteDetails(voteId);
          const voteAccessCode = voteDetails[9]; // Access code is at index 9
          if (voteAccessCode === accessCode) {
            return voteId;
          }
        } catch (error) {
          continue;
        }
      }
      throw new Error("No vote found with the given access code");
    } catch (error) {
      console.error("Error getting vote ID:", error);
      throw error;
    }
  };

  const fetchVoteDetails = async () => {
    try {
      if (!contract) {
        return;
      }

      const voteId = await getVoteIdByAccessCode();
      // Get vote details from blockchain
      const voteDetails = await contract.getVoteDetails(voteId);

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
        accessCodeFromContract,
        status,
      ] = voteDetails;

      console.log("Fetching vote options for ID:", voteId);
      // Get vote options
      const options = await contract.getVoteOptions(voteId);
      console.log("Vote options:", options);

      // Calculate total votes
      const totalVotes = options.reduce(
        (sum, opt) => sum + Number(opt.voteCount.toString()),
        0
      );

      // Check if user has voted (if user is connected)
      let hasVoted = false;
      if (currentUser) {
        console.log("Checking if user has voted:", currentUser.walletAddress);
        hasVoted = await contract.hasUserVoted(
          voteId,
          currentUser.walletAddress
        );
        console.log("Has user voted:", hasVoted);
      }

      const voteData = {
        id: voteId,
        title,
        description,
        startTime: Number(startTime) * 1000, // Convert to milliseconds
        endTime: Number(endTime) * 1000,
        isActive,
        creator,
        maxParticipants: maxParticipants.toString(),
        currentParticipants: currentParticipants.toString(),
        roomName,
        accessCode: accessCodeFromContract,
        status,
        options,
        totalVotes,
        hasVoted,
        currentTime: Date.now(),
      };
      console.log("Setting vote data:", voteData);
      setVote(voteData);
    } catch (error) {
      console.error("Error fetching vote details:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch vote details",
        status: "error",
        duration: 5000,
        isClosable: true,
      });

      // Redirect to dashboard if vote not found
      if (error.message.includes("No vote found")) {
        navigate("/dashboard");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (contract && accessCode) {
      setLoading(true);
      fetchVoteDetails();

      // Set up interval to fetch vote details every 10 seconds
      const interval = setInterval(() => {
        fetchVoteDetails();
      }, 10000);

      // Cleanup interval on unmount
      return () => clearInterval(interval);
    }
  }, [contract, accessCode]);

  useEffect(() => {
    if (!vote) return;

    // Force a re-render every second to update time displays
    const timer = setInterval(() => {
      setVote((prevVote) => ({
        ...prevVote,
        currentTime: Date.now(),
      }));
    }, 1000);

    return () => clearInterval(timer);
  }, [vote]);

  const isVoteActive = useMemo(() => {
    if (!vote) return false;
    const now = Date.now();
    return now >= vote.startTime && now <= vote.endTime;
  }, [vote?.startTime, vote?.endTime, vote?.currentTime]);

  const hasVoteEnded = useMemo(() => {
    if (!vote) return false;
    return Date.now() > vote.endTime;
  }, [vote?.endTime, vote?.currentTime]);

  const hasVoteStarted = useMemo(() => {
    if (!vote) return false;
    return Date.now() >= vote.startTime;
  }, [vote?.startTime, vote?.currentTime]);

  const handleCandidateSelect = (candidateIndex) => {
    if (vote.hasVoted) {
      toast({
        title: "Already voted",
        description: "You have already cast your vote",
        status: "error",
        duration: 3000,
      });
      return;
    }

    if (!currentUser) {
      toast({
        title: "Not logged in",
        description: "Please log in to vote",
        status: "error",
        duration: 3000,
      });
      return;
    }

    setSelectedCandidateIndex(candidateIndex);
  };

  const handleVoteSubmit = async () => {
    try {
      if (
        selectedCandidateIndex === null ||
        !vote ||
        !contract ||
        !currentUser
      ) {
        toast({
          title: "Error",
          description: "Please log in and select a candidate",
          status: "error",
          duration: 3000,
        });
        return;
      }

      console.log(
        "Casting vote with ID:",
        vote.id,
        "for candidate index:",
        selectedCandidateIndex
      );
      // Cast vote on blockchain using the candidate index
      const tx = await contract.castVote(vote.id, selectedCandidateIndex);
      await tx.wait();

      // Refresh vote details
      await fetchVoteDetails();

      toast({
        title: "Success",
        description: "Vote cast successfully",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error submitting vote:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit vote",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  if (loading) {
    return (
      <Box
        minH="100vh"
        bg="milk.500"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Text>Loading...</Text>
      </Box>
    );
  }

  return (
    <Box
      minH="100vh"
      bg="milk.500"
      py={{ base: "12", md: "16" }}
      px={{ base: "4", sm: "8" }}
    >
      <Container maxW="container.lg">
        <Heading as="h1" size="lg" mb={10} fontWeight="semibold">
          Room : {accessCode}
        </Heading>
        <VStack spacing={8} align="stretch">
          <Heading as="h2" size="xl" textAlign="center" fontWeight={"semibold"}>
            {vote?.title}
          </Heading>

          {/* Countdown Timer Grid */}
          <Grid
            templateColumns="repeat(4, 1fr)"
            gap={4}
            maxW="400px"
            mx="auto"
            p={4}
            borderRadius="sm"
            border="1px"
            borderColor="black"
          >
            {/* Days */}
            <GridItem>
              <VStack spacing={2}>
                <Box
                  border="1px"
                  borderColor="gray.200"
                  p={4}
                  borderRadius="md"
                  w="full"
                  textAlign="center"
                >
                  <Text fontSize="2xl" fontWeight="bold">
                    {vote?.startTime
                      ? Math.max(
                          0,
                          Math.ceil(
                            (vote.endTime - vote.currentTime) /
                              (1000 * 60 * 60 * 24)
                          )
                        )
                      : "--"}
                  </Text>
                </Box>
                <Text fontSize="sm" color="gray.600">
                  Days
                </Text>
              </VStack>
            </GridItem>

            {/* Hours */}
            <GridItem>
              <VStack spacing={2}>
                <Box
                  border="1px"
                  borderColor="gray.200"
                  p={4}
                  borderRadius="md"
                  w="full"
                  textAlign="center"
                >
                  <Text fontSize="2xl" fontWeight="bold">
                    {vote?.startTime
                      ? Math.max(
                          0,
                          Math.ceil(
                            ((vote.endTime - vote.currentTime) %
                              (1000 * 60 * 60 * 24)) /
                              (1000 * 60 * 60)
                          )
                        )
                      : "--"}
                  </Text>
                </Box>
                <Text fontSize="sm" color="gray.600">
                  Hours
                </Text>
              </VStack>
            </GridItem>

            {/* Minutes */}
            <GridItem>
              <VStack spacing={2}>
                <Box
                  border="1px"
                  borderColor="gray.200"
                  p={4}
                  borderRadius="md"
                  w="full"
                  textAlign="center"
                >
                  <Text fontSize="2xl" fontWeight="bold">
                    {vote?.startTime
                      ? Math.max(
                          0,
                          Math.ceil(
                            ((vote.endTime - vote.currentTime) %
                              (1000 * 60 * 60)) /
                              (1000 * 60)
                          )
                        )
                      : "--"}
                  </Text>
                </Box>
                <Text fontSize="sm" color="gray.600">
                  Minutes
                </Text>
              </VStack>
            </GridItem>

            {/* Seconds */}
            <GridItem>
              <VStack spacing={2}>
                <Box
                  border="1px"
                  borderColor="gray.200"
                  p={4}
                  borderRadius="md"
                  w="full"
                  textAlign="center"
                >
                  <Text fontSize="2xl" fontWeight="bold">
                    {vote?.startTime
                      ? Math.max(
                          0,
                          Math.ceil(
                            ((vote.endTime - vote.currentTime) % (1000 * 60)) /
                              1000
                          )
                        )
                      : "--"}
                  </Text>
                </Box>
                <Text fontSize="sm" color="gray.600">
                  Seconds
                </Text>
              </VStack>
            </GridItem>
          </Grid>

          {/* Vote Cards */}
          {vote?.options?.map((candidate, index) => (
            <VoteCard
              key={index}
              candidate={candidate}
              candidateIndex={index}
              selectedCandidateIndex={selectedCandidateIndex}
              totalVotes={vote.totalVotes}
              onSelect={handleCandidateSelect}
            />
          ))}

          {/* Action Buttons */}
          <HStack spacing={4} mt={8} justify="center">
            <Button
              isLoading={loading}
              isDisabled={loading ?? vote?.hasVoted}
              _disabled={{
                bg: "coffee.600",
                _hover: { bg: "coffee.600" },
                cursor: "not-allowed",
              }}
              onClick={handleVoteSubmit}
            >
              {vote?.hasVoted ? "Already Voted" : "Submit Vote"}
            </Button>
            <Button onClick={() => navigate("/dashboard")}>Leave Room</Button>
          </HStack>
        </VStack>
      </Container>
    </Box>
  );
};

export default Room;
