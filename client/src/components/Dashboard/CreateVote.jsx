import { useState, useEffect } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  HStack,
  IconButton,
  useToast,
  Container,
  SimpleGrid,
  Heading,
  Text,
  FormErrorMessage,
} from "@chakra-ui/react";
import { X, Plus, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createVote } from "../../utils/vote.utils";

const CreateVote = () => {
  const [candidates, setCandidates] = useState([{ name: "" }]);
  const [title, setTitle] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [errors, setErrors] = useState({
    startTime: "",
    endTime: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  // Get current date and time in ISO format
  const now = new Date();
  const minDateTime = now.toISOString().slice(0, 16);

  const validateDateTime = (start, end) => {
    const newErrors = {
      startTime: "",
      endTime: "",
    };

    const startDate = new Date(start);
    const endDate = new Date(end);

    // Validate start time
    if (startDate < now) {
      newErrors.startTime = "Start time cannot be in the past";
    }

    // Validate end time
    if (endDate <= startDate) {
      newErrors.endTime = "End time must be after start time";
    }

    setErrors(newErrors);
    return !newErrors.startTime && !newErrors.endTime;
  };

  const handleStartTimeChange = (e) => {
    const newStartTime = e.target.value;
    setStartTime(newStartTime);
    validateDateTime(newStartTime, endTime);
  };

  const handleEndTimeChange = (e) => {
    const newEndTime = e.target.value;
    setEndTime(newEndTime);
    validateDateTime(startTime, newEndTime);
  };

  const handleAddCandidate = () => {
    setCandidates([...candidates, { name: "" }]);
  };

  const handleRemoveCandidate = (index) => {
    if (candidates.length === 1) {
      toast({
        title: "Cannot remove",
        description: "At least one candidate is required",
        status: "warning",
        duration: 2000,
      });
      return;
    }
    const newCandidates = candidates.filter((_, i) => i !== index);
    setCandidates(newCandidates);
  };

  const handleCandidateChange = (index, value) => {
    const newCandidates = candidates.map((candidate, i) => {
      if (i === index) {
        return { ...candidate, name: value };
      }
      return candidate;
    });
    setCandidates(newCandidates);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateDateTime(startTime, endTime)) {
      toast({
        title: "Invalid date/time",
        description: "Please check the start and end times",
        status: "error",
        duration: 3000,
      });
      return;
    }
    setLoading(true);
    try {
      await createVote(title, startTime, endTime, candidates);
      navigate("/dashboard");
      toast({
        title: "Vote created",
        description: "Your vote has been created successfully",
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box minH="100vh" bg="milk.500">
      <Container maxW="container.md" py={8}>
        <HStack mb={8} spacing={4}>
          <IconButton
            icon={<ArrowLeft />}
            onClick={() => navigate("/dashboard")}
            variant="ghost"
            aria-label="Back to dashboard"
          />
          <Heading size="lg">Create New Vote</Heading>
        </HStack>

        <Box
          as="form"
          onSubmit={handleSubmit}
          bg="white"
          p={8}
          rounded="xl"
          shadow="md"
        >
          <VStack spacing={6} align="stretch">
            <FormControl isRequired>
              <FormLabel>Vote Title</FormLabel>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="ex: class president election"
              />
            </FormControl>

            <SimpleGrid
              align="flex-start"
              columns={{ base: 1, md: 2 }}
              spacing={4}
            >
              <FormControl isRequired isInvalid={!!errors.startTime}>
                <FormLabel>Start Time</FormLabel>
                <Input
                  type="datetime-local"
                  value={startTime}
                  min={minDateTime}
                  onChange={handleStartTimeChange}
                />
                <FormErrorMessage>{errors.startTime}</FormErrorMessage>
              </FormControl>

              <FormControl isRequired isInvalid={!!errors.endTime}>
                <FormLabel>End Time</FormLabel>
                <Input
                  type="datetime-local"
                  value={endTime}
                  min={startTime || minDateTime}
                  onChange={handleEndTimeChange}
                />
                <FormErrorMessage>{errors.endTime}</FormErrorMessage>
              </FormControl>
            </SimpleGrid>

            <Box>
              <Text mb={4} fontWeight="medium">
                Candidates
              </Text>
              <VStack spacing={4}>
                {candidates.map((candidate, index) => (
                  <HStack key={index} width="full">
                    <FormControl isRequired>
                      <Input
                        value={candidate.name}
                        onChange={(e) =>
                          handleCandidateChange(index, e.target.value)
                        }
                        placeholder={`Candidate ${index + 1}`}
                      />
                    </FormControl>
                    <IconButton
                      icon={<X />}
                      onClick={() => handleRemoveCandidate(index)}
                      colorScheme="red"
                      variant="ghost"
                      aria-label="Remove candidate"
                    />
                  </HStack>
                ))}
              </VStack>

              <Button
                leftIcon={<Plus size={20} />}
                onClick={handleAddCandidate}
                mt={4}
                size="sm"
                variant="outline"
              >
                Add Candidate
              </Button>
            </Box>

            <Button
              type="submit"
              colorScheme="blue"
              bg="coffee.500"
              _hover={{ bg: "coffee.600" }}
              size="lg"
              mt={4}
              isLoading={loading}
            >
              Create Vote
            </Button>
          </VStack>
        </Box>
      </Container>
    </Box>
  );
};

export default CreateVote;
