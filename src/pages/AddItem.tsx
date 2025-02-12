import {
  Box,
  Button,
  ButtonGroup,
  Card,
  CardBody,
  Container,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  GridItem,
  HStack,
  Heading,
  IconButton,
  Image,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  NumberInput,
  NumberInputField,
  Radio,
  RadioGroup,
  Select,
  SimpleGrid,
  Stack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  VStack,
  useDisclosure,
  useToast,
  Spacer,
  useColorModeValue,
} from '@chakra-ui/react';
import { CloseIcon, AddIcon } from '@chakra-ui/icons';
import { useState, useEffect } from 'react';
import { debounce } from 'lodash';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Series, Extension, Item } from '../types/pokemon';
import { useDisclosure as useGalleryDisclosure } from '@chakra-ui/react';

type CardSearchResult = {
  id: string;
  name: string;
  image: string;
  cardNumber?: string;
};

interface SealedItem extends Omit<Item, 'id' | 'type'> {
  type: 'SCELLE';
  sub_type: string;
  item_name: string;
  purchase_price: number;
  purchase_date: string;
  purchase_location: string;
  sealed_image?: string;
  quantity: number;
  series_id?: number;
  extension_id?: number;
}

interface CardItem extends Omit<Item, 'id' | 'type'> {
  type: 'CARTE';
  language: 'FR' | 'JAP';
  card_name: string;
  card_image: string;
  card_number?: string;
  quantity: number;
  is_purchased: boolean;
  card_purchase_price?: number;
  card_purchase_date?: string;
  card_purchase_location?: string;
  series_id?: number;
  extension_id?: number;
}

interface SealedFormData {
  id: string;
  sealedType: string;
  itemName: string;
  purchasePrice: string;
  purchaseLocation: string;
  purchaseDate: string;
  sealedImage: File | null;
  sealedImagePreview: string;
  quantity: string;
  selectedSeriesId: number | null;
  selectedExtensionId: number | null;
}

interface CardFormData {
  id: string;
  cardName: string;
  cardNumber: string;
  cardImage: File | null;
  cardImagePreview: string;
  isPurchased: string;
  cardPurchasePrice: string;
  cardPurchaseDate: string;
  cardPurchaseLocation: string;
  quantity: string;
  selectedSeriesId: number | null;
  selectedExtensionId: number | null;
}

