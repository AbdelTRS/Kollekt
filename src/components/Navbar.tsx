import {
  Box,
  Flex,
  Button,
  useColorModeValue,
  Stack,
  useToast,
  Link,
} from '@chakra-ui/react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export const Navbar = () => {
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
    <Box
      bg={useColorModeValue('white', 'gray.800')}
      px={4}
      boxShadow="sm"
      position="sticky"
      top={0}
      zIndex={1}
    >
      <Flex h={16} alignItems="center" justifyContent="space-between">
        <Stack direction="row" spacing={4} align="center">
          <Link
            as={RouterLink}
            to="/dashboard"
            fontSize="lg"
            fontWeight="bold"
            _hover={{
              textDecoration: 'none',
              color: 'blue.500',
            }}
          >
            Dashboard
          </Link>
          <Link
            as={RouterLink}
            to="/my-collection"
            fontSize="lg"
            _hover={{
              textDecoration: 'none',
              color: 'blue.500',
            }}
          >
            Ma Collection
          </Link>
          <Link
            as={RouterLink}
            to="/add-item"
            fontSize="lg"
            _hover={{
              textDecoration: 'none',
              color: 'blue.500',
            }}
          >
            Ajouter un item
          </Link>
        </Stack>

        <Button
          colorScheme="red"
          variant="ghost"
          onClick={handleLogout}
        >
          Se déconnecter
        </Button>
      </Flex>
    </Box>
  );
}; 