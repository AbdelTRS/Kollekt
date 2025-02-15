import {
  Box,
  Container,
  Heading,
  VStack,
  HStack,
  Text,
  Button,
  useToast,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Checkbox,
  Image,
  TableContainer,
  useColorModeValue,
  Badge,
  Flex,
  Spacer,
  ButtonGroup,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
  Input,
  Select,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  IconButton,
  SimpleGrid,
  Center,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Tooltip,
} from '@chakra-ui/react';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { CheckIcon, DeleteIcon, AddIcon, EditIcon } from '@chakra-ui/icons';

type PreorderItem = {
  id: string;
  type: 'SCELLE' | 'CARTE';
  sub_type?: string;
  language?: 'FR' | 'JAP';
  card_name?: string;
  card_image?: string;
  sealed_image?: string;
  quantity: number;
  purchase_price?: number;
  card_purchase_price?: number;
  purchase_date?: string;
  card_purchase_date?: string;
  purchase_location?: string;
  card_purchase_location?: string;
  item_name?: string;
  series_id?: number;
  extension_id?: number;
  expected_date?: string;
};

// Fonction utilitaire pour obtenir l'URL de l'image
const getImageUrl = (type: 'SCELLE' | 'CARTE', image: string | undefined, userId: string | undefined): string | undefined => {
  if (!image) return undefined;
  return type === 'CARTE' 
    ? image 
    : `https://odryoxqrsdhsdhfueqqs.supabase.co/storage/v1/object/public/sealed-images/${userId}/${image}`;
};

// Ajout des nouveaux types
type Series = {
  id: number;
  name: string;
  code: string;
};

type Extension = {
  id: number;
  name: string;
  code: string;
  series_id: number;
};

// Ajout du type pour les images existantes
type ExistingImage = {
  name: string;
  url: string;
};

// Types de produits scellés qui ne nécessitent pas d'extension
const SEALED_TYPES_WITHOUT_EXTENSION = ['UPC', 'Duopack', 'Tin cube', 'Pokébox', 'Coffret'];

