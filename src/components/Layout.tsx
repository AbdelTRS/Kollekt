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
    <Box minH="100vh" display="flex" flexDirection="column" bg={colorMode === 'dark' ? 'gray.800' : 'gray.50'}>
      <Flex
        as="nav"
        align="center"
        justify="space-between"
        wrap="wrap"
        padding="1.5rem"
        bg={colorMode === 'dark' ? 'gray.700' : 'white'}
        color={colorMode === 'dark' ? 'white' : 'gray.800'}
        borderBottom="1px"
        borderColor={colorMode === 'dark' ? 'gray.600' : 'gray.200'}
        boxShadow="sm"
      >
        <Flex align="center" mr={8}>
          <Link to="/dashboard">
            <Text
              fontSize="2xl"
              fontWeight="bold"
              letterSpacing="tight"
              _hover={{ color: 'blue.500' }}
              transition="all 0.2s"
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
              _hover={{
                bg: colorMode === 'dark' ? 'gray.600' : 'gray.100',
                transform: 'translateY(-1px)'
              }}
              _active={{ bg: colorMode === 'dark' ? 'gray.600' : 'gray.200' }}
              transition="all 0.2s"
            >
              Ma collection
            </Button>
          </Link>
          <Link to="/my-sales">
            <Button 
              variant="ghost" 
              mr={4}
              _hover={{
                bg: colorMode === 'dark' ? 'gray.600' : 'gray.100',
                transform: 'translateY(-1px)'
              }}
              _active={{ bg: colorMode === 'dark' ? 'gray.600' : 'gray.200' }}
              transition="all 0.2s"
            >
              Mes ventes
            </Button>
          </Link>
          <Link to="/my-preorders">
            <Button 
              variant="ghost" 
              mr={4}
              _hover={{
                bg: colorMode === 'dark' ? 'gray.600' : 'gray.100',
                transform: 'translateY(-1px)'
              }}
              _active={{ bg: colorMode === 'dark' ? 'gray.600' : 'gray.200' }}
              transition="all 0.2s"
            >
              Mes précommandes
            </Button>
          </Link>
          <Link to="/add-item">
            <Button 
              variant="ghost" 
              mr={4}
              _hover={{
                bg: colorMode === 'dark' ? 'gray.600' : 'gray.100',
                transform: 'translateY(-1px)'
              }}
              _active={{ bg: colorMode === 'dark' ? 'gray.600' : 'gray.200' }}
              transition="all 0.2s"
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
            _hover={{
              bg: colorMode === 'dark' ? 'gray.600' : 'gray.100',
              transform: 'translateY(-1px)'
            }}
            _active={{ bg: colorMode === 'dark' ? 'gray.600' : 'gray.200' }}
            transition="all 0.2s"
          />
          <Button 
            onClick={handleLogout} 
            variant="outline"
            borderColor={colorMode === 'dark' ? 'gray.500' : 'gray.300'}
            _hover={{
              bg: colorMode === 'dark' ? 'gray.600' : 'gray.100',
              transform: 'translateY(-1px)',
              boxShadow: 'sm'
            }}
            _active={{ bg: colorMode === 'dark' ? 'gray.600' : 'gray.200' }}
            transition="all 0.2s"
          >
            Déconnexion
          </Button>
        </Flex>
      </Flex>

      <Box 
        flex="1" 
        bg={colorMode === 'dark' ? 'gray.800' : 'gray.50'} 
        p={4}
      >
        <Outlet />
      </Box>
    </Box>
  );
};