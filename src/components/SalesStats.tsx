import {
  SimpleGrid,
  Box,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  useColorModeValue,
} from '@chakra-ui/react';

type Sale = {
  id: string;
  type: 'SCELLE' | 'CARTE';
  quantity: number;
  sale_price: number;
  sale_date: string;
  purchase_price?: number;
  card_purchase_price?: number;
};

type SalesStatsProps = {
  sales: Sale[];
  onMonthSelect?: (month: string | null) => void;
};

export const SalesStats = ({ sales }: SalesStatsProps) => {
  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // Calculer les statistiques pour toutes les ventes
  const totalRevenue = sales.reduce(
    (acc, sale) => acc + (sale.sale_price * sale.quantity),
    0
  );

  const totalProfit = sales.reduce((acc, sale) => {
    // Pour les cartes non achetées, on considère le prix d'achat comme 0€
    let purchasePrice = 0;
    
    if (sale.type === 'CARTE') {
      // Si la carte a été achetée, on utilise son prix d'achat
      if (sale.card_purchase_price !== undefined) {
        purchasePrice = sale.card_purchase_price;
      }
      // Si la carte n'a pas été achetée, le prix d'achat reste à 0€
    } else {
      // Pour les items scellés, on utilise toujours le prix d'achat
      purchasePrice = sale.purchase_price || 0;
    }

    return acc + ((sale.sale_price - purchasePrice) * sale.quantity);
  }, 0);

  const totalSales = sales.reduce((acc, sale) => acc + sale.quantity, 0);
  const totalSealedSales = sales.filter(sale => sale.type === 'SCELLE');
  const totalCardSales = sales.filter(sale => sale.type === 'CARTE');
  const totalSealed = totalSealedSales.reduce((acc, sale) => acc + sale.quantity, 0);
  const totalCards = totalCardSales.reduce((acc, sale) => acc + sale.quantity, 0);

  return (
    <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
      <Box p={4} borderRadius="lg" bg={bgColor} borderWidth="1px" borderColor={borderColor} shadow="sm">
        <Stat>
          <StatLabel>Chiffre d'affaires</StatLabel>
          <StatNumber>
            {totalRevenue.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
          </StatNumber>
        </Stat>
      </Box>

      <Box p={4} borderRadius="lg" bg={bgColor} borderWidth="1px" borderColor={borderColor} shadow="sm">
        <Stat>
          <StatLabel>Bénéfice</StatLabel>
          <StatNumber>
            {totalProfit.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
          </StatNumber>
        </Stat>
      </Box>

      <Box p={4} borderRadius="lg" bg={bgColor} borderWidth="1px" borderColor={borderColor} shadow="sm">
        <Stat>
          <StatLabel>Rentabilité</StatLabel>
          <StatNumber>
            {totalRevenue > 0
              ? `${((totalProfit / totalRevenue) * 100).toFixed(1)}%`
              : '0%'}
          </StatNumber>
        </Stat>
      </Box>

      <Box p={4} borderRadius="lg" bg={bgColor} borderWidth="1px" borderColor={borderColor} shadow="sm">
        <Stat>
          <StatLabel>Items Vendus</StatLabel>
          <StatNumber>{totalSales}</StatNumber>
          <StatHelpText>Scellés: {totalSealed} | Cartes: {totalCards}</StatHelpText>
        </Stat>
      </Box>
    </SimpleGrid>
  );
}; 