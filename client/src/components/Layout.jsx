import { Link as RouterLink, Outlet } from "react-router-dom";
import {
  Box,
  Container,
  Flex,
  Link,
  useColorModeValue,
} from "@chakra-ui/react";

const Layout = () => {
  return (
    <Box width="100vw" minH="100vh" overflow="hidden">
      {/* Main Content */}
      <Outlet />
    </Box>
  );
};

export default Layout;
