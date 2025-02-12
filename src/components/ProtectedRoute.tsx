import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Center, Spinner } from '@chakra-ui/react';

export const ProtectedRoute = () => {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  return session ? <Outlet /> : <Navigate to="/" replace />;
}; 