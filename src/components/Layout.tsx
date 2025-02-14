import { 
  Box, 
  Flex, 
  Button, 
  useColorMode, 
  IconButton, 
  Text, 
  useToast,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  VStack,
  useBreakpointValue
} from '@chakra-ui/react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  MoonIcon, 
  SunIcon, 
  HamburgerIcon, 
  ViewIcon, 
  AddIcon,
  StarIcon,
  SettingsIcon,
  ExternalLinkIcon
} from '@chakra-ui/icons';
import { supabase } from '../lib/supabase';

export const Layout = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const isMobile = useBreakpointValue({ base: true, md: false });

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

  const NavLink = ({ to, icon, children }: { to: string; icon: React.ReactElement; children: React.ReactNode }) => {
    const isActive = location.pathname === to;
    return (
      <Link to={to} style={{ width: '100%' }}>
        <Button
          variant="ghost"
          width="100%"
          justifyContent={isMobile ? "flex-start" : "center"}
          leftIcon={icon}
          bg={isActive ? (colorMode === 'dark' ? 'gray.600' : 'gray.100') : undefined}
          _hover={{
            bg: colorMode === 'dark' ? 'gray.600' : 'gray.100',
            transform: 'translateY(-1px)'
          }}
          _active={{ bg: colorMode === 'dark' ? 'gray.600' : 'gray.200' }}
          transition="all 0.2s"
        >
          {isMobile ? children : <Box display={{ base: 'none', lg: 'block' }}>{children}</Box>}
        </Button>
      </Link>
    );
  };

  const NavigationContent = () => (
    <>
      <NavLink to="/my-collection" icon={<ViewIcon />}>
        Ma collection
      </NavLink>
      <NavLink to="/my-sales" icon={<ExternalLinkIcon />}>
        Mes ventes
      </NavLink>
      <NavLink to="/my-preorders" icon={<StarIcon />}>
        Mes précommandes
      </NavLink>
      <NavLink to="/add-item" icon={<AddIcon />}>
        Ajouter un item
      </NavLink>
    </>
  );

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

        {isMobile ? (
          <Flex>
            <IconButton
              aria-label="Toggle color mode"
              icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
              onClick={toggleColorMode}
              variant="ghost"
              mr={2}
              size="md"
            />
            <IconButton
              aria-label="Open menu"
              icon={<HamburgerIcon />}
              onClick={onOpen}
              variant="ghost"
              size="md"
            />
          </Flex>
        ) : (
          <>
            <Flex align="center" flex={1} justify="center">
              <NavigationContent />
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
              />
              <Button 
                onClick={handleLogout} 
                variant="outline"
                leftIcon={<SettingsIcon />}
                borderColor={colorMode === 'dark' ? 'gray.500' : 'gray.300'}
                _hover={{
                  bg: colorMode === 'dark' ? 'gray.600' : 'gray.100',
                  transform: 'translateY(-1px)',
                  boxShadow: 'sm'
                }}
              >
                <Box display={{ base: 'none', lg: 'block' }}>Déconnexion</Box>
              </Button>
            </Flex>
          </>
        )}
      </Flex>

      <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent bg={colorMode === 'dark' ? 'gray.700' : 'white'}>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">Menu</DrawerHeader>
          <DrawerBody>
            <VStack spacing={4} align="stretch" mt={4}>
              <NavigationContent />
              <Button
                onClick={handleLogout}
                variant="outline"
                leftIcon={<SettingsIcon />}
                width="100%"
                justifyContent="flex-start"
                borderColor={colorMode === 'dark' ? 'gray.500' : 'gray.300'}
                _hover={{
                  bg: colorMode === 'dark' ? 'gray.600' : 'gray.100',
                }}
              >
                Déconnexion
              </Button>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      <Box flex="1" bg={colorMode === 'dark' ? 'gray.800' : 'gray.50'} p={4}>
        <Outlet />
      </Box>
    </Box>
  );
};