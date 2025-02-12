import { Box, Flex, Button, useColorMode, IconButton, Text, useToast } from '@chakra-ui/react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { MoonIcon, SunIcon } from '@chakra-ui/icons';
import { supabase } from '../lib/supabase';

export const Layout = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const navigate = useNavigate();
  const toast = useToast();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: 'Déconnexion réussie',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      navigate('/');
    } catch (error: any) {
      toast({
        title: 'Erreur lors de la déconnexion',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box minH="100vh" display="flex" flexDirection="column">
      <Flex
        as="nav"
        align="center"
        justify="space-between"
        wrap="wrap"
        padding="1.5rem"
        bg={colorMode === 'dark' ? 'gray.800' : 'white'}
        color={colorMode === 'dark' ? 'white' : 'gray.800'}
        borderBottom="1px"
        borderColor={colorMode === 'dark' ? 'gray.700' : 'gray.200'}
      >
        <Flex align="center" mr={8}>
          <Link to="/dashboard">
            <Text
              fontSize="2xl"
              fontWeight="bold"
              letterSpacing="tight"
              _hover={{ color: 'blue.500' }}
            >
              Kollekt
            </Text>
          </Link>
        </Flex>

        <Flex align="center" flex={1}>
          <Link to="/my-collection">
            <Button 
              variant="ghost" 
              mr={4}
              _focus={{ boxShadow: 'none' }}
              _active={{ bg: 'transparent' }}
            >
              Ma collection
            </Button>
          </Link>
          <Link to="/my-sales">
            <Button 
              variant="ghost" 
              mr={4}
              _focus={{ boxShadow: 'none' }}
              _active={{ bg: 'transparent' }}
            >
              Mes ventes
            </Button>
          </Link>
          <Link to="/add-item">
            <Button 
              variant="ghost" 
              mr={4}
              _focus={{ boxShadow: 'none' }}
              _active={{ bg: 'transparent' }}
            >
              Ajouter un item
            </Button>
          </Link>
        </Flex>

        <Flex align="center">
          <IconButton
            aria-label="Toggle color mode"
            icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
            onClick={toggleColorMode}
            variant="ghost"
            mr={4}
            _focus={{ boxShadow: 'none' }}
            _active={{ bg: 'transparent' }}
          />
          <Button 
            onClick={handleLogout} 
            variant="outline"
            _focus={{ boxShadow: 'none' }}
            _active={{ bg: 'transparent' }}
          >
            Déconnexion
          </Button>
        </Flex>
      </Flex>

      <Box flex="1" bg={colorMode === 'dark' ? 'gray.800' : 'white'} p={4}>
        <Outlet />
      </Box>
    </Box>
  );
};