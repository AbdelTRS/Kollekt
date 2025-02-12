import {
  Box,
  Container,
  Heading,
  VStack,
  HStack,
  Text,
  Input,
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Badge,
  Image,
  useToast,
  IconButton,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  UnorderedList,
  ListItem,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { SalesStats } from '../components/SalesStats';
import { Series, Extension } from '../types/pokemon';
import { DeleteIcon } from '@chakra-ui/icons';

type Sale = {
  id: string;
  item_id: string;
  user_id: string;
  sale_date: string;
  sale_location: string;
  sale_price: number;
  quantity: number;
  type: 'SCELLE' | 'CARTE';
  item_name?: string;
  card_name?: string;
  card_image?: string;
  sealed_image?: string;
  series_id?: number;
  extension_id?: number;
  purchase_price?: number;
  card_purchase_price?: number;
};

export const MySales = () => {
  const { session } = useAuth();
  const toast = useToast();

  // États pour les filtres
  const [itemType, setItemType] = useState<'ALL' | 'SCELLE' | 'CARTE'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [series, setSeries] = useState<Series[]>([]);
  const [extensions, setExtensions] = useState<Extension[]>([]);
  const [filteredExtensions, setFilteredExtensions] = useState<Extension[]>([]);
  const [selectedSeriesId, setSelectedSeriesId] = useState<number | null>(null);
  const [selectedExtensionId, setSelectedExtensionId] = useState<number | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // États pour les données
  const [isLoading, setIsLoading] = useState(true);
  const [sales, setSales] = useState<Sale[]>([]);
  const [filteredSales, setFilteredSales] = useState<Sale[]>([]);

  // États pour le tri
  const [sortField, setSortField] = useState<'date' | 'price' | 'quantity' | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // États pour la suppression
  const [saleToDelete, setSaleToDelete] = useState<Sale | null>(null);
  const { isOpen: isDeleteModalOpen, onOpen: onDeleteModalOpen, onClose: onDeleteModalClose } = useDisclosure();

  // Charger les ventes quand la session change
  useEffect(() => {
    if (session?.user?.id) {
      fetchSales();
      fetchSeriesAndExtensions();
    }
  }, [session?.user?.id]);

  // Filtrer les extensions quand une série est sélectionnée
  useEffect(() => {
    if (selectedSeriesId) {
      const filtered = extensions.filter(extension => extension.series_id === selectedSeriesId);
      setFilteredExtensions(filtered);
    } else {
      setFilteredExtensions(extensions);
    }
  }, [selectedSeriesId, extensions]);

  // Appliquer les filtres quand ils changent
  useEffect(() => {
    filterSales();
  }, [sales, itemType, searchQuery, selectedSeriesId, selectedExtensionId, startDate, endDate, sortField, sortDirection]);

  const fetchSales = async () => {
    try {
      if (!session?.user?.id) return;

      const { data, error } = await supabase
        .from('sales')
        .select(`
          *,
          items (
            type,
            item_name,
            card_name,
            card_image,
            sealed_image,
            series_id,
            extension_id,
            purchase_price,
            card_purchase_price
          )
        `)
        .eq('user_id', session.user.id);

      if (error) throw error;

      const transformedSales: Sale[] = data.map(sale => ({
        ...sale,
        type: sale.items.type,
        item_name: sale.items.item_name,
        card_name: sale.items.card_name,
        card_image: sale.items.card_image,
        sealed_image: sale.items.sealed_image,
        series_id: sale.items.series_id,
        extension_id: sale.items.extension_id,
        purchase_price: sale.items.purchase_price,
        card_purchase_price: sale.items.card_purchase_price
      }));

      setSales(transformedSales);
      setFilteredSales(transformedSales);
    } catch (error: any) {
      toast({
        title: 'Erreur lors du chargement des ventes',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSeriesAndExtensions = async () => {
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

  const filterSales = () => {
    let filtered = [...sales];

    // Filtre par type
    if (itemType !== 'ALL') {
      filtered = filtered.filter(sale => sale.type === itemType);
    }

    // Filtre par série
    if (selectedSeriesId) {
      filtered = filtered.filter(sale => sale.series_id === selectedSeriesId);
    }

    // Filtre par extension
    if (selectedExtensionId) {
      filtered = filtered.filter(sale => sale.extension_id === selectedExtensionId);
    }

    // Filtre par date
    if (startDate) {
      filtered = filtered.filter(sale => sale.sale_date >= startDate);
    }
    if (endDate) {
      filtered = filtered.filter(sale => sale.sale_date <= endDate);
    }

    // Filtre par recherche
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(sale => 
        (sale.type === 'CARTE' && sale.card_name?.toLowerCase().includes(query)) ||
        (sale.type === 'SCELLE' && sale.item_name?.toLowerCase().includes(query)) ||
        sale.sale_location.toLowerCase().includes(query)
      );
    }

    // Appliquer le tri
    if (sortField) {
      filtered.sort((a, b) => {
        let comparison = 0;
        switch (sortField) {
          case 'date':
            comparison = new Date(a.sale_date).getTime() - new Date(b.sale_date).getTime();
            break;
          case 'price':
            comparison = (a.sale_price * a.quantity) - (b.sale_price * b.quantity);
            break;
          case 'quantity':
            comparison = a.quantity - b.quantity;
            break;
        }
        return sortDirection === 'asc' ? comparison : -comparison;
      });
    } else {
      // Tri par défaut : date de vente décroissante
      filtered.sort((a, b) => 
        new Date(b.sale_date).getTime() - new Date(a.sale_date).getTime()
      );
    }

    setFilteredSales(filtered);
  };

  const handleSort = (field: 'date' | 'price' | 'quantity') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleDeleteSale = async () => {
    if (!saleToDelete || !session?.user?.id) return;

    try {
      // 1. Remettre en stock l'item
      const { error: updateError } = await supabase.rpc('restore_sale_stock', {
        p_item_id: saleToDelete.item_id,
        p_quantity: saleToDelete.quantity,
        p_sale_id: saleToDelete.id
      });

      if (updateError) throw updateError;

      // 2. Supprimer la vente
      const { error: deleteError } = await supabase
        .from('sales')
        .delete()
        .eq('id', saleToDelete.id)
        .eq('user_id', session.user.id);

      if (deleteError) throw deleteError;

      toast({
        title: 'Vente supprimée',
        description: 'La vente a été supprimée et les items ont été remis en stock',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // Rafraîchir les données
      await fetchSales();
    } catch (error: any) {
      console.error('Erreur détaillée:', error);
      toast({
        title: 'Erreur lors de la suppression',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setSaleToDelete(null);
      onDeleteModalClose();
    }
  };

  return (
    <Container maxW="container.xl" py={10}>
      <VStack spacing={6} align="stretch">
        <Heading>Mes Ventes</Heading>

        {/* KPIs */}
        <SalesStats sales={filteredSales} />

        {/* Filtres */}
        <VStack spacing={4}>
          <HStack spacing={4} width="100%">
            <Select
              value={itemType}
              onChange={(e) => setItemType(e.target.value as 'ALL' | 'SCELLE' | 'CARTE')}
            >
              <option value="ALL">Tous les types</option>
              <option value="SCELLE">Scellé</option>
              <option value="CARTE">Carte</option>
            </Select>

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

          <HStack spacing={4} width="100%">
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              placeholder="Date de début"
            />
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              placeholder="Date de fin"
            />
          </HStack>
        </VStack>

        {/* Liste des ventes */}
        <TableContainer>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th width="50px">Image</Th>
                <Th>Nom</Th>
                <Th>Extension</Th>
                <Th 
                  sx={{ cursor: 'pointer' }}
                  onClick={() => handleSort('price')}
                >
                  <HStack spacing={1}>
                    <Text>Prix unitaire</Text>
                    {sortField === 'price' && (
                      <Box>{sortDirection === 'asc' ? '▲' : '▼'}</Box>
                    )}
                  </HStack>
                </Th>
                <Th 
                  sx={{ cursor: 'pointer' }}
                  onClick={() => handleSort('quantity')}
                >
                  <HStack spacing={1}>
                    <Text>Quantité</Text>
                    {sortField === 'quantity' && (
                      <Box>{sortDirection === 'asc' ? '▲' : '▼'}</Box>
                    )}
                  </HStack>
                </Th>
                <Th>Montant total</Th>
                <Th 
                  sx={{ cursor: 'pointer' }}
                  onClick={() => handleSort('date')}
                >
                  <HStack spacing={1}>
                    <Text>Date de vente</Text>
                    {sortField === 'date' && (
                      <Box>{sortDirection === 'asc' ? '▲' : '▼'}</Box>
                    )}
                  </HStack>
                </Th>
                <Th>Lieu de vente</Th>
                <Th width="50px">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredSales.map((sale) => (
                <Tr key={sale.id}>
                  <Td>
                    <Image
                      src={sale.type === 'CARTE' 
                        ? sale.card_image 
                        : sale.sealed_image 
                          ? `https://odryoxqrsdhsdhfueqqs.supabase.co/storage/v1/object/public/sealed-images/${session?.user?.id}/${sale.sealed_image}`
                          : undefined
                      }
                      alt={sale.type === 'CARTE' ? sale.card_name : sale.item_name}
                      boxSize="50px"
                      objectFit="contain"
                      fallback={<Box boxSize="50px" bg="gray.100" />}
                    />
                  </Td>
                  <Td>
                    <Text>{sale.type === 'CARTE' ? sale.card_name : sale.item_name}</Text>
                    <Badge colorScheme={sale.type === 'CARTE' ? 'blue' : 'green'}>
                      {sale.type}
                    </Badge>
                  </Td>
                  <Td>
                    {extensions.find(e => e.id === sale.extension_id)?.code || '-'}
                  </Td>
                  <Td>{sale.sale_price.toFixed(2)}€</Td>
                  <Td>{sale.quantity}</Td>
                  <Td>{(sale.sale_price * sale.quantity).toFixed(2)}€</Td>
                  <Td>{new Date(sale.sale_date).toLocaleDateString()}</Td>
                  <Td>{sale.sale_location}</Td>
                  <Td>
                    <IconButton
                      aria-label="Supprimer la vente"
                      icon={<DeleteIcon />}
                      colorScheme="red"
                      size="sm"
                      onClick={() => {
                        setSaleToDelete(sale);
                        onDeleteModalOpen();
                      }}
                    />
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      </VStack>

      {/* Modal de confirmation de suppression */}
      <Modal isOpen={isDeleteModalOpen} onClose={onDeleteModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirmer la suppression</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>
              Êtes-vous sûr de vouloir supprimer cette vente ? Cette action :
            </Text>
            <UnorderedList mt={2}>
              <ListItem>Supprimera l'enregistrement de la vente</ListItem>
              <ListItem>Remettra en stock {saleToDelete?.quantity} exemplaire{saleToDelete?.quantity !== 1 ? 's' : ''}</ListItem>
              <ListItem>Ne peut pas être annulée</ListItem>
            </UnorderedList>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onDeleteModalClose}>
              Annuler
            </Button>
            <Button colorScheme="red" onClick={handleDeleteSale}>
              Confirmer la suppression
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
}; 