import { useState, useEffect } from "react";
import {
  Box,
  Heading,
  Container,
  VStack,
  Grid,
  GridItem,
  Text,
  HStack,
  useToast,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  useColorMode,
} from "@chakra-ui/react";
import { CircleX, Trash, Edit } from "lucide-react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { getRoomByVoteId } from "../utils/room.utils";
import {
  getVoteByRoomId,
  updateVote,
  endVote,
  deleteVote,
} from "../utils/vote.utils";
import PollsCard from "../components/Dashboard/PollsCard";
import { useQuery } from "@tanstack/react-query";
import useAuth from "../context/useAuth";

const VoteDetails = () => {
  const [searchParams] = useSearchParams();
  const voteId = searchParams.get("voteId");
  const { currentUser } = useAuth();
  const { colorMode } = useColorMode();

  const { data: roomDetails } = useQuery({
    queryKey: ["room", voteId],
    queryFn: () => getRoomByVoteId(voteId),
    enabled: !!voteId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnMount: true,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });

  const { accessCode, creator, _id } = roomDetails ?? {};
  const toast = useToast();
  const navigate = useNavigate();

  const { data: voteDetails } = useQuery({
    queryKey: ["vote", _id],
    queryFn: () => getVoteByRoomId(_id),
    enabled: !!_id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnMount: true,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });

  const { vote: votes } = voteDetails ?? {};
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    let interval;

    const calculateTimeLeft = () => {
      if (votes) {
        const endTime = new Date(votes.endTime);
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

    if (votes) {
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
  }, [votes]);

  const totalVotes =
    votes?.candidates?.reduce(
      (sum, candidate) => sum + (candidate.voteCount || 0),
      0
    ) ?? 0;

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16);  // This will format to yyyy-MM-ddThh:mm
  };

  const [isEditing, setIsEditing] = useState(false);
  const [newTitle, setNewTitle] = useState(votes?.title);
  const [newStartTime, setNewStartTime] = useState(formatDateForInput(votes?.startTime));
  const [newEndTime, setNewEndTime] = useState(formatDateForInput(votes?.endTime));

  const handleEndVote = async (id) => {
    try {
      await endVote(id);
      navigate("/dashboard");
      toast({
        title: "Vote ended successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
    } catch (error) {
      console.error("Error ending vote:", error);
    }
  };

  const handleDeleteVote = async (id) => {
    try {
      await deleteVote(id);
      navigate("/dashboard");
    } catch (error) {
      console.error("Error deleting vote:", error);
    }
  };

  const handleUpdateVote = async (id, event) => {
    event.preventDefault();
    try {
      await updateVote(id);
    } catch (error) {
      console.error("Error updating vote:", error);
    }
  };

  return (
    <Box
      minH="100vh"
      bg={colorMode === "light" ? "milk.500" : "coffee.900"}
      py={{ base: "12", md: "16" }}
      px={{ base: "4", sm: "8" }}
    >
      <Container maxW="container.lg">
        <Heading as="h1" size="lg" mb={10} fontWeight="semibold">
          Room : {accessCode}
        </Heading>
        <VStack spacing={8} align="stretch">
          <Heading as="h2" size="xl" textAlign="center" fontWeight={"semibold"}>
            {votes?.title}
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
                    {timeLeft.days}
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
                    {timeLeft.hours}
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
                    {timeLeft.minutes}
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
                    {timeLeft.seconds}
                  </Text>
                </Box>
                <Text fontSize="sm" color="gray.600">
                  Seconds
                </Text>
              </VStack>
            </GridItem>
          </Grid>

          {/* Polls */}
          <VStack spacing={4}>
            {votes &&
            votes.candidates &&
            Object.keys(votes.candidates).length > 0 ? (
              Object.entries(votes.candidates).map(([index, candidate]) => (
                <PollsCard
                  key={index}
                  index={index}
                  candidate={candidate}
                  totalVotes={totalVotes}
                />
              ))
            ) : (
              <Text>No candidates available.</Text>
            )}
          </VStack>
        </VStack>
        {currentUser?._id === creator && (
          <HStack spacing={4} mt={8} justify="start">
            <Button onClick={() => handleEndVote(votes._id)}>
              End Vote <CircleX />
            </Button>
            <Button onClick={() => setIsEditing(true)}>
              Edit Vote <Edit />
            </Button>
            <Button onClick={() => handleDeleteVote(votes._id)}>
              Delete Vote <Trash />
            </Button>
          </HStack>
        )}

        <Modal isOpen={isEditing} onClose={() => setIsEditing(false)}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Edit Vote</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <form onSubmit={(e) => handleUpdateVote(votes._id, e)}>
                <VStack spacing={4} mt={8}>
                  <FormControl>
                    <FormLabel>Title</FormLabel>
                    <Input
                      type="text"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Start Time</FormLabel>
                    <Input
                      type="datetime-local"
                      value={newStartTime}
                      onChange={(e) => setNewStartTime(e.target.value)}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>End Time</FormLabel>
                    <Input
                      type="datetime-local"
                      value={newEndTime}
                      onChange={(e) => setNewEndTime(e.target.value)}
                    />
                  </FormControl>
                  <Button type="submit">Save Changes</Button>
                </VStack>
              </form>
            </ModalBody>
          </ModalContent>
        </Modal>
      </Container>
    </Box>
  );
};

export default VoteDetails;
