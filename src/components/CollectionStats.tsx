import {
  SimpleGrid,
  Box,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  useColorModeValue,
} from '@chakra-ui/react';

type Item = {
  id: string;
  type: 'SCELLE' | 'CARTE';
  quantity: number;
  purchase_price?: number;
  card_purchase_price?: number;
  is_purchased?: boolean;
  market_value?: number;
};

type CollectionStatsProps = {
  items: Item[];
};

export const CollectionStats = ({ items }: CollectionStatsProps) => {
  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const labelColor = useColorModeValue('gray.600', 'gray.300');
  const helpTextColor = useColorModeValue('gray.500', 'gray.400');

  // Nouvelles couleurs pour les valeurs
  const valueColor1 = useColorModeValue('blue.500', 'blue.300'); // Pour la valeur d'achat
  const valueColor2 = useColorModeValue('purple.500', 'purple.300'); // Pour la valeur du marché
  const valueColor3 = useColorModeValue('green.500', 'green.300'); // Pour le nombre total d'items
  const valueColor4 = useColorModeValue('gray.800', 'white'); // Pour la distribution

  // Calculer les statistiques
  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  
  // Calculer la valeur d'achat totale
  const totalValue = items.reduce((acc, item) => {
    if (item.type === 'SCELLE') {
      return acc + (item.purchase_price || 0) * item.quantity;
    } else {
      return acc + (item.card_purchase_price || 0) * item.quantity;
    }
  }, 0);

  // Calculer la valeur du marché totale
  const totalMarketValue = items.reduce((acc, item) => {
    return acc + (item.market_value || 0) * item.quantity;
  }, 0);
  
  const sealedItems = items.filter(item => item.type === 'SCELLE');
  const cardItems = items.filter(item => item.type === 'CARTE');
  const totalSealed = sealedItems.reduce((acc, item) => acc + item.quantity, 0);
  const totalCards = cardItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
      <Box 
        p={4} 
        borderRadius="lg" 
        bg={bgColor} 
        borderWidth="1px" 
        borderColor={borderColor} 
        boxShadow="sm"
        transition="all 0.2s"
        _hover={{ 
          boxShadow: 'md', 
          transform: 'translateY(-2px)',
          borderColor: 'blue.400'
        }}
      >
        <Stat>
          <StatLabel color={labelColor}>Valeur d'Achat</StatLabel>
          <StatNumber color={valueColor1} fontSize="2xl">
            {totalValue > 0 ? totalValue.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }) : '-'}
          </StatNumber>
        </Stat>
      </Box>

      <Box 
        p={4} 
        borderRadius="lg" 
        bg={bgColor} 
        borderWidth="1px" 
        borderColor={borderColor} 
        boxShadow="sm"
        transition="all 0.2s"
        _hover={{ 
          boxShadow: 'md', 
          transform: 'translateY(-2px)',
          borderColor: 'blue.400'
        }}
      >
        <Stat>
          <StatLabel color={labelColor}>Valeur sur le marché</StatLabel>
          <StatNumber color={valueColor2} fontSize="2xl">
            {totalMarketValue > 0 ? totalMarketValue.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }) : '-'}
          </StatNumber>
        </Stat>
      </Box>

      <Box 
        p={4} 
        borderRadius="lg" 
        bg={bgColor} 
        borderWidth="1px" 
        borderColor={borderColor} 
        boxShadow="sm"
        transition="all 0.2s"
        _hover={{ 
          boxShadow: 'md', 
          transform: 'translateY(-2px)',
          borderColor: 'blue.400'
        }}
      >
        <Stat>
          <StatLabel color={labelColor}>Nombre Total d'Items</StatLabel>
          <StatNumber color={valueColor3} fontSize="2xl">{totalItems}</StatNumber>
          <StatHelpText color={helpTextColor}>En stock</StatHelpText>
        </Stat>
      </Box>

      <Box 
        p={4} 
        borderRadius="lg" 
        bg={bgColor} 
        borderWidth="1px" 
        borderColor={borderColor} 
        boxShadow="sm"
        transition="all 0.2s"
        _hover={{ 
          boxShadow: 'md', 
          transform: 'translateY(-2px)',
          borderColor: 'blue.400'
        }}
      >
        <Stat>
          <StatLabel color={labelColor}>Distribution</StatLabel>
          <StatNumber color={valueColor4} fontSize="2xl">{totalItems}</StatNumber>
          <StatHelpText color={helpTextColor}>
            <Box as="span" color="blue.300">Scellés: {totalSealed}</Box> | <Box as="span" color="purple.300">Cartes: {totalCards}</Box>
          </StatHelpText>
        </Stat>
      </Box>
    </SimpleGrid>
  );
}; 