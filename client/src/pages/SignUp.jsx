import { useState } from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  InputGroup,
  FormControl,
  Input,
  Button,
  FormLabel,
  VStack,
  useColorModeValue,
  Link,
  useToast,
  InputRightElement,
  IconButton,
} from "@chakra-ui/react";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

const SignUp = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const toast = useToast();

  const { register } = useAuth();

  // Color mode values
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const mutedColor = useColorModeValue("gray.600", "gray.400");

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(formData.name, formData.email, formData.password);
      navigate("/login");
      toast({
        title: "Account created.",
        description: "We've created your account for you.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error(error);
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
      minH="100vh"
      bg="milk.500"
      py={{ base: "12", md: "16" }}
      px={{ base: "4", sm: "8" }}
    >
      <Container maxW="lg">
        <VStack spacing="8">
          <VStack spacing="6" textAlign="center">
            <Heading
              fontSize={{ base: "2xl", md: "3xl" }}
              fontWeight="semibold"
              color="coffee.500"
              fontFamily="Oxanium"
            >
              Create Account
            </Heading>
            <Text color={mutedColor} fontSize={{ base: "sm", md: "md" }}>
              Join us and start your voting journey
            </Text>
          </VStack>

          <Box
            py="8"
            px={{ base: "4", md: "10" }}
            bg={cardBg}
            borderRadius="xl"
            borderWidth="1px"
            borderColor={borderColor}
            w="100%"
          >
            <form onSubmit={handleSubmit}>
              <VStack spacing="6">
                <FormControl isRequired>
                  <FormLabel color={mutedColor}>Full Name</FormLabel>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    size="lg"
                    borderRadius="md"
                    borderColor={borderColor}
                    _focus={{
                      borderColor: "coffee.500",
                      boxShadow: "0 0 0 1px coffee.500",
                    }}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel color={mutedColor}>Email address</FormLabel>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    size="lg"
                    borderRadius="md"
                    borderColor={borderColor}
                    _focus={{
                      borderColor: "coffee.500",
                      boxShadow: "0 0 0 1px coffee.500",
                    }}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel color={mutedColor}>Password</FormLabel>
                  <InputGroup size="lg">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Create a password"
                      borderRadius="md"
                      borderColor={borderColor}
                      pr="12"
                      _focus={{
                        borderColor: "coffee.500",
                        boxShadow: "0 0 0 1px coffee.500",
                      }}
                    />
                    <InputRightElement>
                      <IconButton
                        icon={
                          showPassword ? (
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )
                        }
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                        color={mutedColor}
                        _hover={{ bg: "transparent" }}
                      />
                    </InputRightElement>
                  </InputGroup>
                </FormControl>

                <Button
                  type="submit"
                  size="lg"
                  fontSize="md"
                  bg="coffee.500"
                  color="white"
                  isLoading={loading}
                  width="100%"
                  _hover={{ bg: "coffee.600" }}
                  _active={{ bg: "coffee.700" }}
                  rightIcon={<ArrowRight size={18} />}
                >
                  Create Account
                </Button>

                <Text color={mutedColor} fontSize="sm" textAlign="center">
                  Already have an account?{" "}
                  <Link
                    as={RouterLink}
                    to="/login"
                    color="coffee.500"
                    _hover={{ textDecoration: "none", color: "coffee.600" }}
                  >
                    Sign in
                  </Link>
                </Text>
              </VStack>
            </form>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
};

export default SignUp;
