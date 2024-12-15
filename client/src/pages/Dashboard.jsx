import { Box, Heading, HStack } from "@chakra-ui/react";
import SearchBar from "../components/Dashboard/SearchBar";
import TotalVoteCard from "../components/Dashboard/TotalVoteCard";
import UpcomingVotesCard from "../components/Dashboard/UpcomingVotesCard";
import LatestVotes from "../components/Dashboard/LatestVotes";

const Dashboard = () => {
  return (
    <Box h={"100vh"} overflow={"auto"} p={8} bg="milk.500">
      <Heading fontSize="2xl" fontWeight="bold">
        Dashboard
      </Heading>
      <SearchBar />

      <HStack w={"full"}>
        <TotalVoteCard />
        <UpcomingVotesCard />
      </HStack>

      <LatestVotes />
    </Box>
  );
};

export default Dashboard;
