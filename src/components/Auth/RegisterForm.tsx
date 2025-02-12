import { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  useToast,
  useColorModeValue,
} from '@chakra-ui/react';
import { supabase } from '../../lib/supabase';

export const RegisterForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const inputBg = useColorModeValue('white', 'gray.700');
  const inputBorder = useColorModeValue('gray.200', 'gray.600');
  const labelColor = useColorModeValue('gray.700', 'gray.200');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (password !== confirmPassword) {
      toast({
        title: 'Erreur',
        description: 'Les mots de passe ne correspondent pas',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: 'Inscription réussie',
        description: 'Vérifiez votre email pour confirmer votre compte',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error: any) {
      toast({
        title: 'Erreur d\'inscription',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box w="100%">
      <form onSubmit={handleRegister}>
        <VStack spacing={6}>
          <FormControl isRequired>
            <FormLabel color={labelColor}>Email</FormLabel>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              bg={inputBg}
              borderColor={inputBorder}
              size="lg"
              _focus={{
                borderColor: 'blue.500',
                boxShadow: 'none',
              }}
            />
          </FormControl>
          <FormControl isRequired>
            <FormLabel color={labelColor}>Mot de passe</FormLabel>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              bg={inputBg}
              borderColor={inputBorder}
              size="lg"
              _focus={{
                borderColor: 'blue.500',
                boxShadow: 'none',
              }}
            />
          </FormControl>
          <FormControl isRequired>
            <FormLabel color={labelColor}>Confirmer le mot de passe</FormLabel>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              bg={inputBg}
              borderColor={inputBorder}
              size="lg"
              _focus={{
                borderColor: 'blue.500',
                boxShadow: 'none',
              }}
            />
          </FormControl>
          <Button
            type="submit"
            colorScheme="blue"
            width="100%"
            isLoading={loading}
            size="lg"
            _focus={{ boxShadow: 'none' }}
            _active={{ transform: 'scale(0.98)' }}
          >
            S'inscrire
          </Button>
        </VStack>
      </form>
    </Box>
  );
}; 