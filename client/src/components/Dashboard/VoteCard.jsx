import {
  Box,
  Text,
  HStack,
  Badge,
  Progress,
  useToast,
  VStack,
  Divider,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { Copy } from "lucide-react";

const VoteCard = ({ vote, accessCode }) => {
  const getTimeRemaining = (endTime) => {
    const end = new Date(endTime);
    const now = new Date();
    const diff = end - now;

    if (diff < 0) return "Ended";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${days}d ${hours}h ${minutes}m`;
  };

  // const getStatus = (startTime, endTime) => {
  //   const now = new Date();
  //   const start = new Date(startTime);
  //   const end = new Date(endTime);

  //   if (now < start) return "pending";
  //   if (now > end) return "completed";
  //   return "active";
  // };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "yellow";
      /*************  ✨ Codeium Command 🌟  *************/
      case "active":
      case "new":
        return "green";
      case "completed":
        return "gray";
      case "closed":
        return "red";
      default:
        return "gray";
    }
  };

  const getTotalVotes = () => {
    return vote.candidates.reduce(
      (sum, candidate) => sum + candidate.voteCount,
      0
    );
  };

  const toast = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(accessCode);
    toast({
      title: "Access code copied",
      description: "Access code has been copied to your clipboard",
      status: "success",
      duration: 3000,
    });
  };

  const navigate = useNavigate();
  const totalVotes = getTotalVotes();

  const handleVoteDetailsClick = (id) => () => {
    if (vote?.status === "closed") {
      toast({
        title: "Vote is closed",
        description: "You cannot view the details of a closed vote",
        status: "warning",
        duration: 3000,
      });
      return;
    }
    navigate(`/dashboard/vote-details?voteId=${id}`);
  };

  return (
    <Box
      bg="white"
      p={4}
      borderRadius="lg"
      shadow="sm"
      border="1px"
      borderColor="gray.100"
      _hover={{ shadow: "md" }}
      transition="all 0.2s"
    >
      <VStack align="stretch" spacing={3}>
        <HStack justify="space-between">
          <Text
            fontWeight="bold"
            fontSize="lg"
            cursor={"pointer"}
            _hover={{ textDecoration: "underline" }}
            onClick={handleVoteDetailsClick(vote._id)}
          >
            {vote.title}
          </Text>
          {accessCode && (
            <Badge
              display={"flex"}
              alignItems={"center"}
              gap={1}
              colorScheme="gray"
              fontSize="sm"
              onClick={handleCopy}
              cursor={"pointer"}
            >
              {accessCode} <Copy size={16} />
            </Badge>
          )}
          <Badge colorScheme={getStatusColor(vote?.status)}>
            {vote?.status}
          </Badge>
        </HStack>

        <Divider />

        <Box>
          <Text fontSize="sm" color="gray.600" mb={2}>
            Candidates:
          </Text>
          {vote.candidates.map((candidate, index) => (
            <Box key={index} mb={2}>
              <HStack justify="space-between" mb={1}>
                <Text fontSize="sm">{candidate.name}</Text>
                <Text fontSize="sm" color="gray.600">
                  {candidate.voteCount} votes
                </Text>
              </HStack>
              <Progress
                value={(candidate.voteCount / (totalVotes || 1)) * 100}
                size="sm"
                colorScheme="coffee"
                borderRadius="full"
              />
            </Box>
          ))}
        </Box>

        <HStack justify="space-between" fontSize="sm" color="gray.600">
          <Text>Total Votes: {totalVotes}</Text>
          <Text>Time Remaining: {getTimeRemaining(vote.endTime)}</Text>
        </HStack>
      </VStack>
    </Box>
  );
};

VoteCard.propTypes = {
  vote: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    startTime: PropTypes.string.isRequired,
    accessCode: PropTypes.string,
    endTime: PropTypes.string.isRequired,
    candidates: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        voteCount: PropTypes.number.isRequired,
      })
    ).isRequired,
  }).isRequired,
};

export default VoteCard;
