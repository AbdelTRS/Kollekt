import {
  Box,
  Container,
  Heading,
  VStack,
  HStack,
  Text,
  Input,
  Select,
  Button,
  useToast,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Checkbox,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  FormControl,
  FormLabel,
  NumberInput,
  NumberInputField,
  Image,
  Badge,
  useDisclosure,
  Flex,
  Spacer,
  IconButton,
  TableContainer,
  Grid,
  SimpleGrid,
  useColorModeValue,
  Card,
  Stat,
  StatLabel,
  StatNumber,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from '@chakra-ui/react';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { CollectionStats } from '../components/CollectionStats';
import { Series, Extension } from '../types/pokemon';
import { EditIcon, DeleteIcon, AddIcon } from '@chakra-ui/icons';

type Item = {
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
  is_purchased?: boolean;
  item_name?: string;
  series_id?: number;
  extension_id?: number;
  market_value?: number;
};

type SaleDetails = {
  sale_date: string;
  sale_location: string;
  sale_price: number;
  quantity: number;
};

type GroupedItem = {
  id: string;
  type: 'SCELLE' | 'CARTE';
  sub_type?: string;
  language?: 'FR' | 'JAP';
  card_name?: string;
  card_image?: string;
  sealed_image?: string;
  total_quantity: number;
  average_price: number;
  item_name?: string;
  series_id?: number;
  extension_id?: number;
  latest_date: number;
  items: Item[];
  market_value?: number;
};

type LabelColor = {
  id: number;
  category: string;
  value: string;
  color: string;
};

// Ajouter cette fonction utilitaire après les imports
const getImageUrl = (type: 'SCELLE' | 'CARTE', image: string | undefined, userId: string | undefined): string | undefined => {
  if (!image) return undefined;
  return type === 'CARTE' 
    ? image 
    : `https://odryoxqrsdhsdhfueqqs.supabase.co/storage/v1/object/public/sealed-images/${userId}/${image}`;
};

export const MyCollection = () => {
  // 1. Hooks de contexte
  const { session } = useAuth();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  // 2. Hooks de thème
  const bgInput = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const modalBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');
  const placeholderColor = useColorModeValue('gray.500', 'gray.400');
  const summaryBg = useColorModeValue('gray.50', 'gray.700');
  const secondaryTextColor = useColorModeValue('gray.500', 'gray.400');
  const quantityTextColor = useColorModeValue('gray.500', 'gray.400');
  const errorTextColor = useColorModeValue('red.500', 'red.300');
  const successTextColor = useColorModeValue('green.500', 'green.300');
  const hoverBgColor = useColorModeValue('gray.100', 'gray.600');

  // 3. États principaux
  const [items, setItems] = useState<Item[]>([]);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [groupedItems, setGroupedItems] = useState<GroupedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 4. États de filtrage
  const [itemType, setItemType] = useState<'ALL' | 'SCELLE' | 'CARTE'>('ALL');
  const [subType, setSubType] = useState('');
  const [language, setLanguage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [series, setSeries] = useState<Series[]>([]);
  const [extensions, setExtensions] = useState<Extension[]>([]);
  const [filteredExtensions, setFilteredExtensions] = useState<Extension[]>([]);
  const [selectedSeriesId, setSelectedSeriesId] = useState<number | null>(null);
  const [selectedExtensionId, setSelectedExtensionId] = useState<number | null>(null);

  // 5. États de sélection
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [selectedGroupedItem, setSelectedGroupedItem] = useState<GroupedItem | null>(null);
  const [totalSoldItems, setTotalSoldItems] = useState(0);
  const [labelColors, setLabelColors] = useState<LabelColor[]>([]);

  // 6. États modaux et édition
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [deleteQuantity, setDeleteQuantity] = useState<number>(1);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Item | null>(null);
  const [showNewPurchaseForm, setShowNewPurchaseForm] = useState(false);

  // 7. États de tri
  const [sortField, setSortField] = useState<'date' | 'price' | 'quantity' | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // 8. États de formulaire
  const [saleDetails, setSaleDetails] = useState<SaleDetails>({
    sale_date: '',
    sale_location: '',
    sale_price: 0,
    quantity: 1,
  });

  const [editingValues, setEditingValues] = useState<{[key: string]: any}>({});
  const [pendingUpdates, setPendingUpdates] = useState<{[key: string]: any}>({});

  const [itemSaleDetails, setItemSaleDetails] = useState<{
    [key: string]: {
      quantity: number;
      maxQuantity: number;
      name: string;
      image: string;
      sale_price: number;
      sale_date: string;
      sale_location: string;
    };
  }>({});

  const [newPurchase, setNewPurchase] = useState({
    quantity: 1,
    purchase_price: '',
    purchase_date: '',
    purchase_location: ''
  });

  // 9. Fonctions utilitaires
  const filterItems = useCallback(() => {
    let filtered = [...items];

    if (itemType !== 'ALL') {
      filtered = filtered.filter(item => item.type === itemType);
    }

    if (selectedSeriesId) {
      filtered = filtered.filter(item => item.series_id === selectedSeriesId);
    }

    if (selectedExtensionId) {
      filtered = filtered.filter(item => item.extension_id === selectedExtensionId);
    }

    if (subType && itemType === 'SCELLE') {
      filtered = filtered.filter(item => item.sub_type === subType);
    }

    if (language && itemType === 'CARTE') {
      filtered = filtered.filter(item => item.language === language);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        (item.type === 'CARTE' && item.card_name?.toLowerCase().includes(query)) ||
        (item.type === 'SCELLE' && item.item_name?.toLowerCase().includes(query))
      );
    }

    setFilteredItems(filtered);
  }, [items, itemType, subType, language, searchQuery, selectedSeriesId, selectedExtensionId]);

  // Fonction pour obtenir la couleur d'une étiquette
  const getLabelColor = useCallback((category: string, value: string): string => {
    const label = labelColors.find(l => l.category === category && l.value === value);
    return label?.color || 'gray';
  }, [labelColors]);

  const groupItems = useCallback((items: Item[]): GroupedItem[] => {
    const groupedMap = new Map<string, Item[]>();

    items.forEach(item => {
      const key = `${item.type}-${item.series_id}-${item.extension_id}-${item.type === 'CARTE' ? item.card_name : item.item_name}`;
      if (!groupedMap.has(key)) {
        groupedMap.set(key, []);
      }
      groupedMap.get(key)?.push(item);
    });

    let grouped = Array.from(groupedMap.entries()).map(([key, items]) => {
      const firstItem = items[0];
      const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
      const totalPrice = items.reduce((sum, item) => {
        const price = item.type === 'CARTE' ? item.card_purchase_price : item.purchase_price;
        return sum + (price || 0) * item.quantity;
      }, 0);
      const averagePrice = totalPrice / totalQuantity;

      const latestDate = items.reduce((latest, item) => {
        const itemDate = item.type === 'CARTE' 
          ? new Date(item.card_purchase_date || '').getTime()
          : new Date(item.purchase_date || '').getTime();
        return Math.max(latest, itemDate);
      }, 0);

      return {
        id: key,
        type: firstItem.type,
        sub_type: firstItem.sub_type,
        language: firstItem.language,
        card_name: firstItem.card_name,
        card_image: firstItem.type === 'CARTE' ? firstItem.card_image : undefined,
        sealed_image: firstItem.type === 'SCELLE' ? firstItem.sealed_image : undefined,
        total_quantity: totalQuantity,
        average_price: averagePrice,
        item_name: firstItem.item_name,
        series_id: firstItem.series_id,
        extension_id: firstItem.extension_id,
        latest_date: latestDate,
        items: items,
        market_value: firstItem.market_value,
      };
    });

    // Appliquer le tri
    if (sortField) {
      grouped.sort((a, b) => {
        let comparison = 0;
        switch (sortField) {
          case 'date':
            comparison = a.latest_date - b.latest_date;
            break;
          case 'price':
            comparison = (a.average_price || 0) - (b.average_price || 0);
            break;
          case 'quantity':
            comparison = a.total_quantity - b.total_quantity;
            break;
        }
        return sortDirection === 'asc' ? comparison : -comparison;
      });
    }

    return grouped;
  }, [sortField, sortDirection]);

  const handleOpenSaleModal = useCallback(() => {
    const selectedItemsDetails: {
      [key: string]: {
        quantity: number;
        maxQuantity: number;
        name: string;
        image: string;
        sale_price: number;
        sale_date: string;
        sale_location: string;
      };
    } = {};

    selectedItems.forEach(groupId => {
      const group = groupedItems.find(g => g.id === groupId);
      if (group) {
        const firstItem = group.items[0];
        const totalQuantity = group.items.reduce((sum, item) => sum + item.quantity, 0);
        
        // Gestion différente des URLs d'images pour les cartes et les items scellés
        let imageUrl = '';
        if (group.type === 'CARTE') {
          imageUrl = group.card_image || '';
        } else {
          imageUrl = group.sealed_image ? 
            `https://odryoxqrsdhsdhfueqqs.supabase.co/storage/v1/object/public/sealed-images/${session?.user?.id}/${group.sealed_image}` 
            : '';
        }

        selectedItemsDetails[firstItem.id] = {
          quantity: 0,
          maxQuantity: totalQuantity,
          name: group.type === 'CARTE' ? group.card_name || '' : group.item_name || '',
          image: imageUrl,
          sale_price: 0,
          sale_date: '',
          sale_location: ''
        };
      }
    });

    setItemSaleDetails(selectedItemsDetails);
    onOpen();
  }, [selectedItems, groupedItems, session?.user?.id, onOpen]);

  const handleSort = useCallback((field: 'date' | 'price' | 'quantity') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  }, [sortField, sortDirection]);

  const handleItemSelect = useCallback((id: string) => {
    const newSelectedItems = new Set(selectedItems);
    if (selectedItems.has(id)) {
      newSelectedItems.delete(id);
    } else {
      newSelectedItems.add(id);
    }
    setSelectedItems(newSelectedItems);
  }, [selectedItems]);

  const handleSelectAll = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const allIds = groupedItems.map(item => item.id);
      setSelectedItems(new Set(allIds));
    } else {
      setSelectedItems(new Set());
    }
  }, [groupedItems]);

  // 10. Effects
  useEffect(() => {
    if (session?.user?.id) {
      fetchItems();
      fetchSalesStats();
    } else {
      setItems([]);
      setFilteredItems([]);
      setGroupedItems([]);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    filterItems();
  }, [filterItems]);

  useEffect(() => {
    const grouped = groupItems(filteredItems);
    setGroupedItems(grouped);
  }, [filteredItems, sortField, sortDirection]);

  useEffect(() => {
    if (selectedSeriesId) {
      const filtered = extensions.filter(extension => extension.series_id === selectedSeriesId);
      setFilteredExtensions(filtered);
    } else {
      setFilteredExtensions(extensions);
    }
  }, [selectedSeriesId, extensions]);

  useEffect(() => {
    loadLabelColors();
  }, []);

  useEffect(() => {
    const loadSeriesAndExtensions = async () => {
      if (session?.user?.id) {
        try {
          // Charger les séries
          const { data: seriesData, error: seriesError } = await supabase
            .from('series')
            .select('*')
            .order('release_year', { ascending: false });

          if (seriesError) throw seriesError;
          setSeries(seriesData || []);

          // Charger les extensions
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
      }
    };

    loadSeriesAndExtensions();
  }, [session?.user?.id, toast]);

  const fetchItems = async () => {
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
          is_purchased,
          item_name,
          series_id,
          extension_id,
          market_value
        `)
        .eq('user_id', session.user.id);

      if (error) throw error;

      setItems(data || []);
      setFilteredItems(data || []);
    } catch (error: any) {
      toast({
        title: 'Erreur lors du chargement des items',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSalesStats = async () => {
    try {
      if (!session?.user?.id) return;

      const { data, error } = await supabase
        .from('sales')
        .select('quantity')
        .eq('user_id', session.user.id);

      if (error) throw error;

      const total = data?.reduce((acc, sale) => acc + sale.quantity, 0) || 0;
      setTotalSoldItems(total);
    } catch (error: any) {
      toast({
        title: 'Erreur lors du chargement des statistiques',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleSaleSubmit = useCallback(async () => {
    if (!session?.user?.id) return;

    try {
      // 1. Validation des entrées
      const invalidSales = Object.entries(itemSaleDetails).some(
        ([_, details]) => !details.sale_price || !details.quantity || !details.sale_date || !details.sale_location
      );

      if (invalidSales) {
        toast({
          title: 'Erreur de validation',
          description: 'Veuillez remplir tous les champs requis pour chaque vente',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      // 2. Traiter chaque vente
      for (const [itemId, details] of Object.entries(itemSaleDetails)) {
        const { error } = await supabase.rpc('process_sale', {
          p_item_id: itemId,
          p_user_id: session.user.id,
          p_sale_date: details.sale_date,
          p_sale_location: details.sale_location,
          p_sale_price: details.sale_price,
          p_quantity: details.quantity
        });

        if (error) throw error;
      }

      // 3. Rafraîchir les données
      await fetchItems();
      await fetchSalesStats();

      toast({
        title: 'Vente enregistrée',
        description: 'La vente a été enregistrée avec succès',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      setSelectedItems(new Set());
      setItemSaleDetails({});
      onClose();

    } catch (error: any) {
      console.error('Erreur complète:', error);
      toast({
        title: 'Erreur lors de l\'enregistrement',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  }, [session?.user?.id, itemSaleDetails, toast, fetchItems, onClose, fetchSalesStats]);

  const handleAddPurchase = useCallback(async () => {
    if (!selectedGroupedItem || !session?.user?.id) return;

    try {
      // Récupérer l'image depuis le premier item qui en a une
      const existingImage = selectedGroupedItem.items.find(item => 
        selectedGroupedItem.type === 'CARTE' 
          ? item.card_image 
          : item.sealed_image
      );

      const fullImageUrl = selectedGroupedItem.type === 'CARTE'
        ? existingImage?.card_image
        : existingImage?.sealed_image;

      if (!fullImageUrl) {
        throw new Error('Aucune image trouvée pour cet item');
      }

      // Extraire le nom du fichier de l'URL complète
      const imageFileName = fullImageUrl.split('/').pop();
      
      if (!imageFileName) {
        throw new Error('Impossible d\'extraire le nom du fichier de l\'image');
      }

      const { error } = await supabase.from('items').insert({
        user_id: session.user.id,
        type: selectedGroupedItem.type,
        sub_type: selectedGroupedItem.sub_type,
        item_name: selectedGroupedItem.item_name,
        card_name: selectedGroupedItem.card_name,
        card_image: selectedGroupedItem.type === 'CARTE' ? imageFileName : undefined,
        sealed_image: selectedGroupedItem.type === 'SCELLE' ? imageFileName : undefined,
        quantity: newPurchase.quantity,
        purchase_price: parseFloat(newPurchase.purchase_price),
        purchase_date: newPurchase.purchase_date,
        purchase_location: newPurchase.purchase_location,
        series_id: selectedGroupedItem.series_id,
        extension_id: selectedGroupedItem.extension_id
      });

      if (error) throw error;

      // Rafraîchir les données
      fetchItems();
      
      // Réinitialiser le formulaire
      setNewPurchase({
        quantity: 1,
        purchase_price: '',
        purchase_date: '',
        purchase_location: ''
      });
      setShowNewPurchaseForm(false);

      toast({
        title: 'Achat ajouté avec succès',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error: any) {
      toast({
        title: 'Erreur lors de l\'ajout',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  }, [selectedGroupedItem, session?.user?.id, newPurchase, fetchItems, toast]);

  // Ajouter cette fonction pour charger les couleurs
  const loadLabelColors = async () => {
    try {
      const { data, error } = await supabase
        .from('label_colors')
        .select('*');

      if (error) throw error;
      setLabelColors(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des couleurs:', error);
    }
  };

  const handleMarketValueUpdate = useCallback(async (itemId: string, value: number) => {
    try {
      const { error } = await supabase
        .from('items')
        .update({ market_value: value })
        .eq('id', itemId);

      if (error) throw error;

      // Mettre à jour les données localement
      const updatedItems = items.map(item => {
        if (item.id === itemId) {
          return { ...item, market_value: value };
        }
        return item;
      });
      setItems(updatedItems);
      
      // Mettre à jour les items filtrés
      setFilteredItems(prevFiltered => 
        prevFiltered.map(item => {
          if (item.id === itemId) {
            return { ...item, market_value: value };
          }
          return item;
        })
      );

      // Mettre à jour les items groupés
      setGroupedItems(prevGrouped => 
        prevGrouped.map(group => {
          const hasItem = group.items.some(item => item.id === itemId);
          if (hasItem) {
            return {
              ...group,
              market_value: value,
              items: group.items.map(item => 
                item.id === itemId ? { ...item, market_value: value } : item
              )
            };
          }
          return group;
        })
      );

      toast({
        title: 'Valeur du marché mise à jour',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error: any) {
      toast({
        title: 'Erreur lors de la mise à jour',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  }, [items, toast]);

  return (
    <Container maxW="container.xl" py={10}>
      <VStack spacing={6} align="stretch">
        <Flex align="center">
          <Heading>Ma Collection</Heading>
          <Spacer />
          <HStack spacing={4}>
            <Button
              colorScheme="red"
              isDisabled={selectedItems.size === 0}
              onClick={async () => {
                const isConfirmed = window.confirm(`Êtes-vous sûr de vouloir supprimer ${selectedItems.size} item${selectedItems.size > 1 ? 's' : ''} ?`);
                if (isConfirmed) {
                  try {
                    const selectedItemsArray = Array.from(selectedItems);
                    const itemsToDelete = selectedItemsArray.flatMap(id => {
                      const groupedItem = groupedItems.find(item => item.id === id);
                      return groupedItem ? groupedItem.items.map(item => item.id) : [];
                    });

                    const { error } = await supabase
                      .from('items')
                      .delete()
                      .in('id', itemsToDelete);

                    if (error) throw error;

                    toast({
                      title: 'Suppression réussie',
                      description: `${selectedItems.size} item${selectedItems.size > 1 ? 's' : ''} supprimé${selectedItems.size > 1 ? 's' : ''}`,
                      status: 'success',
                      duration: 3000,
                      isClosable: true,
                    });

                    setSelectedItems(new Set());
                    fetchItems();
                  } catch (error: any) {
                    toast({
                      title: 'Erreur lors de la suppression',
                      description: error.message,
                      status: 'error',
                      duration: 3000,
                      isClosable: true,
                    });
                  }
                }
              }}
            >
              Supprimer la sélection
            </Button>
            <Button
              colorScheme="green"
              isDisabled={selectedItems.size === 0}
              onClick={handleOpenSaleModal}
            >
              Marquer comme vendu
            </Button>
          </HStack>
        </Flex>

        {/* KPIs */}
        <CollectionStats items={filteredItems} />

        {/* Filtres */}
        <HStack spacing={4}>
          <Select
            value={itemType}
            onChange={(e) => setItemType(e.target.value as 'ALL' | 'SCELLE' | 'CARTE')}
          >
            <option value="ALL">Tous les types</option>
            <option value="SCELLE">Scellé</option>
            <option value="CARTE">Carte</option>
          </Select>

          {itemType === 'SCELLE' && (
            <Select
              value={subType}
              onChange={(e) => setSubType(e.target.value)}
              placeholder="Tous les sous-types"
            >
              <option value="Elite Trainer Box">Elite Trainer Box</option>
              <option value="Blister">Blister</option>
              <option value="Display">Display</option>
              <option value="Coffret">Coffret</option>
              <option value="UPC">UPC</option>
            </Select>
          )}

          {itemType === 'CARTE' && (
            <Select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              placeholder="Toutes les langues"
            >
              <option value="FR">Français</option>
              <option value="JAP">Japonais</option>
            </Select>
          )}

          <Select
            value={selectedSeriesId?.toString() || ''}
            onChange={(e) => {
              const value = e.target.value ? parseInt(e.target.value) : null;
              setSelectedSeriesId(value);
              setSelectedExtensionId(null);
            }}
            placeholder="Toutes les séries"
          >
            {series.map(serie => (
              <option key={serie.id} value={serie.id}>
                {serie.name} ({serie.code})
              </option>
            ))}
          </Select>

          <Select
            value={selectedExtensionId?.toString() || ''}
            onChange={(e) => setSelectedExtensionId(e.target.value ? parseInt(e.target.value) : null)}
            placeholder="Toutes les extensions"
            isDisabled={!selectedSeriesId}
          >
            {filteredExtensions.map(extension => (
              <option key={extension.id} value={extension.id}>
                {extension.name} ({extension.code})
              </option>
            ))}
          </Select>

          <Input
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </HStack>

        {/* Liste des items */}
        <TableContainer>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th width="50px" sx={{ userSelect: 'none' }}>
                  <Checkbox
                    isChecked={selectedItems.size === groupedItems.length}
                    isIndeterminate={selectedItems.size > 0 && selectedItems.size < groupedItems.length}
                    onChange={handleSelectAll}
                  />
                </Th>
                <Th width="50px" sx={{ userSelect: 'none' }}>Image</Th>
                <Th sx={{ userSelect: 'none' }}>Nom</Th>
                <Th sx={{ userSelect: 'none' }}>Extension</Th>
                <Th 
                  sx={{ userSelect: 'none', cursor: 'pointer' }}
                  onClick={() => handleSort('price')}
                >
                  <HStack spacing={1}>
                    <Text>Prix moyen</Text>
                    {sortField === 'price' && (
                      <Box>{sortDirection === 'asc' ? '▲' : '▼'}</Box>
                    )}
                  </HStack>
                </Th>
                <Th 
                  sx={{ userSelect: 'none', cursor: 'pointer' }}
                  onClick={() => handleSort('quantity')}
                >
                  <HStack spacing={1}>
                    <Text>Quantité</Text>
                    {sortField === 'quantity' && (
                      <Box>{sortDirection === 'asc' ? '▲' : '▼'}</Box>
                    )}
                  </HStack>
                </Th>
                <Th 
                  sx={{ userSelect: 'none', cursor: 'pointer' }}
                  onClick={() => handleSort('date')}
                >
                  <HStack spacing={1}>
                    <Text>Date d'achat</Text>
                    {sortField === 'date' && (
                      <Box>{sortDirection === 'asc' ? '▲' : '▼'}</Box>
                    )}
                  </HStack>
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {groupedItems.map((group: GroupedItem) => (
                <Tr 
                  key={group.id} 
                  onClick={(e) => {
                    const target = e.target as HTMLElement;
                    if (target.closest('[role="checkbox"]')) {
                      return;
                    }
                    setSelectedGroupedItem(group);
                    setIsDetailsOpen(true);
                  }}
                  _hover={{ bg: hoverBgColor, cursor: 'pointer' }}
                >
                  <Td sx={{ userSelect: 'none' }} onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      isChecked={selectedItems.has(group.id)}
                      onChange={() => handleItemSelect(group.id)}
                    />
                  </Td>
                  <Td sx={{ userSelect: 'none' }}>
                    <Image
                      src={getImageUrl(group.type, group.type === 'CARTE' ? group.card_image : group.sealed_image, session?.user?.id)}
                      alt={group.type === 'CARTE' ? group.card_name : group.item_name}
                      boxSize="50px"
                      objectFit="contain"
                      fallback={<Box boxSize="50px" bg="gray.100" />}
                      onError={(e) => {
                        console.error('Erreur de chargement de l\'image:', group.type === 'CARTE' ? group.card_image : group.sealed_image);
                      }}
                    />
                  </Td>
                  <Td sx={{ userSelect: 'none' }}>
                    <Text>{group.type === 'CARTE' ? group.card_name : group.item_name}</Text>
                    {group.type === 'CARTE' && group.language && (
                      <Badge 
                        colorScheme={getLabelColor('card_language', group.language)}
                        variant="solid"
                        ml={2}
                      >
                        {group.language}
                      </Badge>
                    )}
                    {group.type === 'SCELLE' && group.sub_type && (
                      <Badge 
                        colorScheme={getLabelColor('sealed_type', group.sub_type)}
                        variant="solid"
                        ml={2}
                      >
                        {group.sub_type}
                      </Badge>
                    )}
                  </Td>
                  <Td sx={{ userSelect: 'none' }}>
                    {extensions.find(e => e.id === group.extension_id)?.code || '-'}
                  </Td>
                  <Td sx={{ userSelect: 'none' }}>
                    {group.average_price > 0 ? `${group.average_price.toFixed(2)}€` : '-'}
                  </Td>
                  <Td sx={{ userSelect: 'none' }}>{group.total_quantity}</Td>
                  <Td sx={{ userSelect: 'none' }}>
                    {new Date(group.latest_date).toLocaleDateString()}
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>

        {/* Modal de détails */}
        <Modal 
          isOpen={isDetailsOpen} 
          onClose={() => {
            setIsDetailsOpen(false);
            setEditingItemId(null);
          }} 
          size="6xl"
        >
          <ModalOverlay />
          <ModalContent maxW="1200px">
            <ModalHeader>
              <Flex align="center" justify="space-between" pr={8}>
                <Text fontSize="2xl">
                  {selectedGroupedItem?.type === 'CARTE' 
                    ? selectedGroupedItem?.card_name 
                    : selectedGroupedItem?.item_name}
                </Text>
                <Button
                  colorScheme="red"
                  size="md"
                  leftIcon={<DeleteIcon />}
                  onClick={async () => {
                    if (!selectedGroupedItem) return;
                    
                    if (window.confirm('Êtes-vous sûr de vouloir supprimer tous les achats de cet item ?')) {
                      try {
                        const { error } = await supabase
                          .from('items')
                          .delete()
                          .in('id', selectedGroupedItem.items.map(item => item.id));
                        
                        if (error) throw error;
                        
                        fetchItems();
                        setIsDetailsOpen(false);
                        
                        toast({
                          title: 'Items supprimés avec succès',
                          status: 'success',
                          duration: 2000,
                          isClosable: true,
                        });
                      } catch (error: any) {
                        toast({
                          title: 'Erreur lors de la suppression',
                          description: error.message,
                          status: 'error',
                          duration: 3000,
                          isClosable: true,
                        });
                      }
                    }
                  }}
                >
                  Supprimer tous les achats
                </Button>
              </Flex>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <VStack spacing={6} align="stretch">
                <HStack spacing={8} align="start">
                  <Box>
                    <Image
                      src={getImageUrl(
                        selectedGroupedItem?.type || 'CARTE',
                        selectedGroupedItem?.type === 'CARTE' ? selectedGroupedItem?.card_image : selectedGroupedItem?.sealed_image,
                        session?.user?.id
                      )}
                      alt="Item"
                      maxH="300px"
                      objectFit="contain"
                    />
                  </Box>
                  <VStack align="start" spacing={4}>
                    <Text fontSize="lg"><strong>Type:</strong> {selectedGroupedItem?.type}</Text>
                    {selectedGroupedItem?.sub_type && (
                      <Text fontSize="lg"><strong>Sous-type:</strong> {selectedGroupedItem.sub_type}</Text>
                    )}
                    <Text fontSize="lg"><strong>Quantité totale:</strong> {selectedGroupedItem?.total_quantity}</Text>
                    <Text fontSize="lg">
                      <strong>Prix moyen:</strong> {
                        selectedGroupedItem?.average_price 
                          ? `${selectedGroupedItem.average_price.toFixed(2)}€` 
                          : '-'
                      }
                    </Text>
                    <HStack spacing={2} width="100%">
                      {editingItemId === 'market_value' ? (
                        <FormControl>
                          <FormLabel>Valeur du marché unitaire</FormLabel>
                          <HStack>
                            <NumberInput
                              value={selectedGroupedItem?.market_value || 0}
                              onChange={(_, value) => {
                                if (selectedGroupedItem) {
                                  setSelectedGroupedItem({
                                    ...selectedGroupedItem,
                                    market_value: value
                                  });
                                }
                              }}
                              min={0}
                              precision={2}
                            >
                              <NumberInputField />
                              <NumberInputStepper>
                                <NumberIncrementStepper />
                                <NumberDecrementStepper />
                              </NumberInputStepper>
                            </NumberInput>
                            <Button
                              colorScheme="green"
                              onClick={() => {
                                if (selectedGroupedItem?.items) {
                                  selectedGroupedItem.items.forEach(item => {
                                    handleMarketValueUpdate(item.id, selectedGroupedItem.market_value || 0);
                                  });
                                }
                                setEditingItemId(null);
                              }}
                            >
                              Valider
                            </Button>
                            <Button
                              variant="ghost"
                              onClick={() => setEditingItemId(null)}
                            >
                              Annuler
                            </Button>
                          </HStack>
                        </FormControl>
                      ) : (
                        <HStack width="100%" justify="space-between">
                          <Text fontSize="lg">
                            <strong>Valeur du marché unitaire:</strong> {
                              selectedGroupedItem?.market_value
                                ? `${selectedGroupedItem.market_value.toFixed(2)}€`
                                : '-'
                            }
                          </Text>
                          <IconButton
                            aria-label="Modifier la valeur du marché"
                            icon={<EditIcon />}
                            size="sm"
                            onClick={() => setEditingItemId('market_value')}
                          />
                        </HStack>
                      )}
                    </HStack>
                    <Text fontSize="lg">
                      <strong>Valeur totale du marché:</strong> {
                        selectedGroupedItem?.market_value && selectedGroupedItem?.total_quantity
                          ? `${(selectedGroupedItem.market_value * selectedGroupedItem.total_quantity).toFixed(2)}€`
                          : '-'
                      }
                    </Text>
                  </VStack>
                </HStack>

                <Heading size="lg" mt={6}>Détails des achats</Heading>
                <Table size="lg">
                  <Thead>
                    <Tr>
                      <Th>Date d'achat</Th>
                      <Th>Prix</Th>
                      <Th>Quantité</Th>
                      <Th>Lieu</Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {selectedGroupedItem?.items.map((item, index) => (
                      <Tr key={index}>
                        <Td>
                          {editingItemId === item.id ? (
                            <Input
                              type="date"
                              size="lg"
                              value={((editingValues[item.id]?.purchase_date || editingValues[item.id]?.card_purchase_date) ?? (item.type === 'SCELLE' ? item.purchase_date : item.card_purchase_date)) || ''}
                              onChange={async (e) => {
                                const newValue = e.target.value;
                                setEditingValues(prev => ({
                                  ...prev,
                                  [item.id]: {
                                    ...prev[item.id],
                                    [item.type === 'SCELLE' ? 'purchase_date' : 'card_purchase_date']: newValue
                                  }
                                }));
                                setPendingUpdates(prev => ({
                                  ...prev,
                                  [item.type === 'SCELLE' ? 'purchase_date' : 'card_purchase_date']: newValue
                                }));
                              }}
                            />
                          ) : (
                            <Text fontSize="md">
                              {item.type === 'SCELLE'
                                ? new Date(item.purchase_date || '').toLocaleDateString()
                                : new Date(item.card_purchase_date || '').toLocaleDateString()}
                            </Text>
                          )}
                        </Td>
                        <Td>
                          {editingItemId === item.id ? (
                            <NumberInput
                              size="lg"
                              value={(editingValues[item.id]?.[item.type === 'SCELLE' ? 'purchase_price' : 'card_purchase_price']) ?? (item.type === 'SCELLE' ? item.purchase_price : item.card_purchase_price)}
                              min={0}
                              onChange={async (valueString) => {
                                const value = parseFloat(valueString);
                                setEditingValues(prev => ({
                                  ...prev,
                                  [item.id]: {
                                    ...prev[item.id],
                                    [item.type === 'SCELLE' ? 'purchase_price' : 'card_purchase_price']: value
                                  }
                                }));
                                setPendingUpdates(prev => ({
                                  ...prev,
                                  [item.type === 'SCELLE' ? 'purchase_price' : 'card_purchase_price']: value
                                }));
                              }}
                            >
                              <NumberInputField />
                            </NumberInput>
                          ) : (
                            <Text fontSize="md">
                              {`${item.type === 'SCELLE' ? item.purchase_price : item.card_purchase_price}€`}
                            </Text>
                          )}
                        </Td>
                        <Td>
                          {editingItemId === item.id ? (
                            <NumberInput
                              size="lg"
                              value={(editingValues[item.id]?.quantity) ?? item.quantity}
                              min={1}
                              onChange={async (valueString) => {
                                const numericValue = parseInt(valueString);
                                setEditingValues(prev => ({
                                  ...prev,
                                  [item.id]: {
                                    ...prev[item.id],
                                    quantity: numericValue
                                  }
                                }));
                                setPendingUpdates(prev => ({
                                  ...prev,
                                  quantity: numericValue
                                }));
                              }}
                            >
                              <NumberInputField />
                            </NumberInput>
                          ) : (
                            <Text fontSize="md">{item.quantity}</Text>
                          )}
                        </Td>
                        <Td>
                          {editingItemId === item.id ? (
                            <Input
                              size="lg"
                              value={(editingValues[item.id]?.[item.type === 'SCELLE' ? 'purchase_location' : 'card_purchase_location']) ?? ((item.type === 'SCELLE' ? item.purchase_location : item.card_purchase_location) || '')}
                              onChange={async (e) => {
                                const newValue = e.target.value;
                                setEditingValues(prev => ({
                                  ...prev,
                                  [item.id]: {
                                    ...prev[item.id],
                                    [item.type === 'SCELLE' ? 'purchase_location' : 'card_purchase_location']: newValue
                                  }
                                }));
                                setPendingUpdates(prev => ({
                                  ...prev,
                                  [item.type === 'SCELLE' ? 'purchase_location' : 'card_purchase_location']: newValue
                                }));
                              }}
                            />
                          ) : (
                            <Text fontSize="md">
                              {item.type === 'SCELLE' ? item.purchase_location : item.card_purchase_location}
                            </Text>
                          )}
                        </Td>
                        <Td>
                          <HStack spacing={2}>
                            <IconButton
                              aria-label="Modifier"
                              icon={<EditIcon />}
                              size="md"
                              colorScheme={editingItemId === item.id ? "green" : "gray"}
                              onClick={async () => {
                                if (editingItemId === item.id) {
                                  try {
                                    // Appliquer toutes les modifications en une seule fois
                                    if (Object.keys(pendingUpdates).length > 0) {
                                      const { error } = await supabase
                                        .from('items')
                                        .update(pendingUpdates)
                                        .eq('id', item.id);
                                      
                                      if (error) throw error;
                                      
                                      // Rafraîchir les données
                                      await fetchItems();
                                      toast({
                                        title: 'Modifications enregistrées',
                                        status: 'success',
                                        duration: 2000,
                                        isClosable: true,
                                      });
                                    }
                                  } catch (error: any) {
                                    toast({
                                      title: 'Erreur lors de la mise à jour',
                                      description: error.message,
                                      status: 'error',
                                      duration: 3000,
                                      isClosable: true,
                                    });
                                  }
                                  
                                  // Réinitialiser l'état
                                  setEditingItemId(null);
                                  setEditingValues({});
                                  setPendingUpdates({});
                                } else {
                                  setEditingItemId(item.id);
                                  setEditingValues(prev => ({
                                    ...prev,
                                    [item.id]: {
                                      purchase_date: item.purchase_date,
                                      card_purchase_date: item.card_purchase_date,
                                      purchase_price: item.purchase_price,
                                      card_purchase_price: item.card_purchase_price,
                                      quantity: item.quantity,
                                      purchase_location: item.purchase_location,
                                      card_purchase_location: item.card_purchase_location
                                    }
                                  }));
                                  setPendingUpdates({});
                                }
                              }}
                            />
                            <IconButton
                              aria-label="Supprimer"
                              icon={<DeleteIcon />}
                              size="md"
                              colorScheme="red"
                              onClick={() => {
                                setItemToDelete(item);
                                setDeleteQuantity(1);
                                setIsDeleteModalOpen(true);
                              }}
                            />
                          </HStack>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>

                <Box mt={6}>
                  <Button
                    leftIcon={<AddIcon />}
                    colorScheme="blue"
                    onClick={() => setShowNewPurchaseForm(!showNewPurchaseForm)}
                    mb={4}
                  >
                    Ajouter un nouvel achat
                  </Button>

                  {showNewPurchaseForm && (
                    <Card p={4} mt={4}>
                      <VStack spacing={4}>
                        <FormControl isRequired>
                          <FormLabel>Quantité</FormLabel>
                          <NumberInput min={1} value={newPurchase.quantity}>
                            <NumberInputField
                              onChange={(e) => setNewPurchase({
                                ...newPurchase,
                                quantity: parseInt(e.target.value) || 1
                              })}
                            />
                          </NumberInput>
                        </FormControl>

                        <FormControl isRequired>
                          <FormLabel>Prix d'achat</FormLabel>
                          <NumberInput>
                            <NumberInputField
                              value={newPurchase.purchase_price}
                              onChange={(e) => setNewPurchase({
                                ...newPurchase,
                                purchase_price: e.target.value
                              })}
                            />
                          </NumberInput>
                        </FormControl>

                        <FormControl isRequired>
                          <FormLabel>Date d'achat</FormLabel>
                          <Input
                            type="date"
                            value={newPurchase.purchase_date}
                            onChange={(e) => setNewPurchase({
                              ...newPurchase,
                              purchase_date: e.target.value
                            })}
                          />
                        </FormControl>

                        <FormControl isRequired>
                          <FormLabel>Lieu d'achat</FormLabel>
                          <Input
                            value={newPurchase.purchase_location}
                            onChange={(e) => setNewPurchase({
                              ...newPurchase,
                              purchase_location: e.target.value
                            })}
                          />
                        </FormControl>

                        <Button
                          colorScheme="blue"
                          onClick={handleAddPurchase}
                          isDisabled={
                            !newPurchase.quantity ||
                            !newPurchase.purchase_price ||
                            !newPurchase.purchase_date ||
                            !newPurchase.purchase_location
                          }
                        >
                          Ajouter l'achat
                        </Button>
                      </VStack>
                    </Card>
                  )}
                </Box>
              </VStack>
            </ModalBody>
          </ModalContent>
        </Modal>

        {/* Modal de confirmation de suppression */}
        <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} isCentered>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Confirmer la suppression</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                <Text>Combien d'exemplaires souhaitez-vous supprimer ?</Text>
                <NumberInput
                  value={deleteQuantity}
                  min={1}
                  max={itemToDelete?.quantity || 1}
                  onChange={(valueString) => setDeleteQuantity(parseInt(valueString))}
                >
                  <NumberInputField />
                </NumberInput>
                <Text fontSize="sm" color={quantityTextColor} mt={1}>
                  Quantité disponible : {itemToDelete?.quantity}
                </Text>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={() => setIsDeleteModalOpen(false)}>
                Annuler
              </Button>
              <Button
                colorScheme="red"
                onClick={async () => {
                  if (!itemToDelete) return;

                  try {
                    if (deleteQuantity >= itemToDelete.quantity) {
                      // Supprimer l'item complètement
                      const { error } = await supabase
                        .from('items')
                        .delete()
                        .eq('id', itemToDelete.id);
                      
                      if (error) throw error;
                    } else {
                      // Mettre à jour la quantité
                      const { error } = await supabase
                        .from('items')
                        .update({ quantity: itemToDelete.quantity - deleteQuantity })
                        .eq('id', itemToDelete.id);
                      
                      if (error) throw error;
                    }
                    
                    fetchItems();
                    setIsDeleteModalOpen(false);
                    
                    if (deleteQuantity >= itemToDelete.quantity && selectedGroupedItem?.items.length === 1) {
                      setIsDetailsOpen(false);
                    }
                    
                    toast({
                      title: 'Suppression effectuée',
                      status: 'success',
                      duration: 2000,
                      isClosable: true,
                    });
                  } catch (error: any) {
                    toast({
                      title: 'Erreur lors de la suppression',
                      description: error.message,
                      status: 'error',
                      duration: 3000,
                      isClosable: true,
                    });
                  }
                }}
              >
                Confirmer la suppression
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Modal de vente */}
        <Modal isOpen={isOpen} onClose={onClose} size="6xl">
          <ModalOverlay />
          <ModalContent bg={modalBg}>
            <ModalHeader color={textColor}>Enregistrer une vente</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={6}>
                <Box width="100%" borderWidth={1} borderRadius="lg" p={4} borderColor={borderColor}>
                  <Text fontSize="lg" fontWeight="bold" mb={4} color={textColor}>Items à vendre</Text>
                  <SimpleGrid columns={1} spacing={6}>
                    {Object.entries(itemSaleDetails).map(([itemId, details]) => (
                      <Box
                        key={itemId}
                        borderWidth={1}
                        borderRadius="lg"
                        p={4}
                        position="relative"
                        borderColor={borderColor}
                        bg={bgInput}
                      >
                        <Grid templateColumns="200px 1fr" gap={6}>
                          <VStack>
                            <Image
                              src={details.image}
                              alt={details.name}
                              maxH="150px"
                              objectFit="contain"
                              fallback={<Box boxSize="150px" bg="gray.100" />}
                              onError={(e) => {
                                console.error('Erreur de chargement de l\'image:', details.image);
                              }}
                            />
                          </VStack>
                          
                          <VStack align="stretch" spacing={4}>
                            <Text fontWeight="bold" fontSize="lg" color={textColor}>
                              {details.name}
                            </Text>
                            
                            <SimpleGrid columns={2} spacing={4}>
                              <FormControl isRequired>
                                <FormLabel color={textColor}>Date de vente</FormLabel>
                                <Input
                                  type="date"
                                  value={details.sale_date}
                                  onChange={(e) => {
                                    setItemSaleDetails(prev => ({
                                      ...prev,
                                      [itemId]: {
                                        ...prev[itemId],
                                        sale_date: e.target.value
                                      }
                                    }));
                                  }}
                                  bg={bgInput}
                                  borderColor={borderColor}
                                  color={textColor}
                                />
                              </FormControl>

                              <FormControl isRequired>
                                <FormLabel color={textColor}>Lieu de vente</FormLabel>
                                <Input
                                  value={details.sale_location}
                                  onChange={(e) => {
                                    setItemSaleDetails(prev => ({
                                      ...prev,
                                      [itemId]: {
                                        ...prev[itemId],
                                        sale_location: e.target.value
                                      }
                                    }));
                                  }}
                                  placeholder="Ex: Vinted, Cardmarket..."
                                  bg={bgInput}
                                  borderColor={borderColor}
                                  color={textColor}
                                  _placeholder={{ color: placeholderColor }}
                                />
                              </FormControl>

                              <FormControl isRequired>
                                <FormLabel color={textColor}>Prix de vente unitaire</FormLabel>
                                <NumberInput
                                  defaultValue={0}
                                  onChange={(valueString) => {
                                    const numericValue = parseFloat(valueString) || 0;
                                    setItemSaleDetails(prev => ({
                                      ...prev,
                                      [itemId]: {
                                        ...prev[itemId],
                                        sale_price: numericValue
                                      }
                                    }));
                                  }}
                                  min={0}
                                  precision={2}
                                >
                                  <NumberInputField
                                    bg={bgInput}
                                    borderColor={borderColor}
                                    color={textColor}
                                    _placeholder={{ color: placeholderColor }}
                                  />
                                </NumberInput>
                              </FormControl>

                              <FormControl isRequired>
                                <FormLabel color={textColor}>Quantité à vendre</FormLabel>
                                <NumberInput
                                  defaultValue={0}
                                  min={1}
                                  max={details.maxQuantity}
                                  onChange={(valueString) => {
                                    const numericValue = parseInt(valueString) || 0;
                                    const validValue = Math.min(Math.max(1, numericValue), details.maxQuantity);
                                    setItemSaleDetails(prev => ({
                                      ...prev,
                                      [itemId]: {
                                        ...prev[itemId],
                                        quantity: validValue
                                      }
                                    }));
                                  }}
                                  keepWithinRange={true}
                                  clampValueOnBlur={true}
                                >
                                  <NumberInputField
                                    bg={bgInput}
                                    borderColor={borderColor}
                                    color={textColor}
                                  />
                                  <NumberInputStepper>
                                    <NumberIncrementStepper />
                                    <NumberDecrementStepper />
                                  </NumberInputStepper>
                                </NumberInput>
                                <Text fontSize="sm" color={quantityTextColor} mt={1}>
                                  Disponible : {details.maxQuantity}
                                </Text>
                              </FormControl>
                            </SimpleGrid>

                            <Box borderWidth={1} borderRadius="md" p={2} bg={summaryBg} borderColor={borderColor}>
                              <Text fontWeight="bold" color={textColor}>
                                Montant total : {(details.quantity * details.sale_price).toFixed(2)}€
                              </Text>
                            </Box>
                          </VStack>
                        </Grid>
                      </Box>
                    ))}
                  </SimpleGrid>
                </Box>

                <Box width="100%" borderWidth={1} borderRadius="lg" p={4} borderColor={borderColor} bg={bgInput}>
                  <Text fontSize="lg" fontWeight="bold" mb={2} color={textColor}>Résumé de la vente</Text>
                  <Text color={textColor}>
                    Total items : {Object.values(itemSaleDetails).reduce((sum, item) => sum + item.quantity, 0)}
                  </Text>
                  <Text color={textColor}>
                    Montant total : {Object.values(itemSaleDetails)
                      .reduce((sum, item) => sum + (item.quantity * item.sale_price), 0)
                        .toFixed(2)}€
                  </Text>
                </Box>
              </VStack>
            </ModalBody>

            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onClose}>
                Annuler
              </Button>
              <Button 
                colorScheme="blue" 
                onClick={handleSaleSubmit}
                isDisabled={Object.values(itemSaleDetails).every(item => item.quantity === 0)}
              >
                Confirmer la vente
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </VStack>
    </Container>
  );
}; 