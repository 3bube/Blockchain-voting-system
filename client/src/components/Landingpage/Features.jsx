import {
  Box,
  Container,
  Heading,
  SimpleGrid,
  Text,
  Image,
} from "@chakra-ui/react";
import { Element } from "react-scroll";

const FeatureCard = ({ title, icon }) => {
  return (
    <Box
      bg="whiteAlpha.200"
      backdropFilter="blur(10px)"
      py={10}
      px={5}
      rounded="xl"
      textAlign="center"
      transition="all 0.3s"
      _hover={{ transform: "translateY(-5px)", shadow: "lg" }}
    >
      <Box
        bg="whiteAlpha.100"
        backdropFilter={"blur(10px)"}
        p={4}
        rounded="full"
        width="150px"
        height="150px"
        mx="auto"
        mb={4}
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Image
          src={icon}
          alt={title}
          width="70%"
          objectFit={"contain"}
          height="full"
        />
      </Box>
      <Heading as="h3" size="md" color="white" fontWeight="600" mb={2}>
        {title}
      </Heading>
    </Box>
  );
};

export default function Features() {
  const features = [
    {
      title: "Fast",
      icon: "/icons/Fast Icon.png",
    },
    {
      title: "Simple",
      icon: "/icons/Simple Icon.png",
    },
    {
      title: "Modern",
      icon: "/icons/Modern Icon.png",
    },
  ];

  return (
    <Element name="features">
      <Box py={20} bg="coffee.600">
        <Container maxW="5xl">
          <Heading
            as="h2"
            textAlign="center"
            mb={16}
            color="white"
            fontSize={{ base: "3xl", md: "4xl" }}
            fontWeight="600"
          >
            Why Polls.io ?
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10}>
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </SimpleGrid>
        </Container>
      </Box>
    </Element>
  );
}
