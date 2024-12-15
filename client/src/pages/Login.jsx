import { useState } from "react";
import {
  Box,
  Input,
  Button,
  Heading,
  FormLabel,
  FormControl,
  IconButton,
  Text,
  InputGroup,
  InputRightElement,
  useColorModeValue,
  VStack,
  Container,
  Link,
} from "@chakra-ui/react";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import useAuth from "../context/useAuth";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  // Color mode values
  const bgColor = useColorModeValue("milk.500", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const textColor = useColorModeValue("gray.800", "white");
  const mutedColor = useColorModeValue("gray.600", "gray.400");

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setLoading(true);
      await login(email, password);
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      minH="100vh"
      bg={bgColor}
      py={{ base: "12", md: "16" }}
      px={{ base: "4", sm: "8" }}
    >
      <Container maxW="lg">
        <VStack spacing="8">
          <VStack spacing="6" textAlign="center">
            <Heading
              fontSize={{ base: "2xl", md: "3xl" }}
              fontWeight="semibold"
              color={textColor}
            >
              Welcome Back
            </Heading>
            <Text color={mutedColor} fontSize={{ base: "sm", md: "md" }}>
              Enter your credentials to access your account
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
                  <FormLabel color={mutedColor}>Email address</FormLabel>
                  <InputGroup>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      size="lg"
                      borderRadius="md"
                      borderColor={borderColor}
                      _focus={{
                        borderColor: "coffee.500",
                        boxShadow: "0 0 0 1px coffee.500",
                      }}
                    />
                  </InputGroup>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel color={mutedColor}>Password</FormLabel>
                  <InputGroup size="lg">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
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

                <Box w="100%">
                  <Link
                    as={RouterLink}
                    to="/forgot-password"
                    fontSize="sm"
                    color="coffee.500"
                    _hover={{ textDecoration: "none", color: "coffee.600" }}
                    float="right"
                  >
                    Forgot password?
                  </Link>
                </Box>

                <Button
                  type="submit"
                  size="lg"
                  fontSize="md"
                  bg="coffee.500"
                  color="white"
                  width="100%"
                  isLoading={loading}
                  _hover={{ bg: "coffee.600" }}
                  _disabled={{
                    _hover: {
                      bg: "coffee.500",
                    },
                  }}
                  _active={{ bg: "coffee.700" }}
                  rightIcon={<ArrowRight size={18} />}
                >
                  Sign in
                </Button>

                <Text color={mutedColor} fontSize="sm" textAlign="center">
                  Don&apos;t have an account?{" "}
                  <Link
                    as={RouterLink}
                    to="/signup"
                    color="coffee.500"
                    _hover={{ textDecoration: "none", color: "coffee.600" }}
                  >
                    Sign up
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

export default Login;
