import { useState, useEffect } from "react";
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
import { useQuery } from "@tanstack/react-query";
import { getVoteByRoomId, castVote } from "../utils/vote.utils";
import { CircleCheck } from "lucide-react";
import { useSocket } from "../contexts/SocketContext";
import useAuth from "../context/useAuth";

// VoteCard component
const VoteCard = ({ candidate, selectedCandidate, onSelect, totalVotes }) => {
  // calculate voting percentage
  const votingPercentage =
    totalVotes > 0 ? (candidate.voteCount / totalVotes) * 100 : 0;

  return (
    <Grid
      templateColumns="repeat(3, 1fr)"
      w={"300px"}
      mx="auto"
      borderRadius="sm"
      border={"1px"}
      cursor={"pointer"}
      onClick={() => onSelect(candidate)}
      shadow={selectedCandidate?._id === candidate._id ? "lg" : "none"}
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
            {selectedCandidate?._id === candidate._id && (
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
          {votingPercentage}%
        </Box>
      </GridItem>
    </Grid>
  );
};

const Room = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const accessCode = searchParams.get("accessCode");
  const { socket } = useSocket();
  const { data } = useQuery({
    queryKey: ["vote", id],
    queryFn: async () => await getVoteByRoomId(id),
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const { currentUser } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [timeLeft, setTimeLeft] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let interval;

    const calculateTimeLeft = () => {
      if (data?.vote) {
        const endTime = new Date(data.vote.endTime);
        const now = new Date();
        const diff = endTime - now;

        // If the vote has ended
        if (diff < 0) {
          clearInterval(interval);
          setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
          return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
      }
    };

    if (data?.vote) {
      // Calculate immediately
      calculateTimeLeft();
      // Then update every second
      interval = setInterval(calculateTimeLeft, 1000);
    }

    // Cleanup interval on component unmount or when data changes
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [data]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const { vote } = data ?? {};

  // calculate total votes
  const totalVotes =
    vote?.candidates?.reduce(
      (sum, candidate) => sum + (candidate.voteCount || 0),
      0
    ) ?? 0;

  // handle candidate selection
  const handleCandidateSelect = (candidate) => {
    setSelectedCandidate(candidate);
  };

  // handle vote submission
  const handleVoteSubmit = async () => {
    if (!selectedCandidate) {
      toast({
        title: "Error",
        description: "Please select a candidate",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    setLoading(true);
    try {
      // find the index of the candidate
      const candidateIndex = vote.candidates.findIndex(
        (candidate) => candidate._id === selectedCandidate._id
      );

      if (candidateIndex === -1) {
        toast({
          title: "Error",
          description: "Invalid candidate selection",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        return;
      }

      // cast the vote
      await castVote(vote._id, candidateIndex);

      // emit the vote event
      socket?.emit("caste_vote", {
        roomId: id,
        candidateIndex,
        voterId: currentUser._id,
      });

      // navigate to dashboard
      navigate("/dashboard");

      toast({
        title: "Success",
        description: "Vote submitted successfully",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error casting vote:", error.message);
    } finally {
      setLoading(false);
    }
  };

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
                    {timeLeft?.days ?? "--"}
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
                    {timeLeft?.hours ?? "--"}
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
                    {timeLeft?.minutes ?? "--"}
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
                    {timeLeft?.seconds ?? "--"}
                  </Text>
                </Box>
                <Text fontSize="sm" color="gray.600">
                  Seconds
                </Text>
              </VStack>
            </GridItem>
          </Grid>

          {/* Vote Card */}
          {vote?.candidates?.map((candidate) => (
            <VoteCard
              key={candidate.id}
              candidate={candidate}
              selectedCandidate={selectedCandidate}
              totalVotes={totalVotes}
              onSelect={handleCandidateSelect}
            />
          ))}
        </VStack>

        <HStack spacing={4} mt={8} justify="center">
          <Button
            isDisabled={loading}
            _disabled={{
              bg: "coffee.600",
              _hover: { bg: "coffee.600" },
              cursor: "not-allowed",
            }}
            onClick={handleVoteSubmit}
          >
            Submit Vote
          </Button>
          <Button onClick={() => navigate("/dashboard")}>Leave Room</Button>
        </HStack>
      </Container>
    </Box>
  );
};

export default Room;
