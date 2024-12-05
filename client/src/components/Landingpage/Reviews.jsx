import {
  Box,
  Container,
  SimpleGrid,
  VStack,
  Text,
  Image,
  Heading,
  HStack,
  Icon,
  IconButton,
} from "@chakra-ui/react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Element } from "react-scroll";

const StatsCard = ({ number, title, bg = "coffee.600" }) => {
  return (
    <VStack>
      <Box
        bg={bg}
        w="180px"
        h="180px"
        rounded="full"
        display="flex"
        alignItems="center"
        justifyContent="center"
        flexDirection="column"
        shadow="lg"
        transition="transform 0.3s ease"
        _hover={{ transform: "scale(1.05)" }}
      >
        <Text
          fontSize="3xl"
          fontWeight="semibold"
          color="black"
          mb={0}
          lineHeight="1"
        >
          {number}
        </Text>
        <Text fontSize="xl" color="black" mt={2}>
          {title}
        </Text>
      </Box>
    </VStack>
  );
};

const ReviewsCard = ({ name, rating, review, image, bg }) => {
  return (
    <Box
      bg={bg}
      py={10}
      px={8}
      rounded="xl"
      textAlign="center"
      transition="all 0.3s"
      _hover={{ transform: "translateY(-5px)", shadow: "lg" }}
      height="full"
    >
      <Box
        bg="whiteAlpha.200"
        p={4}
        rounded="full"
        width="120px"
        height="120px"
        mx="auto"
        mb={6}
        display="flex"
        alignItems="center"
        justifyContent="center"
        overflow="hidden"
      >
        <Image
          src={image}
          alt={name}
          width="100%"
          height="100%"
          objectFit="cover"
          rounded="full"
        />
      </Box>
      <Text color="white" fontSize="xl" fontWeight="600" mb={2}>
        {name}
      </Text>
      <HStack spacing={1} justify="center" mb={4}>
        {Array(5)
          .fill("")
          .map((_, i) => (
            <Icon
              key={i}
              as={Star}
              color={i < rating ? "yellow.400" : "gray.300"}
              fill={i < rating ? "yellow.400" : "none"}
              boxSize={5}
            />
          ))}
      </HStack>
      <Text color="whiteAlpha.900" fontSize="md" lineHeight="1.6">
        "{review}"
      </Text>
    </Box>
  );
};

export default function Reviews() {
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 3;

  const stats = [
    {
      title: "Users",
      number: "1.5m+",
    },
    {
      title: "Popular",
      number: "#1",
    },
    {
      title: "Satisfied",
      number: "99%",
    },
  ];

  const reviews = [
    {
      name: "Kevin Lurry",
      rating: 5,
      review: "Very good application. It's easier for me to making a vote.",
      image: "/images/Ellipse 8.png",
    },
    {
      name: "Alexa Becca",
      rating: 5,
      review:
        "It is very unexpected that we get this complete feature for free.",
      image: "/images/Ellipse 10.png",
    },
    {
      name: "John Philips",
      rating: 5,
      review:
        "I know this application from my friend and when I tried it, its amazing.",
      image: "/images/Ellipse 12.png",
    },
  ];

  // Calculate total pages
  const totalPages = Math.ceil(reviews.length / reviewsPerPage);

  // Get current reviews
  const indexOfLastReview = currentPage * reviewsPerPage;
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
  const currentReviews = reviews.slice(indexOfFirstReview, indexOfLastReview);

  // Change page
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  return (
    <Element name="reviews">
      <Box bg="milk.500" py={5}>
        <Container maxW="5xl" px={{ base: 6, md: 10 }}>
          <SimpleGrid
            columns={{ base: 1, md: 3 }}
            spacing={{ base: 10, lg: 16 }}
            justifyItems="center"
          >
            {stats.map((stat) => (
              <StatsCard key={stat.title} {...stat} />
            ))}
          </SimpleGrid>

          <Heading
            mt={20}
            mb={12}
            fontSize={{ base: "3xl", md: "4xl" }}
            fontWeight="600"
            color="coffee.700"
            textAlign="center"
          >
            User Reviews
          </Heading>

          <SimpleGrid
            columns={{ base: 1, md: 3 }}
            spacing={{ base: 8, lg: 12 }}
            mt={10}
          >
            {currentReviews.map((review, index) => (
              <ReviewsCard
                key={review.name}
                {...review}
                bg={index % 2 === 0 ? "coffee.700" : "coffee.800"}
              />
            ))}
          </SimpleGrid>

          {/* Paginator */}
          <HStack spacing={8} justify="center" mt={10} position="relative">
            <IconButton
              icon={<ChevronLeft size={20} />}
              variant="ghost"
              color="coffee.600"
              onClick={prevPage}
              isDisabled={currentPage === 1}
              _hover={{ bg: "transparent", color: "coffee.800" }}
              position="absolute"
              left="35%"
            />

            <HStack spacing={3}>
              {Array.from({ length: totalPages }).map((_, index) => (
                <Box
                  key={index + 1}
                  w="10px"
                  h="10px"
                  rounded="full"
                  bg={currentPage === index + 1 ? "coffee.600" : "gray.300"}
                  cursor="pointer"
                  onClick={() => handlePageChange(index + 1)}
                  transition="all 0.2s"
                  _hover={{ bg: "coffee.600" }}
                />
              ))}
            </HStack>

            <IconButton
              icon={<ChevronRight size={20} />}
              variant="ghost"
              color="coffee.600"
              onClick={nextPage}
              isDisabled={currentPage === totalPages}
              _hover={{ bg: "transparent", color: "coffee.800" }}
              position="absolute"
              right="35%"
            />
          </HStack>
        </Container>
      </Box>
    </Element>
  );
}
