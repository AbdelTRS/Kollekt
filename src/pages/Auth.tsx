import { useState } from 'react';
import {
  Box,
  Container,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Heading,
  useColorModeValue,
  IconButton,
  Flex,
} from '@chakra-ui/react';
import { LoginForm } from '../components/Auth/LoginForm';
import { RegisterForm } from '../components/Auth/RegisterForm';
import { MoonIcon, SunIcon } from '@chakra-ui/icons';
import { useColorMode } from '@chakra-ui/react';

export const Auth = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const bgBox = useColorModeValue('white', 'gray.700');
  const bgContainer = useColorModeValue('gray.50', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const tabColor = useColorModeValue('gray.600', 'white');
  const selectedTabBg = useColorModeValue('white', 'gray.700');
  const selectedTabColor = useColorModeValue('blue.600', 'blue.200');

  return (
    <Box minH="100vh" bg={bgContainer} py={10}>
      <Container maxW="container.sm">
        <Flex justify="flex-end" mb={4}>
          <IconButton
            aria-label="Toggle color mode"
            icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
            onClick={toggleColorMode}
            variant="ghost"
            _focus={{ boxShadow: 'none' }}
            _active={{ bg: 'transparent' }}
          />
        </Flex>
        <Box textAlign="center" mb={10}>
          <Heading size="2xl" color={tabColor}>Kollekt</Heading>
          <Heading size="md" color={tabColor} mt={2} fontWeight="normal">Gestion de Collection</Heading>
        </Box>
        <Box 
          bg={bgBox} 
          p={8} 
          borderRadius="xl" 
          boxShadow="xl"
          borderWidth="1px"
          borderColor={borderColor}
        >
          <Tabs isFitted variant="enclosed">
            <TabList mb="1em">
              <Tab 
                _selected={{ 
                  color: selectedTabColor,
                  bg: selectedTabBg,
                  borderColor: borderColor,
                  borderBottom: 'none',
                }}
                color={tabColor}
                _focus={{ boxShadow: 'none' }}
                fontWeight="semibold"
              >
                Connexion
              </Tab>
              <Tab 
                _selected={{ 
                  color: selectedTabColor,
                  bg: selectedTabBg,
                  borderColor: borderColor,
                  borderBottom: 'none',
                }}
                color={tabColor}
                _focus={{ boxShadow: 'none' }}
                fontWeight="semibold"
              >
                Inscription
              </Tab>
            </TabList>
            <TabPanels>
              <TabPanel px={0}>
                <LoginForm />
              </TabPanel>
              <TabPanel px={0}>
                <RegisterForm />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      </Container>
    </Box>
  );
}; 