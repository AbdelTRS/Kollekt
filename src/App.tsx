import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ChakraProvider, ColorModeScript, Spinner, Center } from '@chakra-ui/react';
import { theme } from './theme';
import { Auth } from './pages/Auth';
import { Dashboard } from './pages/Dashboard';
import { AddItem } from './pages/AddItem';
import { MyCollection } from './pages/MyCollection';
import { MySales } from './pages/MySales';
import { MyPreorders } from './pages/MyPreorders';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { useEffect } from 'react';
import { supabase } from './lib/supabase';

const LoadingScreen = () => (
  <Center h="100vh">
    <Spinner size="xl" />
  </Center>
);

const AuthCallback = () => {
  const { session } = useAuth();
  return session ? <Navigate to="/dashboard" replace /> : <Navigate to="/" replace />;
};

const AppRoutes = () => {
  const { session, loading } = useAuth();

  useEffect(() => {
    // Vérifier la session au chargement
    const checkSession = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (!currentSession && window.location.pathname !== '/') {
        window.location.href = '/';
      }
    };

    checkSession();

    // Écouter les changements de session
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' && window.location.pathname !== '/') {
        window.location.href = '/';
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          session ? <Navigate to="/dashboard" replace /> : <Auth />
        }
      />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/add-item" element={<AddItem />} />
          <Route path="/my-collection" element={<MyCollection />} />
          <Route path="/my-sales" element={<MySales />} />
          <Route path="/my-preorders" element={<MyPreorders />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <ChakraProvider theme={theme}>
        <ColorModeScript initialColorMode={theme.config.initialColorMode} />
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ChakraProvider>
    </Router>
  );
}

export default App;
