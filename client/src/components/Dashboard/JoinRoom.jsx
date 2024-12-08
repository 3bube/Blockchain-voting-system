import { useState } from "react";
import {
  Box,
  Container,
  Flex,
  Heading,
  Text,
  Image,
  FormControl,
  FormLabel,
  Input,
  useToast,
  VStack,
  Button,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../../contexts/SocketContext";
import { joinRoomByAccessCode } from "../../utils/room.utils";

const JoinRoom = () => {
  const navigate = useNavigate();
  const { socket } = useSocket();
  const [accessCode, setAccessCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!accessCode.trim()) {
      setError("Please enter a room code");
      toast({
        title: "Error",
        description: "Please enter a room code",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    setLoading(true);
    try {
      const roomData = await joinRoomByAccessCode(accessCode);

      // join room
      socket?.emit("join_room", { roomId: roomData._id });

      // navigate to room
      navigate(
        `/dashboard/room/${roomData._id}?accessCode=${roomData.accessCode}`
      );
    } catch (error) {
      setError(error.message);
      toast({
        title: "Error",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      bg="milk.500"
      minH={"100vh"}
      py={{ base: "12", md: "16" }}
      px={{ base: "4", sm: "8" }}
    >
      <Container maxW="container.lg">
        <Box p={4} textAlign="center" mx={"auto"}>
          <Heading fontWeight={"semibold"}>Join Room</Heading>

          <Flex direction="column" alignItems="center" mt={8}>
            <Image src="/images/Refer a friend.png" h={"400px"} />

            <VStack mt={8} alignItems={"center"} justifyContent={"center"}>
              <Text>Enter your room code to give your vote!</Text>

              <form onSubmit={handleSubmit}>
                {error && (
                  <Text color={"red.500"} fontSize={"sm"} mt={2}>
                    {error}
                  </Text>
                )}
                <FormControl mt={4} gap={3}>
                  <FormLabel
                    fontSize={23}
                    fontWeight={"light"}
                    textAlign={"center"}
                    htmlFor="room-code"
                  >
                    Your Code :
                  </FormLabel>
                  <Input
                    type="text"
                    id="room-code"
                    name="room-code"
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                    placeholder="ex: 4BY081"
                    bg={"white"}
                    mb={4}
                    _placeholder={{
                      textAlign: "center",
                      fontWeight: "light",
                      padding: "4",
                    }}
                    fontSize={20}
                    fontWeight={"light"}
                  />
                  <Button
                    w="full"
                    bg={"coffee.600"}
                    _hover={{ bg: "coffee.700" }}
                    transition={"all 0.2s"}
                    transitionDuration={"0.3s"}
                    _active={{ bg: "coffee.800" }}
                    boxShadow={"md"}
                    type="submit"
                    isLoading={loading}
                  >
                    Enter Room
                  </Button>
                </FormControl>
              </form>
            </VStack>
          </Flex>
        </Box>
      </Container>
    </Box>
  );
};

export default JoinRoom;
