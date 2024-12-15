import { useState } from "react";
import {
  Box,
  Text,
  Heading,
  Container,
  Stack,
  Button,
  Input,
  useColorMode,
  useToast,
  Switch,
} from "@chakra-ui/react";
import useAuth from "../../context/useAuth";
import { updateUser } from "../../utils/user.utils";

const Settings = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const { currentUser: user } = useAuth();
  const [name, setName] = useState(user?.name);
  const [email, setEmail] = useState(user?.email);
  const [password, setPassword] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(colorMode === "dark");
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const handleSave = async () => {
    setIsLoading(true);
    try {
      await updateUser(user?._id, name, email, password);
      toast({
        title: "Success",
        description: "Profile saved successfully",
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
      setIsLoading(false);
    }
  };

  const handleToggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    toggleColorMode();
  };

  return (
    <Box
      p={4}
      bg={colorMode === "light" ? "milk.500" : "coffee.900"}
      minH={"100vh"}
    >
      <Container mt={8} maxW="container.lg">
        <Heading as="h1" size="xl" mb={4}>
          Settings
        </Heading>
        <Stack spacing={4}>
          <Input
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            colorScheme="coffee"
            variant="solid"
            isLoading={isLoading}
            onClick={handleSave}
            width="fit-content"
          >
            Save
          </Button>
          <Stack direction="row" alignItems="center">
            <Text>Dark Mode</Text>
            <Switch
              isChecked={isDarkMode}
              onChange={handleToggleDarkMode}
              size="md"
            />
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
};

export default Settings;