export const MyPreorders = () => {
  const { session } = useAuth();
  const toast = useToast();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure();

  // États
  const [preorders, setPreorders] = useState<PreorderItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  // Nouveaux états pour le formulaire d'ajout
  const [series, setSeries] = useState<Series[]>([]);
  const [extensions, setExtensions] = useState<Extension[]>([]);
  const [filteredExtensions, setFilteredExtensions] = useState<Extension[]>([]);
  const [newItem, setNewItem] = useState({
    itemName: '',
    sealedType: '',
    purchasePrice: '',
    purchaseLocation: '',
    purchaseDate: '',
    expectedDate: '',
    quantity: '1',
    selectedSeriesId: null as number | null,
    selectedExtensionId: null as number | null,
    sealedImage: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // États pour la gestion des images
  const [existingImages, setExistingImages] = useState<ExistingImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingItem, setEditingItem] = useState<string | null>(null);

  // Amélioration des thèmes de couleurs
  const bgColor = useColorModeValue('gray.50', 'gray.800');
  const bgCard = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const hoverBgColor = useColorModeValue('blue.50', 'gray.600');
  const textColor = useColorModeValue('gray.700', 'gray.100');
  const secondaryTextColor = useColorModeValue('gray.600', 'gray.300');
  const tableHeaderBg = useColorModeValue('gray.100', 'gray.700');
  const tableBorderColor = useColorModeValue('gray.200', 'gray.600');
  const tableStripedBg = useColorModeValue('gray.50', 'gray.700');

  // Nouveaux états pour les filtres
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [selectedSeriesId, setSelectedSeriesId] = useState<number | null>(null);
  const [selectedExtensionId, setSelectedExtensionId] = useState<number | null>(null);
  const [filteredPreorders, setFilteredPreorders] = useState<PreorderItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Charger les précommandes
  const fetchPreorders = useCallback(async () => {
    try {
      if (!session?.user?.id) return;

      const { data, error } = await supabase
        .from('items')
        .select(`
          id,
          type,
          sub_type,
          language,
          card_name,
          card_image,
          sealed_image,
          quantity,
          purchase_price,
          card_purchase_price,
          purchase_date,
          card_purchase_date,
          purchase_location,
          card_purchase_location,
          item_name,
          series_id,
          extension_id,
          expected_date
        `)
        .eq('user_id', session.user.id)
        .eq('is_preorder', true)
        .order('expected_date', { ascending: true });

      if (error) throw error;
      setPreorders(data || []);
    } catch (error: any) {
      toast({
        title: 'Erreur lors du chargement des précommandes',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id, toast]);

  // Gérer la sélection des items
  const handleItemSelect = useCallback((id: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  // Gérer la sélection de tous les items
  const handleSelectAll = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedItems(new Set(preorders.map(item => item.id)));
    } else {
      setSelectedItems(new Set());
    }
  }, [preorders]);

  // Marquer les items comme reçus
  const handleMarkAsReceived = useCallback(async () => {
    if (selectedItems.size === 0) return;

    try {
      const { error } = await supabase.rpc('move_preorder_to_collection', {
        p_item_ids: Array.from(selectedItems),
        p_user_id: session?.user?.id
      });

      if (error) throw error;

      toast({
        title: 'Précommandes mises à jour',
        description: 'Les items ont été déplacés vers votre collection',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      setSelectedItems(new Set());
      fetchPreorders();
    } catch (error: any) {
      toast({
        title: 'Erreur lors de la mise à jour',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  }, [selectedItems, session?.user?.id, toast, fetchPreorders]);

  // Supprimer les précommandes sélectionnées
  const handleDelete = useCallback(async () => {
    if (selectedItems.size === 0) return;
    setIsDeleting(true);

    try {
      const { error } = await supabase
        .from('items')
        .delete()
        .eq('user_id', session?.user?.id)
        .in('id', Array.from(selectedItems));

      if (error) throw error;

      toast({
        title: 'Précommandes supprimées',
        description: 'Les précommandes sélectionnées ont été supprimées',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      setSelectedItems(new Set());
      fetchPreorders();
      onDeleteClose();
    } catch (error: any) {
      toast({
        title: 'Erreur lors de la suppression',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsDeleting(false);
    }
  }, [selectedItems, session?.user?.id, toast, fetchPreorders, onDeleteClose]);

  // Nouvelle fonction pour charger les séries et extensions
  const loadSeriesAndExtensions = async () => {
    try {
      const { data: seriesData, error: seriesError } = await supabase
        .from('series')
        .select('*')
        .order('release_year', { ascending: false });

      if (seriesError) throw seriesError;
      setSeries(seriesData || []);

      const { data: extensionsData, error: extensionsError } = await supabase
        .from('extensions')
        .select('*')
        .order('release_date', { ascending: false });

      if (extensionsError) throw extensionsError;
      setExtensions(extensionsData || []);
    } catch (error: any) {
      toast({
        title: 'Erreur lors du chargement des données',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Effet pour filtrer les extensions quand une série est sélectionnée
  useEffect(() => {
    if (newItem.selectedSeriesId) {
      const filtered = extensions.filter(extension => extension.series_id === newItem.selectedSeriesId);
      setFilteredExtensions(filtered);
    } else {
      setFilteredExtensions([]);
    }
  }, [newItem.selectedSeriesId, extensions]);

  // Fonction pour charger les images existantes
  const fetchExistingImages = async () => {
    try {
      if (!session?.user?.id) return;

      const { data: existingItems, error: itemsError } = await supabase
        .from('items')
        .select('sealed_image')
        .eq('user_id', session.user.id)
        .eq('type', 'SCELLE')
        .not('sealed_image', 'is', null);

      if (itemsError) throw itemsError;

      const uniqueImages = new Set(existingItems.map(item => item.sealed_image).filter(Boolean));
      const images: ExistingImage[] = Array.from(uniqueImages).map(imageName => ({
        name: imageName,
        url: `https://odryoxqrsdhsdhfueqqs.supabase.co/storage/v1/object/public/sealed-images/${session.user.id}/${imageName}`
      }));

      setExistingImages(images);
    } catch (error) {
      console.error('Erreur lors du chargement des images:', error);
    }
  };

  // Fonction pour gérer le changement d'image
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Fonction pour sélectionner une image existante
  const handleSelectExistingImage = (imageName: string) => {
    setNewItem(prev => ({
      ...prev,
      sealedImage: imageName
    }));
    setSelectedImage(null);
    setImagePreview(`https://odryoxqrsdhsdhfueqqs.supabase.co/storage/v1/object/public/sealed-images/${session?.user?.id}/${imageName}`);
  };

  // Fonction pour uploader l'image
  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('sealed-images')
      .upload(`${session?.user?.id}/${filePath}`, file);

    if (uploadError) throw uploadError;

    return filePath;
  };

  // Fonction pour charger les détails d'un item à modifier
  const loadItemDetails = async (itemId: string) => {
    try {
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .eq('id', itemId)
        .single();

      if (error) throw error;

      setNewItem({
        itemName: data.item_name || '',
        sealedType: data.sub_type || '',
        purchasePrice: data.purchase_price?.toString() || '',
        purchaseLocation: data.purchase_location || '',
        purchaseDate: data.purchase_date || '',
        expectedDate: data.expected_date || '',
        quantity: data.quantity?.toString() || '1',
        selectedSeriesId: data.series_id,
        selectedExtensionId: data.extension_id,
        sealedImage: data.sealed_image || ''
      });

      if (data.sealed_image) {
        setImagePreview(`https://odryoxqrsdhsdhfueqqs.supabase.co/storage/v1/object/public/sealed-images/${session?.user?.id}/${data.sealed_image}`);
      }

      setIsEditMode(true);
      setEditingItem(itemId);
      onAddOpen();
    } catch (error: any) {
      toast({
        title: 'Erreur lors du chargement des détails',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Modification de la fonction handleAddItem pour gérer l'édition
  const handleAddItem = async () => {
    try {
      setIsLoading(true);

      // Validation de base
      if (!newItem.selectedSeriesId) {
        toast({
          title: 'Erreur',
          description: 'Veuillez sélectionner une série',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        setIsLoading(false);
        return;
      }

      // Validation de l'extension seulement si nécessaire
      if (newItem.sealedType && 
          !SEALED_TYPES_WITHOUT_EXTENSION.includes(newItem.sealedType) && 
          !newItem.selectedExtensionId) {
        toast({
          title: 'Erreur',
          description: 'Veuillez sélectionner une extension',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        setIsLoading(false);
        return;
      }

      if (!session?.user?.id) {
        setIsLoading(false);
        return;
      }

      let imagePath = newItem.sealedImage;
      if (selectedImage) {
        imagePath = await uploadImage(selectedImage);
      }

      const itemData = {
        user_id: session.user.id,
        type: 'SCELLE',
        sub_type: newItem.sealedType,
        item_name: newItem.itemName,
        purchase_price: parseFloat(newItem.purchasePrice),
        purchase_location: newItem.purchaseLocation,
        purchase_date: newItem.purchaseDate,
        quantity: parseInt(newItem.quantity),
        series_id: newItem.selectedSeriesId,
        extension_id: newItem.selectedExtensionId,
        is_preorder: true,
        expected_date: newItem.expectedDate,
        sealed_image: imagePath
      };

      if (isEditMode && editingItem) {
        const { error } = await supabase
          .from('items')
          .update(itemData)
          .eq('id', editingItem);

        if (error) throw error;

        toast({
          title: 'Précommande mise à jour',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        const { error } = await supabase
          .from('items')
          .insert([itemData])
          .select()
          .single();

        if (error) throw error;

        toast({
          title: 'Précommande ajoutée',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }

      // Réinitialiser le formulaire
      setNewItem({
        itemName: '',
        sealedType: '',
        purchasePrice: '',
        purchaseLocation: '',
        purchaseDate: '',
        expectedDate: '',
        quantity: '1',
        selectedSeriesId: null,
        selectedExtensionId: null,
        sealedImage: ''
      });
      setSelectedImage(null);
      setImagePreview('');
      setIsEditMode(false);
      setEditingItem(null);

      onAddClose();
      fetchPreorders();
    } catch (error: any) {
      toast({
        title: 'Erreur lors de l\'ajout',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Charger les séries et extensions au montage
  useEffect(() => {
    if (session?.user?.id) {
      loadSeriesAndExtensions();
    }
  }, [session?.user?.id]);

  // Charger les données au montage
  useEffect(() => {
    if (session?.user?.id) {
      fetchPreorders();
    }
  }, [session?.user?.id, fetchPreorders]);

  // Charger les images existantes au montage
  useEffect(() => {
    if (session?.user?.id) {
      fetchExistingImages();
    }
  }, [session?.user?.id]);

  useEffect(() => {
    filterPreorders();
  }, [preorders, selectedMonth, selectedSeriesId, selectedExtensionId, searchQuery]);

  const filterPreorders = () => {
    let filtered = [...preorders];

    // Filtre par mois sélectionné
    if (selectedMonth) {
      const [selectedYear, selectedMonthNum] = selectedMonth.split('-').map(Number);
      filtered = filtered.filter(preorder => {
        const orderDate = new Date(preorder.type === 'CARTE' ? preorder.card_purchase_date! : preorder.purchase_date!);
        return orderDate.getFullYear() === selectedYear && orderDate.getMonth() === selectedMonthNum - 1;
      });
    }

    // Filtre par série
    if (selectedSeriesId) {
      filtered = filtered.filter(preorder => preorder.series_id === selectedSeriesId);
    }

    // Filtre par extension
    if (selectedExtensionId) {
      filtered = filtered.filter(preorder => preorder.extension_id === selectedExtensionId);
    }

    // Filtre par recherche
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(preorder => 
        (preorder.type === 'CARTE' && preorder.card_name?.toLowerCase().includes(query)) ||
        (preorder.type === 'SCELLE' && preorder.item_name?.toLowerCase().includes(query))
      );
    }

    setFilteredPreorders(filtered);
  };

  // Calcul des KPIs
  const totalPreorders = filteredPreorders.reduce((acc, item) => acc + item.quantity, 0);
  const totalInvestment = filteredPreorders.reduce((acc, item) => {
    const price = item.type === 'CARTE' ? item.card_purchase_price : item.purchase_price;
    return acc + (price || 0) * item.quantity;
  }, 0);
  const totalSealedPreorders = filteredPreorders.filter(item => item.type === 'SCELLE')
    .reduce((acc, item) => acc + item.quantity, 0);
  const totalCardPreorders = filteredPreorders.filter(item => item.type === 'CARTE')
    .reduce((acc, item) => acc + item.quantity, 0);

  return (
    <Box bg={bgColor} minH="100vh">
      <Container maxW="container.xl" py={10}>
        <VStack spacing={6} align="stretch">
          <HStack justify="space-between" align="center" bg={bgCard} p={4} borderRadius="lg" shadow="sm">
            <Heading size="lg" color={textColor}>Mes Précommandes</Heading>
            <Box maxWidth="300px" width="100%">
              <Select
                value={selectedMonth || 'all'}
                onChange={(e) => {
                  const value = e.target.value === 'all' ? null : e.target.value;
                  setSelectedMonth(value);
                }}
                bg={bgCard}
                borderColor={borderColor}
                _hover={{ borderColor: 'blue.400' }}
              >
                <option value="all">Toutes les précommandes</option>
                {Array.from(new Set(preorders.map(preorder => {
                  const date = new Date(preorder.type === 'CARTE' ? preorder.card_purchase_date! : preorder.purchase_date!);
                  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                }))).sort().reverse().map(month => {
                  const [year, monthNum] = month.split('-');
                  const date = new Date(parseInt(year), parseInt(monthNum) - 1);
                  const monthName = date.toLocaleDateString('fr-FR', {
                    month: 'long',
                    year: 'numeric'
                  });
                  return (
                    <option key={month} value={month}>
                      {monthName.charAt(0).toUpperCase() + monthName.slice(1)}
                    </option>
                  );
                })}
              </Select>
            </Box>
          </HStack>

          {/* KPIs */}
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
            <Box p={6} borderRadius="lg" bg={bgCard} borderWidth="1px" borderColor={borderColor} shadow="sm" 
                 _hover={{ shadow: 'md', transform: 'translateY(-2px)', transition: 'all 0.2s' }}>
              <Stat>
                <StatLabel color={secondaryTextColor} fontSize="sm" fontWeight="medium">Investissement Total</StatLabel>
                <StatNumber color="blue.500" fontSize="2xl" fontWeight="bold">
                  {totalInvestment.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                </StatNumber>
              </Stat>
            </Box>

            <Box p={6} borderRadius="lg" bg={bgCard} borderWidth="1px" borderColor={borderColor} shadow="sm"
                 _hover={{ shadow: 'md', transform: 'translateY(-2px)', transition: 'all 0.2s' }}>
              <Stat>
                <StatLabel color={secondaryTextColor} fontSize="sm" fontWeight="medium">Nombre de Précommandes</StatLabel>
                <StatNumber color="purple.500" fontSize="2xl" fontWeight="bold">{totalPreorders}</StatNumber>
              </Stat>
            </Box>

            <Box p={6} borderRadius="lg" bg={bgCard} borderWidth="1px" borderColor={borderColor} shadow="sm"
                 _hover={{ shadow: 'md', transform: 'translateY(-2px)', transition: 'all 0.2s' }}>
              <Stat>
                <StatLabel color={secondaryTextColor} fontSize="sm" fontWeight="medium">Distribution</StatLabel>
                <StatNumber color="green.500" fontSize="2xl" fontWeight="bold">{totalPreorders}</StatNumber>
                <StatHelpText color={secondaryTextColor}>
                  <Badge colorScheme="blue" mr={2}>Scellés: {totalSealedPreorders}</Badge>
                  <Badge colorScheme="purple">Cartes: {totalCardPreorders}</Badge>
                </StatHelpText>
              </Stat>
            </Box>

            <Box p={6} borderRadius="lg" bg={bgCard} borderWidth="1px" borderColor={borderColor} shadow="sm"
                 _hover={{ shadow: 'md', transform: 'translateY(-2px)', transition: 'all 0.2s' }}>
              <Stat>
                <StatLabel color={secondaryTextColor} fontSize="sm" fontWeight="medium">Date de réception moyenne</StatLabel>
                <StatNumber color="orange.500" fontSize="2xl" fontWeight="bold">
                  {filteredPreorders.length > 0 
                    ? new Date(Math.max(...filteredPreorders.map(p => new Date(p.expected_date || '').getTime())))
                        .toLocaleDateString('fr-FR')
                    : '-'}
                </StatNumber>
              </Stat>
            </Box>
          </SimpleGrid>

          {/* Filtres */}
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} bg={bgCard} p={4} borderRadius="lg" shadow="sm">
            <Select
              value={selectedSeriesId?.toString() || ''}
              onChange={(e) => {
                const value = e.target.value ? parseInt(e.target.value) : null;
                setSelectedSeriesId(value);
                setSelectedExtensionId(null);
              }}
              placeholder="Toutes les séries"
              bg={bgColor}
              borderColor={borderColor}
              _hover={{ borderColor: 'blue.400' }}
              color={textColor}
            >
              {series.map(serie => (
                <option key={serie.id} value={serie.id}>
                  {serie.name} ({serie.code})
                </option>
              ))}
            </Select>

            {/* Champ Extension */}
            {selectedSeriesId && (
              <FormControl isRequired={!SEALED_TYPES_WITHOUT_EXTENSION.includes(newItem.sealedType)}>
                <FormLabel>Extension</FormLabel>
                <Select
                  value={selectedExtensionId?.toString() || ''}
                  onChange={(e) => setSelectedExtensionId(e.target.value ? parseInt(e.target.value) : null)}
                  placeholder="Sélectionner une extension"
                  isDisabled={!selectedSeriesId}
                >
                  <option value="">Sélectionner une extension</option>
                  {filteredExtensions.map(extension => (
                    <option key={extension.id} value={extension.id}>
                      {extension.name} ({extension.code})
                    </option>
                  ))}
                </Select>
              </FormControl>
            )}

            <Input
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              bg={bgColor}
              borderColor={borderColor}
              _hover={{ borderColor: 'blue.400' }}
              color={textColor}
            />
          </SimpleGrid>

          <Box bg={bgCard} borderRadius="lg" shadow="sm" p={4}>
            <Flex align="center" mb={4}>
              <ButtonGroup spacing={4}>
                <Tooltip label="Ajouter" hasArrow>
                  <IconButton
                    aria-label="Ajouter"
                    icon={<AddIcon />}
                    colorScheme="blue"
                    onClick={onAddOpen}
                    size="sm"
                    _hover={{ transform: 'translateY(-2px)', shadow: 'md' }}
                    display={{ base: 'flex', md: 'none' }}
                  />
                </Tooltip>
                <Button
                  leftIcon={<AddIcon />}
                  colorScheme="blue"
                  onClick={onAddOpen}
                  size="sm"
                  _hover={{ transform: 'translateY(-2px)', shadow: 'md' }}
                  display={{ base: 'none', md: 'flex' }}
                >
                  Ajouter
                </Button>

                <Tooltip label="Supprimer" hasArrow>
                  <IconButton
                    aria-label="Supprimer"
                    icon={<DeleteIcon />}
                    colorScheme="red"
                    variant="outline"
                    isDisabled={selectedItems.size === 0}
                    onClick={onDeleteOpen}
                    size="sm"
                    _hover={{ transform: 'translateY(-2px)', shadow: 'md' }}
                    display={{ base: 'flex', md: 'none' }}
                  />
                </Tooltip>
                <Button
                  leftIcon={<DeleteIcon />}
                  colorScheme="red"
                  variant="outline"
                  isDisabled={selectedItems.size === 0}
                  onClick={onDeleteOpen}
                  size="sm"
                  _hover={{ transform: 'translateY(-2px)', shadow: 'md' }}
                  display={{ base: 'none', md: 'flex' }}
                >
                  Supprimer
                </Button>

                <Tooltip label="Marquer comme reçu" hasArrow>
                  <IconButton
                    aria-label="Marquer comme reçu"
                    icon={<CheckIcon />}
                    colorScheme="green"
                    isDisabled={selectedItems.size === 0}
                    onClick={handleMarkAsReceived}
                    isLoading={isLoading}
                    size="sm"
                    _hover={{ transform: 'translateY(-2px)', shadow: 'md' }}
                    display={{ base: 'flex', md: 'none' }}
                  />
                </Tooltip>
                <Button
                  leftIcon={<CheckIcon />}
                  colorScheme="green"
                  isDisabled={selectedItems.size === 0}
                  onClick={handleMarkAsReceived}
                  isLoading={isLoading}
                  size="sm"
                  _hover={{ transform: 'translateY(-2px)', shadow: 'md' }}
                  display={{ base: 'none', md: 'flex' }}
                >
                  Marquer comme reçu
                </Button>
              </ButtonGroup>
            </Flex>

            <TableContainer>
              <Table variant="simple">
                <Thead bg={tableHeaderBg}>
                  <Tr>
                    <Th width="50px" borderColor={tableBorderColor}>
                      <Checkbox
                        isChecked={selectedItems.size === preorders.length && preorders.length > 0}
                        isIndeterminate={selectedItems.size > 0 && selectedItems.size < preorders.length}
                        onChange={handleSelectAll}
                        colorScheme="blue"
                      />
                    </Th>
                    <Th width="50px" borderColor={tableBorderColor}>Image</Th>
                    <Th borderColor={tableBorderColor} color={textColor}>Nom</Th>
                    <Th borderColor={tableBorderColor} color={textColor}>Extension</Th>
                    <Th borderColor={tableBorderColor} color={textColor}>Prix</Th>
                    <Th borderColor={tableBorderColor} color={textColor}>Quantité</Th>
                    <Th borderColor={tableBorderColor} color={textColor}>Date de commande</Th>
                    <Th borderColor={tableBorderColor} color={textColor}>Date prévue</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {filteredPreorders.map((item, index) => (
                    <Tr 
                      key={item.id}
                      _hover={{ bg: hoverBgColor, cursor: 'pointer' }}
                      onClick={() => loadItemDetails(item.id)}
                      bg={index % 2 === 0 ? tableStripedBg : 'transparent'}
                    >
                      <Td onClick={(e) => e.stopPropagation()} borderColor={tableBorderColor}>
                        <Checkbox
                          isChecked={selectedItems.has(item.id)}
                          onChange={() => handleItemSelect(item.id)}
                          colorScheme="blue"
                        />
                      </Td>
                      <Td borderColor={tableBorderColor}>
                        <Image
                          src={getImageUrl(item.type, item.type === 'CARTE' ? item.card_image : item.sealed_image, session?.user?.id)}
                          alt={item.type === 'CARTE' ? item.card_name : item.item_name}
                          boxSize="50px"
                          objectFit="contain"
                          fallback={<Box boxSize="50px" bg="gray.100" />}
                        />
                      </Td>
                      <Td borderColor={tableBorderColor} color={textColor}>
                        <Text>{item.type === 'CARTE' ? item.card_name : item.item_name}</Text>
                        {item.type === 'CARTE' && item.language && (
                          <Badge colorScheme={item.language === 'FR' ? 'blue' : 'red'} ml={2}>
                            {item.language}
                          </Badge>
                        )}
                        {item.type === 'SCELLE' && item.sub_type && (
                          <Badge colorScheme="purple" ml={2}>
                            {item.sub_type}
                          </Badge>
                        )}
                      </Td>
                      <Td borderColor={tableBorderColor} color={textColor}>{item.extension_id}</Td>
                      <Td borderColor={tableBorderColor} color={textColor}>
                        {item.type === 'CARTE' 
                          ? `${item.card_purchase_price}€`
                          : `${item.purchase_price}€`
                        }
                      </Td>
                      <Td borderColor={tableBorderColor} color={textColor}>{item.quantity}</Td>
                      <Td borderColor={tableBorderColor} color={textColor}>
                        {item.type === 'CARTE'
                          ? new Date(item.card_purchase_date || '').toLocaleDateString()
                          : new Date(item.purchase_date || '').toLocaleDateString()
                        }
                      </Td>
                      <Td borderColor={tableBorderColor} color={textColor}>
                        {item.expected_date
                          ? new Date(item.expected_date).toLocaleDateString()
                          : '-'
                        }
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          </Box>

          {/* Modal d'ajout/modification de précommande */}
          <Modal isOpen={isAddOpen} onClose={onAddClose} size="xl">
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>{isEditMode ? 'Modifier la précommande' : 'Ajouter une précommande'}</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <VStack spacing={4}>
                  {/* Champ pour l'image */}
                  <FormControl>
                    <FormLabel>Image du produit</FormLabel>
                    <VStack spacing={4}>
                      {imagePreview && (
                        <Image
                          src={imagePreview}
                          alt="Aperçu"
                          maxH="200px"
                          objectFit="contain"
                        />
                      )}
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        display="none"
                        id="image-upload"
                      />
                      <Button as="label" htmlFor="image-upload" cursor="pointer">
                        Choisir une image
                      </Button>
                    </VStack>
                  </FormControl>

                  {/* Sélection d'images existantes */}
                  {existingImages.length > 0 && (
                    <FormControl>
                      <FormLabel>Ou choisir depuis la bibliothèque</FormLabel>
                      <SimpleGrid columns={4} spacing={4} maxH="200px" overflowY="auto">
                        {existingImages.map((img, index) => (
                          <Box
                            key={index}
                            position="relative"
                            cursor="pointer"
                            onClick={() => handleSelectExistingImage(img.name)}
                            borderWidth={newItem.sealedImage === img.name ? 2 : 1}
                            borderColor={newItem.sealedImage === img.name ? 'blue.500' : 'gray.200'}
                            borderRadius="md"
                            p={2}
                          >
                            <Image
                              src={img.url}
                              alt={`Image ${index + 1}`}
                              maxH="100px"
                              objectFit="contain"
                              margin="auto"
                            />
                          </Box>
                        ))}
                      </SimpleGrid>
                    </FormControl>
                  )}

                  <FormControl isRequired>
                    <FormLabel>Nom de l'item</FormLabel>
                    <Input
                      value={newItem.itemName}
                      onChange={(e) => setNewItem({ ...newItem, itemName: e.target.value })}
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Type de produit scellé</FormLabel>
                    <Select
                      value={newItem.sealedType}
                      onChange={(e) => setNewItem({ ...newItem, sealedType: e.target.value })}
                    >
                      <option value="">Sélectionner un type</option>
                      <option value="Elite Trainer Box">Elite Trainer Box</option>
                      <option value="Blister">Blister</option>
                      <option value="Display">Display</option>
                      <option value="Coffret">Coffret</option>
                      <option value="UPC">UPC</option>
                      <option value="Tripack">Tripack</option>
                      <option value="Duopack">Duopack</option>
                      <option value="Bundle">Bundle</option>
                      <option value="Demi display">Demi display</option>
                      <option value="Mini-tins">Mini-tins</option>
                      <option value="Tin cube">Tin cube</option>
                      <option value="Booster en lose">Booster en lose</option>
                      <option value="Artset">Artset</option>
                    </Select>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Série</FormLabel>
                    <Select
                      value={newItem.selectedSeriesId?.toString() || ''}
                      onChange={(e) => setNewItem({
                        ...newItem,
                        selectedSeriesId: e.target.value ? parseInt(e.target.value) : null,
                        selectedExtensionId: null
                      })}
                    >
                      <option value="">Sélectionner une série</option>
                      {series.map(serie => (
                        <option key={serie.id} value={serie.id}>
                          {serie.name} ({serie.code})
                        </option>
                      ))}
                    </Select>
                  </FormControl>

                  {/* Champ Extension */}
                  {newItem.selectedSeriesId && (
                    <FormControl isRequired={!SEALED_TYPES_WITHOUT_EXTENSION.includes(newItem.sealedType)}>
                      <FormLabel>Extension</FormLabel>
                      <Select
                        value={newItem.selectedExtensionId?.toString() || ''}
                        onChange={(e) => setNewItem({
                          ...newItem,
                          selectedExtensionId: e.target.value ? parseInt(e.target.value) : null
                        })}
                        isDisabled={!newItem.selectedSeriesId}
                      >
                        <option value="">Sélectionner une extension</option>
                        {filteredExtensions.map(extension => (
                          <option key={extension.id} value={extension.id}>
                            {extension.name} ({extension.code})
                          </option>
                        ))}
                      </Select>
                    </FormControl>
                  )}

                  <FormControl isRequired>
                    <FormLabel>Prix d'achat</FormLabel>
                    <NumberInput
                      value={newItem.purchasePrice}
                      onChange={(value) => setNewItem({ ...newItem, purchasePrice: value })}
                      min={0}
                      precision={2}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Quantité</FormLabel>
                    <NumberInput
                      value={newItem.quantity}
                      onChange={(value) => setNewItem({ ...newItem, quantity: value })}
                      min={1}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Lieu d'achat</FormLabel>
                    <Input
                      value={newItem.purchaseLocation}
                      onChange={(e) => setNewItem({ ...newItem, purchaseLocation: e.target.value })}
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Date d'achat</FormLabel>
                    <Input
                      type="date"
                      value={newItem.purchaseDate}
                      onChange={(e) => setNewItem({ ...newItem, purchaseDate: e.target.value })}
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Date de réception prévue</FormLabel>
                    <Input
                      type="date"
                      value={newItem.expectedDate}
                      onChange={(e) => setNewItem({ ...newItem, expectedDate: e.target.value })}
                    />
                  </FormControl>
                </VStack>
              </ModalBody>
              <ModalFooter>
                <Button variant="ghost" mr={3} onClick={onAddClose}>
                  Annuler
                </Button>
                <Button 
                  colorScheme="blue" 
                  onClick={handleAddItem}
                  isLoading={isSubmitting}
                  isDisabled={
                    !newItem.itemName ||
                    !newItem.sealedType ||
                    !newItem.purchasePrice ||
                    !newItem.purchaseLocation ||
                    !newItem.purchaseDate ||
                    !newItem.selectedSeriesId
                  }
                >
                  {isEditMode ? 'Modifier' : 'Ajouter'}
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>

          {/* Modal de confirmation de suppression */}
          <Modal isOpen={isDeleteOpen} onClose={onDeleteClose}>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Confirmer la suppression</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                Êtes-vous sûr de vouloir supprimer {selectedItems.size} précommande{selectedItems.size > 1 ? 's' : ''} ?
                Cette action est irréversible.
              </ModalBody>
              <ModalFooter>
                <Button variant="ghost" mr={3} onClick={onDeleteClose}>
                  Annuler
                </Button>
                <Button 
                  colorScheme="red" 
                  onClick={handleDelete}
                  isLoading={isDeleting}
                >
                  Supprimer
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </VStack>
      </Container>
    </Box>
  );
}; 