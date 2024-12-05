import { Link as RouterLink, Outlet } from 'react-router-dom';
import { Box, Container, Flex, Link, useColorModeValue } from '@chakra-ui/react';

function Layout() {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Box minH="100vh" bg={useColorModeValue('gray.50', 'gray.900')}>
      {/* Navigation */}
      <Box as="nav" bg={bgColor} borderBottom="1px" borderColor={borderColor}>
        <Container maxW="6xl" px={4}>
          <Flex h={16} alignItems="center" justifyContent="space-between">
            <Flex gap={4}>
              <Link
                as={RouterLink}
                to="/"
                px={3}
                py={2}
                rounded="md"
                _hover={{ textDecoration: 'none', bg: useColorModeValue('gray.100', 'gray.700') }}
              >
                Home
              </Link>
              <Link
                as={RouterLink}
                to="/vote"
                px={3}
                py={2}
                rounded="md"
                _hover={{ textDecoration: 'none', bg: useColorModeValue('gray.100', 'gray.700') }}
              >
                Vote
              </Link>
              <Link
                as={RouterLink}
                to="/results"
                px={3}
                py={2}
                rounded="md"
                _hover={{ textDecoration: 'none', bg: useColorModeValue('gray.100', 'gray.700') }}
              >
                Results
              </Link>
            </Flex>
          </Flex>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxW="6xl" px={4} py={8}>
        <Outlet />
      </Container>
    </Box>
  );
}

export default Layout;