/* @ts-ignore */
export const AddItem = () => {
  const { session } = useAuth();
  const toast = useToast();
  const { isOpen: isGalleryOpen, onOpen: onGalleryOpen, onClose: onGalleryClose } = useDisclosure();
  const [galleryType, setGalleryType] = useState<'SCELLE' | 'CARTE'>('SCELLE');
  const [currentFormId, setCurrentFormId] = useState<string>('');
  const [existingImages, setExistingImages] = useState<{
    id: string;
    type: 'SCELLE' | 'CARTE';
    image_url: string;
    file_name?: string;
  }[]>([]);

  // États pour les items à ajouter
  const [sealedItems, setSealedItems] = useState<SealedItem[]>([]);
  const [cardItems, setCardItems] = useState<CardItem[]>([]);

  // États pour le formulaire modal
  const [sealedType, setSealedType] = useState('');
  const [itemName, setItemName] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [purchaseLocation, setPurchaseLocation] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [sealedImage, setSealedImage] = useState<File | null>(null);
  const [sealedImagePreview, setSealedImagePreview] = useState<string>('');
  const [quantity, setQuantity] = useState('1');

  // États pour les séries et extensions
  const [series, setSeries] = useState<Series[]>([]);
  const [extensions, setExtensions] = useState<Extension[]>([]);
  const [filteredExtensions, setFilteredExtensions] = useState<Extension[]>([]);
  const [selectedSeriesId, setSelectedSeriesId] = useState<number | null>(null);
  const [selectedExtensionId, setSelectedExtensionId] = useState<number | null>(null);

  // États pour les cartes
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardImage, setCardImage] = useState<File | null>(null);
  const [cardImagePreview, setCardImagePreview] = useState<string>('');
  const [isPurchased, setIsPurchased] = useState('yes');
  const [cardPurchasePrice, setCardPurchasePrice] = useState('');
  const [cardPurchaseDate, setCardPurchaseDate] = useState('');
  const [cardPurchaseLocation, setCardPurchaseLocation] = useState('');
  const [searchResults, setSearchResults] = useState<CardSearchResult[]>([]);
  const [selectedCard, setSelectedCard] = useState<CardSearchResult | null>(null);

  // États pour la recherche
  const [isLoading, setIsLoading] = useState(false);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  // États pour la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const cardsPerPage = 12;

  // Ajouter ces états pour gérer les multiples formulaires
  const [sealedForms, setSealedForms] = useState<SealedFormData[]>([{
    id: '1',
    sealedType: '',
    itemName: '',
    purchasePrice: '',
    purchaseLocation: '',
    purchaseDate: '',
    sealedImage: null,
    sealedImagePreview: '',
    quantity: '1',
    selectedSeriesId: null,
    selectedExtensionId: null,
  }]);

  const [cardForms, setCardForms] = useState<CardFormData[]>([{
    id: '1',
    cardName: '',
    cardNumber: '',
    cardImage: null,
    cardImagePreview: '',
    isPurchased: 'yes',
    cardPurchasePrice: '',
    cardPurchaseDate: '',
    cardPurchaseLocation: '',
    quantity: '1',
    selectedSeriesId: null,
    selectedExtensionId: null,
  }]);

  // Fonction pour charger les séries au montage du composant
  useEffect(() => {
    const loadSeries = async () => {
      try {
        const { data, error } = await supabase
          .from('series')
          .select('*')
          .order('release_year', { ascending: false });

        if (error) throw error;
        setSeries(data || []);
      } catch (error) {
        console.error('Erreur lors du chargement des séries:', error);
        toast({
          title: 'Erreur',
          description: 'Impossible de charger les séries',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    };

    loadSeries();
  }, []);

  // Fonction pour charger les extensions au montage du composant
  useEffect(() => {
    const loadExtensions = async () => {
      try {
        const { data, error } = await supabase
          .from('extensions')
          .select('*')
          .order('release_date', { ascending: false });

        if (error) throw error;
        setExtensions(data || []);
      } catch (error) {
        console.error('Erreur lors du chargement des extensions:', error);
        toast({
          title: 'Erreur',
          description: 'Impossible de charger les extensions',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    };

    loadExtensions();
  }, []);

  // Fonction pour filtrer les extensions en fonction de la série sélectionnée
  useEffect(() => {
    if (selectedSeriesId) {
      const filtered = extensions.filter((extension: Extension) => extension.series_id === selectedSeriesId);
      setFilteredExtensions(filtered);
    } else {
      setFilteredExtensions(extensions);
    }
  }, [selectedSeriesId, extensions]);

  // Fonction pour charger les cartes d'un set
  const loadSetCards = async (setId: string) => {
    try {
      const response = await fetch(`https://api.tcgdex.net/v2/fr/sets/${setId}/cards`);
      const cards = await response.json();
      return cards;
    } catch (error) {
      console.error(`Erreur lors du chargement des cartes du set ${setId}:`, error);
      return [];
    }
  };

  // Fonction de recherche de carte avec l'API TCGdex
  const searchCard = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      let allCards: CardSearchResult[] = [];

      // Si une extension est sélectionnée, chercher uniquement dans cette extension
      const extensionsToSearch = selectedExtensionId 
        ? extensions.filter((ext: Extension) => ext.id === selectedExtensionId)
        : selectedSeriesId
          ? filteredExtensions
          : extensions;

      for (const extension of extensionsToSearch) {
        try {
          // Trouver la série correspondante
          const serie = series.find(s => s.id === extension.series_id);
          if (!serie) continue;

          // Construire l'URL de l'API avec le bon format
          const apiUrl = `https://api.tcgdex.net/v2/fr/sets/${serie.code.toLowerCase()}/${extension.code}/cards`;
          console.log('Tentative d\'appel API:', apiUrl);

          const cardsResponse = await fetch(apiUrl);
          if (!cardsResponse.ok) {
            console.error(`Erreur HTTP ${cardsResponse.status} pour l'extension ${extension.code}`);
            continue;
          }
          
          const extensionData = await cardsResponse.json();
          if (!extensionData.cards) continue;

          const matchingCards = extensionData.cards
            .filter((card: any) => 
              card.name.toLowerCase().includes(query.toLowerCase())
            )
            .map((card: any) => ({
              id: `${extension.id}-${card.localId}`,
              name: card.name,
              image: `https://assets.tcgdex.net/fr/${serie.code.toLowerCase()}/${extension.code}/${card.localId}/high.webp`,
              cardNumber: card.number,
            }));

          allCards = [...allCards, ...matchingCards];
        } catch (error) {
          console.error(`Erreur lors de la recherche dans l'extension ${extension.code}:`, error);
        }
      }

      // Trier les résultats par pertinence (correspondance exacte en premier)
      const sortedCards = allCards.sort((a, b) => {
        const aExactMatch = a.name.toLowerCase() === query.toLowerCase();
        const bExactMatch = b.name.toLowerCase() === query.toLowerCase();
        if (aExactMatch && !bExactMatch) return -1;
        if (!aExactMatch && bExactMatch) return 1;
        return a.name.localeCompare(b.name);
      });

      setSearchResults(sortedCards);
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      toast({
        title: 'Erreur de recherche',
        description: 'Impossible de récupérer les cartes. Veuillez réessayer.',
        status: 'error',
        duration: 500,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Debounce la fonction de recherche avec un délai plus long (3 secondes)
  const debouncedSearch = debounce(searchCard, 1500);

  // Gestionnaire de changement pour la recherche de carte
  const handleCardSearch = (value: string) => {
    setCardName(value);
    if (value.length >= 4) { // Augmentation du minimum de caractères à 4
      setIsLoading(true);
      debouncedSearch(value);
    } else {
      setSearchResults([]);
      setIsLoading(false);
      debouncedSearch.cancel();
    }
  };

  // Nettoyer le debounce lors du démontage du composant
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, []);

  // Fonction pour supprimer une image existante
  const deleteImage = async (imagePath: string) => {
    try {
      const fileName = imagePath.split('/').pop();
      if (!fileName) return;

      const { error } = await supabase.storage
        .from('sealed-images')
        .remove([`${session?.user.id}/${fileName}`]);

      if (error) throw error;

      setSealedImage(null);
      setSealedImagePreview('');
      
      toast({
        title: 'Image supprimée avec succès',
        status: 'success',
        duration: 3000,
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
  };

  // Fonction pour gérer l'upload d'image
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Vérifier la taille du fichier (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'Fichier trop volumineux',
          description: 'La taille maximum autorisée est de 5MB',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      // Vérifier le type de fichier
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Type de fichier non autorisé',
          description: 'Seules les images sont autorisées',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      setSealedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSealedImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Fonction pour gérer l'upload d'image de carte
  const handleCardImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Vérifier la taille du fichier (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'Fichier trop volumineux',
          description: 'La taille maximum autorisée est de 5MB',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      // Vérifier le type de fichier
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Type de fichier non autorisé',
          description: 'Seules les images sont autorisées',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      setCardImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCardImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Fonction pour ajouter un nouveau formulaire scellé
  const addSealedForm = () => {
    setSealedForms([...sealedForms, {
      id: Date.now().toString(),
      sealedType: '',
      itemName: '',
      purchasePrice: '',
      purchaseLocation: '',
      purchaseDate: '',
      sealedImage: null,
      sealedImagePreview: '',
      quantity: '1',
      selectedSeriesId: null,
      selectedExtensionId: null,
    }]);
  };

  // Fonction pour supprimer un formulaire scellé
  const removeSealedForm = (id: string) => {
    if (sealedForms.length > 1) {
      setSealedForms(sealedForms.filter(form => form.id !== id));
    }
  };

  // Fonction pour ajouter un nouveau formulaire carte
  const addCardForm = () => {
    setCardForms([...cardForms, {
      id: Date.now().toString(),
      cardName: '',
      cardNumber: '',
      cardImage: null,
      cardImagePreview: '',
      isPurchased: 'yes',
      cardPurchasePrice: '',
      cardPurchaseDate: '',
      cardPurchaseLocation: '',
      quantity: '1',
      selectedSeriesId: null,
      selectedExtensionId: null,
    }]);
  };

  // Fonction pour supprimer un formulaire carte
  const removeCardForm = (id: string) => {
    if (cardForms.length > 1) {
      setCardForms(cardForms.filter(form => form.id !== id));
    }
  };

  // Modifier la fonction handleSealedSubmit
  const handleSealedSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      for (const form of sealedForms) {
        if (!form.selectedSeriesId || !form.selectedExtensionId) {
          toast({
            title: "Erreur",
            description: "Veuillez sélectionner une série et une extension pour tous les produits",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
          setIsLoading(false);
          return;
        }

        let fileName = null;
        
        if (form.sealedImage) {
          try {
            const fileExt = form.sealedImage.name.split('.').pop();
            fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${session?.user.id}/${fileName}`;

            const { error: uploadError } = await supabase.storage
              .from('sealed-images')
              .upload(filePath, form.sealedImage);

            if (uploadError) throw uploadError;
          } catch (uploadError: any) {
            throw new Error('Erreur lors de l\'upload de l\'image: ' + uploadError.message);
          }
        } else if (form.sealedImagePreview) {
          fileName = form.sealedImagePreview.split('/').pop();
        }

        const { error } = await supabase.from('items').insert([{
          user_id: session?.user.id,
          type: 'SCELLE',
          sub_type: form.sealedType,
          item_name: form.itemName,
          purchase_price: parseFloat(form.purchasePrice),
          purchase_date: form.purchaseDate,
          purchase_location: form.purchaseLocation,
          quantity: parseInt(form.quantity),
          series_id: form.selectedSeriesId,
          extension_id: form.selectedExtensionId,
          sealed_image: fileName
        }]);

        if (error) throw error;
      }

      toast({
        title: "Succès",
        description: "Items scellés ajoutés avec succès",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // Réinitialiser les formulaires
      setSealedForms([{
        id: '1',
        sealedType: '',
        itemName: '',
        purchasePrice: '',
        purchaseLocation: '',
        purchaseDate: '',
        sealedImage: null,
        sealedImagePreview: '',
        quantity: '1',
        selectedSeriesId: null,
        selectedExtensionId: null,
      }]);
      
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour uploader l'image vers Supabase Storage
  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${session?.user.id}/${fileName}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from('sealed-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('sealed-images')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error: any) {
      throw new Error('Erreur lors de l\'upload de l\'image');
    }
  };

  // Modifier la fonction handleCardSubmit de manière similaire
  const handleCardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      for (const form of cardForms) {
        if (!form.cardImage || !form.cardName || !form.selectedSeriesId || !form.selectedExtensionId) {
          toast({
            title: 'Erreur',
            description: 'Veuillez remplir tous les champs obligatoires pour toutes les cartes',
            status: 'error',
            duration: 3000,
            isClosable: true,
          });
          setIsLoading(false);
          return;
        }

        const imageUrl = await uploadImage(form.cardImage);

        const cardData = {
          user_id: session?.user.id,
          type: 'CARTE' as const,
          language: 'FR' as const,
          card_name: form.cardName,
          card_number: form.cardNumber || null,
          card_image: imageUrl,
          quantity: parseInt(form.quantity),
          is_purchased: form.isPurchased === 'no',
          series_id: form.selectedSeriesId,
          extension_id: form.selectedExtensionId
        };

        if (form.isPurchased === 'no') {
          if (!form.cardPurchasePrice || !form.cardPurchaseDate || !form.cardPurchaseLocation) {
            toast({
              title: 'Erreur de validation',
              description: 'Veuillez remplir tous les champs d\'achat',
              status: 'error',
              duration: 3000,
              isClosable: true,
            });
            return;
          }

          Object.assign(cardData, {
            card_purchase_price: parseFloat(form.cardPurchasePrice),
            card_purchase_date: form.cardPurchaseDate,
            card_purchase_location: form.cardPurchaseLocation
          });
        }

        const { error } = await supabase
          .from('items')
          .insert([cardData]);

        if (error) throw error;
      }

      toast({
        title: 'Cartes ajoutées avec succès',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // Réinitialiser les formulaires
      setCardForms([{
        id: '1',
        cardName: '',
        cardNumber: '',
        cardImage: null,
        cardImagePreview: '',
        isPurchased: 'yes',
        cardPurchasePrice: '',
        cardPurchaseDate: '',
        cardPurchaseLocation: '',
        quantity: '1',
        selectedSeriesId: null,
        selectedExtensionId: null,
      }]);

    } catch (error: any) {
      console.error('Erreur complète:', error);
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

  // Calculer les cartes à afficher pour la page courante
  const indexOfLastCard = currentPage * cardsPerPage;
  const indexOfFirstCard = indexOfLastCard - cardsPerPage;
  const currentCards = searchResults.slice(indexOfFirstCard, indexOfLastCard);
  const totalPages = Math.ceil(searchResults.length / cardsPerPage);

  // Fonction pour changer de page
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  // Réinitialiser la page courante quand les résultats changent
  useEffect(() => {
    setCurrentPage(1);
  }, [searchResults]);

  useEffect(() => {
    const fetchExistingImages = async () => {
      if (!session?.user?.id) return;

      try {
        const { data, error } = await supabase
          .from('items')
          .select('id, type, sealed_image, card_image')
          .eq('user_id', session.user.id);

        if (error) throw error;

        // Créer un Set pour stocker les noms de fichiers uniques
        const uniqueImages = new Set();
        
        const images = data
          .filter(item => item.sealed_image || item.card_image)
          .reduce<Array<{
            id: string;
            type: 'SCELLE' | 'CARTE';
            image_url: string;
            file_name?: string;
          }>>((acc, item) => {
            const imageKey = item.type === 'SCELLE' ? item.sealed_image : item.card_image;
            
            // Si l'image n'a pas déjà été ajoutée
            if (!uniqueImages.has(imageKey)) {
              uniqueImages.add(imageKey);
              acc.push({
                id: item.id,
                type: item.type as 'SCELLE' | 'CARTE',
                image_url: item.type === 'SCELLE' 
                  ? `https://odryoxqrsdhsdhfueqqs.supabase.co/storage/v1/object/public/sealed-images/${session.user.id}/${item.sealed_image}`
                  : item.card_image || '',
                file_name: item.type === 'SCELLE' ? item.sealed_image : undefined
              });
            }
            return acc;
          }, []);

        setExistingImages(images);
      } catch (error: any) {
        console.error('Erreur lors du chargement des images:', error);
      }
    };

    fetchExistingImages();
  }, [session?.user?.id]);

  const handleSelectExistingImage = (imageUrl: string, fileName?: string) => {
    if (galleryType === 'SCELLE') {
      updateSealedForm(currentFormId, 'sealedImagePreview', imageUrl);
      if (fileName) {
        updateSealedForm(currentFormId, 'sealedImage', null);
      }
    } else {
      updateCardForm(currentFormId, 'cardImagePreview', imageUrl);
      updateCardForm(currentFormId, 'cardImage', null);
    }
    onGalleryClose();
  };

  // Ajouter ces fonctions pour gérer les changements dans les formulaires
  const updateSealedForm = (id: string, field: keyof SealedFormData, value: any) => {
    setSealedForms(forms => forms.map(form => 
      form.id === id ? { ...form, [field]: value } : form
    ));
  };

  const updateCardForm = (id: string, field: keyof CardFormData, value: any) => {
    setCardForms(forms => forms.map(form => 
      form.id === id ? { ...form, [field]: value } : form
    ));
  };

  return (
    <Container maxW="container.xl" py={10}>
      <VStack spacing={6} align="stretch">
        <Flex align="center" mb={4}>
          <Heading>Ajouter un item</Heading>
          <Spacer />
        </Flex>

        <Box bg={useColorModeValue('white', 'gray.800')} borderRadius="lg" shadow="sm" overflow="hidden">
          <Tabs isFitted variant="unstyled">
            <TabList 
              bg={useColorModeValue('gray.50', 'gray.900')} 
              borderRadius="xl" 
              p={2} 
              gap={4}
            >
              <Tab
                fontSize="lg"
                fontWeight="bold"
                py={4}
                borderRadius="lg"
                _selected={{
                  color: useColorModeValue('blue.600', 'blue.200'),
                  bg: useColorModeValue('white', 'gray.800'),
                  boxShadow: 'md',
                  transform: 'scale(1.02)',
                }}
                _hover={{
                  color: useColorModeValue('blue.500', 'blue.300'),
                  bg: useColorModeValue('gray.100', 'gray.700'),
                }}
                transition="all 0.2s"
              >
                SCELLE
              </Tab>
              <Tab
                fontSize="lg"
                fontWeight="bold"
                py={4}
                borderRadius="lg"
                _selected={{
                  color: useColorModeValue('blue.600', 'blue.200'),
                  bg: useColorModeValue('white', 'gray.800'),
                  boxShadow: 'md',
                  transform: 'scale(1.02)',
                }}
                _hover={{
                  color: useColorModeValue('blue.500', 'blue.300'),
                  bg: useColorModeValue('gray.100', 'gray.700'),
                }}
                transition="all 0.2s"
              >
                CARTES
              </Tab>
            </TabList>

            <TabPanels>
              {/* Panneau SCELLE */}
              <TabPanel p={6}>
                <form onSubmit={handleSealedSubmit}>
                  <VStack spacing={6} align="stretch">
                    <SimpleGrid columns={{ base: 1, lg: sealedForms.length > 1 ? 2 : 1 }} spacing={6}>
                      {sealedForms.map((form) => (
                        <Box 
                          key={form.id}
                          position="relative"
                          p={4}
                          borderWidth="1px"
                          borderRadius="lg"
                          borderColor={useColorModeValue('gray.200', 'gray.600')}
                        >
                          {sealedForms.length > 1 && (
                            <IconButton
                              icon={<CloseIcon />}
                              aria-label="Supprimer le formulaire"
                              position="absolute"
                              right={2}
                              top={2}
                              colorScheme="red"
                              size="sm"
                              zIndex={2}
                              onClick={() => removeSealedForm(form.id)}
                            />
                          )}
                          <SimpleGrid columns={1} spacing={6} width="100%">
                            <Card bg={useColorModeValue('white', 'gray.700')} borderColor={useColorModeValue('gray.200', 'gray.600')} width="100%">
                              <CardBody>
                                <VStack spacing={4}>
                                  <FormControl isRequired>
                                    <FormLabel fontWeight="bold">Série</FormLabel>
                                    <Select
                                      size="lg"
                                      value={form.selectedSeriesId?.toString() || ''}
                                      onChange={(e) => updateSealedForm(form.id, 'selectedSeriesId', e.target.value ? parseInt(e.target.value) : null)}
                                      placeholder="Sélectionner une série"
                                    >
                                      {series.map((serie) => (
                                        <option key={serie.id} value={serie.id}>
                                          {serie.name} ({serie.code})
                                        </option>
                                      ))}
                                    </Select>
                                  </FormControl>

                                  <FormControl isRequired>
                                    <FormLabel fontWeight="bold">Extension</FormLabel>
                                    <Select
                                      size="lg"
                                      value={form.selectedExtensionId?.toString() || ''}
                                      onChange={(e) => updateSealedForm(form.id, 'selectedExtensionId', e.target.value ? parseInt(e.target.value) : null)}
                                      placeholder="Sélectionner une extension"
                                      isDisabled={!form.selectedSeriesId}
                                    >
                                      {filteredExtensions.map((extension) => (
                                        <option key={extension.id} value={extension.id}>
                                          {extension.name} ({extension.code})
                                        </option>
                                      ))}
                                    </Select>
                                  </FormControl>

                                  <FormControl isRequired>
                                    <FormLabel fontWeight="bold">Type</FormLabel>
                                    <Select
                                      size="lg"
                                      value={form.sealedType}
                                      onChange={(e) => updateSealedForm(form.id, 'sealedType', e.target.value)}
                                      placeholder="Sélectionner un type"
                                    >
                                      <option value="Elite Trainer Box">Elite Trainer Box</option>
                                      <option value="Blister">Blister</option>
                                      <option value="Display">Display</option>
                                      <option value="Coffret">Coffret</option>
                                      <option value="UPC">UPC</option>
                                    </Select>
                                  </FormControl>

                                  <FormControl isRequired>
                                    <FormLabel fontWeight="bold">Nom de l'item</FormLabel>
                                    <Input
                                      size="lg"
                                      value={form.itemName}
                                      onChange={(e) => updateSealedForm(form.id, 'itemName', e.target.value)}
                                      placeholder="Nom du produit scellé..."
                                    />
                                  </FormControl>

                                  <FormControl isRequired>
                                    <FormLabel fontWeight="bold">Prix d'achat</FormLabel>
                                    <NumberInput min={0} size="lg">
                                      <NumberInputField
                                        value={form.purchasePrice}
                                        onChange={(e) => updateSealedForm(form.id, 'purchasePrice', e.target.value)}
                                      />
                                    </NumberInput>
                                  </FormControl>

                                  <FormControl isRequired>
                                    <FormLabel fontWeight="bold">Quantité</FormLabel>
                                    <NumberInput min={1} value={form.quantity} size="lg">
                                      <NumberInputField
                                        onChange={(e) => updateSealedForm(form.id, 'quantity', e.target.value)}
                                      />
                                    </NumberInput>
                                  </FormControl>

                                  <FormControl isRequired>
                                    <FormLabel fontWeight="bold">Date d'achat</FormLabel>
                                    <Input
                                      size="lg"
                                      type="date"
                                      value={form.purchaseDate}
                                      onChange={(e) => updateSealedForm(form.id, 'purchaseDate', e.target.value)}
                                    />
                                  </FormControl>

                                  <FormControl isRequired>
                                    <FormLabel fontWeight="bold">Lieu d'achat</FormLabel>
                                    <Input
                                      size="lg"
                                      value={form.purchaseLocation}
                                      onChange={(e) => updateSealedForm(form.id, 'purchaseLocation', e.target.value)}
                                    />
                                  </FormControl>

                                  <FormControl isRequired>
                                    <FormLabel fontWeight="bold">Image</FormLabel>
                                    <VStack spacing={4} align="stretch" w="100%">
                                      {form.sealedImagePreview ? (
                                        <Box position="relative">
                                          <Image
                                            src={form.sealedImagePreview}
                                            alt="Aperçu"
                                            maxH="200px"
                                            objectFit="contain"
                                          />
                                          <IconButton
                                            aria-label="Supprimer l'image"
                                            icon={<CloseIcon />}
                                            size="sm"
                                            position="absolute"
                                            top={2}
                                            right={2}
                                            onClick={() => {
                                              updateSealedForm(form.id, 'sealedImage', null);
                                              updateSealedForm(form.id, 'sealedImagePreview', '');
                                            }}
                                          />
                                        </Box>
                                      ) : (
                                        <Box
                                          borderWidth={2}
                                          borderStyle="dashed"
                                          borderRadius="lg"
                                          p={6}
                                          textAlign="center"
                                        >
                                          <Text mb={4}>Aucune image sélectionnée</Text>
                                        </Box>
                                      )}
                                      
                                      <ButtonGroup spacing={4} width="100%">
                                        <Button
                                          as="label"
                                          htmlFor={`sealed-image-${form.id}`}
                                          cursor="pointer"
                                          colorScheme="blue"
                                          width="50%"
                                        >
                                          Uploader une image
                                          <input
                                            id={`sealed-image-${form.id}`}
                                            type="file"
                                            accept="image/*"
                                            style={{ display: 'none' }}
                                            onChange={(e) => {
                                              const file = e.target.files?.[0];
                                              if (file) {
                                                if (file.size > 5 * 1024 * 1024) {
                                                  toast({
                                                    title: 'Fichier trop volumineux',
                                                    description: 'La taille maximum autorisée est de 5MB',
                                                    status: 'error',
                                                    duration: 3000,
                                                    isClosable: true,
                                                  });
                                                  return;
                                                }
                                                updateSealedForm(form.id, 'sealedImage', file);
                                                const reader = new FileReader();
                                                reader.onloadend = () => {
                                                  updateSealedForm(form.id, 'sealedImagePreview', reader.result as string);
                                                };
                                                reader.readAsDataURL(file);
                                              }
                                            }}
                                          />
                                        </Button>
                                        <Button
                                          colorScheme="green"
                                          width="50%"
                                          onClick={() => {
                                            setGalleryType('SCELLE');
                                            setCurrentFormId(form.id);
                                            onGalleryOpen();
                                          }}
                                        >
                                          Choisir une image existante
                                        </Button>
                                      </ButtonGroup>
                                    </VStack>
                                  </FormControl>
                                </VStack>
                              </CardBody>
                            </Card>
                          </SimpleGrid>
                        </Box>
                      ))}
                    </SimpleGrid>
                    
                    <Button
                      leftIcon={<AddIcon />}
                      onClick={addSealedForm}
                      colorScheme="green"
                      variant="ghost"
                      size="lg"
                      w="100%"
                      py={8}
                      borderWidth="2px"
                      borderStyle="dashed"
                      borderColor={useColorModeValue('gray.200', 'gray.600')}
                      _hover={{
                        bg: useColorModeValue('gray.50', 'gray.700'),
                        borderColor: useColorModeValue('gray.300', 'gray.500'),
                      }}
                    >
                      Ajouter un autre produit scellé
                    </Button>

                    <Button 
                      type="submit" 
                      colorScheme="blue" 
                      size="lg"
                      isLoading={isLoading}
                      loadingText="Upload en cours..."
                    >
                      Ajouter {sealedForms.length > 1 ? 'les' : 'l\''} item{sealedForms.length > 1 ? 's' : ''}
                    </Button>
                  </VStack>
                </form>
              </TabPanel>

              {/* Panneau CARTES */}
              <TabPanel p={6}>
                <form onSubmit={handleCardSubmit}>
                  <VStack spacing={6} align="stretch">
                    <SimpleGrid columns={{ base: 1, lg: cardForms.length > 1 ? 2 : 1 }} spacing={6}>
                      {cardForms.map((form) => (
                        <Box 
                          key={form.id}
                          position="relative"
                          p={4}
                          borderWidth="1px"
                          borderRadius="lg"
                          borderColor={useColorModeValue('gray.200', 'gray.600')}
                        >
                          {cardForms.length > 1 && (
                            <IconButton
                              icon={<CloseIcon />}
                              aria-label="Supprimer le formulaire"
                              position="absolute"
                              right={2}
                              top={2}
                              colorScheme="red"
                              size="sm"
                              zIndex={2}
                              onClick={() => removeCardForm(form.id)}
                            />
                          )}
                          <SimpleGrid columns={1} spacing={6} width="100%">
                            <Card bg={useColorModeValue('white', 'gray.700')} borderColor={useColorModeValue('gray.200', 'gray.600')} width="100%">
                              <CardBody>
                                <VStack spacing={4}>
                                  <FormControl isRequired>
                                    <FormLabel fontWeight="bold">Série</FormLabel>
                                    <Select
                                      size="lg"
                                      value={form.selectedSeriesId?.toString() || ''}
                                      onChange={(e) => updateCardForm(form.id, 'selectedSeriesId', e.target.value ? parseInt(e.target.value) : null)}
                                      placeholder="Sélectionner une série"
                                    >
                                      {series.map((serie) => (
                                        <option key={serie.id} value={serie.id}>
                                          {serie.name} ({serie.code})
                                        </option>
                                      ))}
                                    </Select>
                                  </FormControl>

                                  <FormControl isRequired>
                                    <FormLabel fontWeight="bold">Extension</FormLabel>
                                    <Select
                                      size="lg"
                                      value={form.selectedExtensionId?.toString() || ''}
                                      onChange={(e) => setSelectedExtensionId(e.target.value ? parseInt(e.target.value) : null)}
                                      placeholder="Sélectionner une extension"
                                      isDisabled={!form.selectedSeriesId}
                                    >
                                      {filteredExtensions.map((extension) => (
                                        <option key={extension.id} value={extension.id}>
                                          {extension.name} ({extension.code})
                                        </option>
                                      ))}
                                    </Select>
                                  </FormControl>

                                  <FormControl isRequired>
                                    <FormLabel fontWeight="bold">Nom de la carte</FormLabel>
                                    <Input
                                      size="lg"
                                      value={form.cardName}
                                      onChange={(e) => updateCardForm(form.id, 'cardName', e.target.value)}
                                      placeholder="Nom de la carte..."
                                    />
                                  </FormControl>

                                  <FormControl>
                                    <FormLabel fontWeight="bold">Numéro de la carte</FormLabel>
                                    <Input
                                      size="lg"
                                      value={form.cardNumber}
                                      onChange={(e) => updateCardForm(form.id, 'cardNumber', e.target.value)}
                                      placeholder="Numéro de la carte (optionnel)..."
                                    />
                                  </FormControl>

                                  <FormControl isRequired>
                                    <FormLabel fontWeight="bold">Quantité</FormLabel>
                                    <NumberInput min={1} value={form.quantity} size="lg">
                                      <NumberInputField
                                        onChange={(e) => updateCardForm(form.id, 'quantity', e.target.value)}
                                      />
                                    </NumberInput>
                                  </FormControl>

                                  <FormControl isRequired>
                                    <FormLabel fontWeight="bold">Achetée</FormLabel>
                                    <RadioGroup 
                                      value={form.isPurchased} 
                                      onChange={(value) => updateCardForm(form.id, 'isPurchased', value)}
                                    >
                                      <Stack direction="row" spacing={8}>
                                        <Radio size="lg" value="yes">Non</Radio>
                                        <Radio size="lg" value="no">Oui</Radio>
                                      </Stack>
                                    </RadioGroup>
                                  </FormControl>

                                  <FormControl isRequired>
                                    <FormLabel fontWeight="bold">Image</FormLabel>
                                    <VStack spacing={4} align="stretch" w="100%">
                                      {form.cardImagePreview ? (
                                        <Box position="relative">
                                          <Image
                                            src={form.cardImagePreview}
                                            alt="Aperçu"
                                            maxH="200px"
                                            objectFit="contain"
                                          />
                                          <IconButton
                                            aria-label="Supprimer l'image"
                                            icon={<CloseIcon />}
                                            size="sm"
                                            position="absolute"
                                            top={2}
                                            right={2}
                                            onClick={() => {
                                              updateCardForm(form.id, 'cardImage', null);
                                              updateCardForm(form.id, 'cardImagePreview', '');
                                            }}
                                          />
                                        </Box>
                                      ) : (
                                        <Box
                                          borderWidth={2}
                                          borderStyle="dashed"
                                          borderRadius="lg"
                                          p={6}
                                          textAlign="center"
                                        >
                                          <Text mb={4}>Aucune image sélectionnée</Text>
                                        </Box>
                                      )}
                                      
                                      <ButtonGroup spacing={4} width="100%">
                                        <Button
                                          as="label"
                                          htmlFor={`card-image-${form.id}`}
                                          cursor="pointer"
                                          colorScheme="blue"
                                          width="50%"
                                        >
                                          Uploader une image
                                          <input
                                            id={`card-image-${form.id}`}
                                            type="file"
                                            accept="image/*"
                                            style={{ display: 'none' }}
                                            onChange={(e) => {
                                              const file = e.target.files?.[0];
                                              if (file) {
                                                if (file.size > 5 * 1024 * 1024) {
                                                  toast({
                                                    title: 'Fichier trop volumineux',
                                                    description: 'La taille maximum autorisée est de 5MB',
                                                    status: 'error',
                                                    duration: 3000,
                                                    isClosable: true,
                                                  });
                                                  return;
                                                }
                                                updateCardForm(form.id, 'cardImage', file);
                                                const reader = new FileReader();
                                                reader.onloadend = () => {
                                                  updateCardForm(form.id, 'cardImagePreview', reader.result as string);
                                                };
                                                reader.readAsDataURL(file);
                                              }
                                            }}
                                          />
                                        </Button>
                                        <Button
                                          colorScheme="green"
                                          width="50%"
                                          onClick={() => {
                                            setGalleryType('CARTE');
                                            setCurrentFormId(form.id);
                                            onGalleryOpen();
                                          }}
                                        >
                                          Choisir une image existante
                                        </Button>
                                      </ButtonGroup>
                                    </VStack>
                                  </FormControl>

                                  {form.isPurchased === 'no' && (
                                    <VStack spacing={4} width="100%">
                                      <FormControl isRequired>
                                        <FormLabel fontWeight="bold">Prix d'achat</FormLabel>
                                        <NumberInput value={form.cardPurchasePrice} size="lg">
                                          <NumberInputField
                                            onChange={(e) => updateCardForm(form.id, 'cardPurchasePrice', e.target.value)}
                                          />
                                        </NumberInput>
                                      </FormControl>

                                      <FormControl isRequired>
                                        <FormLabel fontWeight="bold">Date d'achat</FormLabel>
                                        <Input
                                          size="lg"
                                          type="date"
                                          value={form.cardPurchaseDate}
                                          onChange={(e) => updateCardForm(form.id, 'cardPurchaseDate', e.target.value)}
                                        />
                                      </FormControl>

                                      <FormControl isRequired>
                                        <FormLabel fontWeight="bold">Lieu d'achat</FormLabel>
                                        <Input
                                          size="lg"
                                          value={form.cardPurchaseLocation}
                                          onChange={(e) => updateCardForm(form.id, 'cardPurchaseLocation', e.target.value)}
                                          placeholder="Où avez-vous acheté cette carte ?"
                                        />
                                      </FormControl>
                                    </VStack>
                                  )}
                                </VStack>
                              </CardBody>
                            </Card>
                          </SimpleGrid>
                        </Box>
                      ))}
                    </SimpleGrid>
                    
                    <Button
                      leftIcon={<AddIcon />}
                      onClick={addCardForm}
                      colorScheme="green"
                      variant="ghost"
                      size="lg"
                      w="100%"
                      py={8}
                      borderWidth="2px"
                      borderStyle="dashed"
                      borderColor={useColorModeValue('gray.200', 'gray.600')}
                      _hover={{
                        bg: useColorModeValue('gray.50', 'gray.700'),
                        borderColor: useColorModeValue('gray.300', 'gray.500'),
                      }}
                    >
                      Ajouter une autre carte
                    </Button>

                    <Button 
                      type="submit" 
                      colorScheme="blue"
                      size="lg"
                      isLoading={isLoading}
                    >
                      Ajouter {cardForms.length > 1 ? 'les' : 'la'} carte{cardForms.length > 1 ? 's' : ''}
                    </Button>
                  </VStack>
                </form>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      </VStack>

      {/* Modal de galerie d'images */}
      <Modal isOpen={isGalleryOpen} onClose={onGalleryClose} size="6xl">
        <ModalOverlay />
        <ModalContent bg={useColorModeValue('white', 'gray.800')}>
          <ModalHeader>
            Galerie d'images {galleryType === 'SCELLE' ? 'scellées' : 'de cartes'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Grid templateColumns="repeat(auto-fill, minmax(200px, 1fr))" gap={4} p={4}>
              {existingImages
                .filter(img => img.type === galleryType)
                .map((image, index) => (
                  <Box
                    key={index}
                    position="relative"
                    cursor="pointer"
                    onClick={() => handleSelectExistingImage(image.image_url, image.file_name)}
                    _hover={{
                      transform: 'scale(1.05)',
                      transition: 'transform 0.2s'
                    }}
                  >
                    <Image
                      src={image.image_url}
                      alt={`Image ${index + 1}`}
                      objectFit="contain"
                      maxH="200px"
                      w="100%"
                      borderRadius="md"
                    />
                  </Box>
                ))}
            </Grid>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onGalleryClose}>Fermer</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
}; 