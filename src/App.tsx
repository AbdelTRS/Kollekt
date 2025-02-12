import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ChakraProvider, ColorModeScript } from '@chakra-ui/react';
import { theme } from './theme';
import { Auth } from './pages/Auth';
import { Dashboard } from './pages/Dashboard';
import { AddItem } from './pages/AddItem';
import { MyCollection } from './pages/MyCollection';
import { MySales } from './pages/MySales';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { useAuth } from './contexts/AuthContext';

const AppRoutes = () => {
  const { session, loading } = useAuth();

  if (loading) {
    return null;
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          session ? <Navigate to="/dashboard" replace /> : <Auth />
        }
      />
      <Route element={<ProtectedRoute />}>
        <Route
          element={<Layout />}
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/add-item" element={<AddItem />} />
          <Route path="/my-collection" element={<MyCollection />} />
          <Route path="/my-sales" element={<MySales />} />
        </Route>
      </Route>
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
