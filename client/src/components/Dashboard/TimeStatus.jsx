import { useState, useEffect } from "react";
import { Box, Text, VStack, Heading } from "@chakra-ui/react";
import { MapPin } from "lucide-react";

const TimeStatus = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Box
      borderRadius="xl"
      overflow="hidden"
      position="relative"
      boxShadow={"xl"}
      h="300px"
      bg="linear-gradient(135deg, rgba(73,60,51,1) 0%, rgba(120,80,54,1) 100%)"
      _before={{
        content: '""',
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: "url('/images/TimeStatus.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <VStack
        position="relative"
        zIndex={1}
        h="full"
        justify="center"
        spacing={2}
        p={6}
        color="white"
        fontFamily="Oxanium"
      >
        <Heading size="lg" fontWeight="bold">
          {formatTime(currentTime)}
        </Heading>
        <Text fontSize="md">{formatDate(currentTime)}</Text>
      </VStack>
    </Box>
  );
};

export default TimeStatus;
