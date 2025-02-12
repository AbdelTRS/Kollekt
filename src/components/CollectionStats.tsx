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
      <Box p={4} borderRadius="lg" bg={bgColor} borderWidth="1px" borderColor={borderColor} shadow="sm">
        <Stat>
          <StatLabel>Valeur d'Achat</StatLabel>
          <StatNumber>
            {totalValue > 0 ? totalValue.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }) : '-'}
          </StatNumber>
        </Stat>
      </Box>

      <Box p={4} borderRadius="lg" bg={bgColor} borderWidth="1px" borderColor={borderColor} shadow="sm">
        <Stat>
          <StatLabel>Valeur sur le marché</StatLabel>
          <StatNumber>
            {totalMarketValue > 0 ? totalMarketValue.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }) : '-'}
          </StatNumber>
        </Stat>
      </Box>

      <Box p={4} borderRadius="lg" bg={bgColor} borderWidth="1px" borderColor={borderColor} shadow="sm">
        <Stat>
          <StatLabel>Nombre Total d'Items</StatLabel>
          <StatNumber>{totalItems}</StatNumber>
          <StatHelpText>En stock</StatHelpText>
        </Stat>
      </Box>

      <Box p={4} borderRadius="lg" bg={bgColor} borderWidth="1px" borderColor={borderColor} shadow="sm">
        <Stat>
          <StatLabel>Distribution</StatLabel>
          <StatNumber>{totalItems}</StatNumber>
          <StatHelpText>Scellés: {totalSealed} | Cartes: {totalCards}</StatHelpText>
        </Stat>
      </Box>
    </SimpleGrid>
  );
}; 