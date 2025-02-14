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
  const labelColor = useColorModeValue('gray.600', 'gray.300');
  const helpTextColor = useColorModeValue('gray.500', 'gray.400');

  // Nouvelles couleurs pour les valeurs
  const valueColor1 = useColorModeValue('blue.500', 'blue.300'); // Pour le chiffre d'affaires
  const valueColor2 = useColorModeValue('purple.500', 'purple.300'); // Pour le bénéfice
  const valueColor3 = useColorModeValue('green.500', 'green.300'); // Pour la rentabilité
  const valueColor4 = useColorModeValue('gray.800', 'white'); // Pour les items vendus

  // Calculer les statistiques pour toutes les ventes
  const totalRevenue = sales.reduce(
    (acc, sale) => acc + (sale.sale_price * sale.quantity),
    0
  );

  const totalProfit = sales.reduce((acc, sale) => {
    let purchasePrice = 0;
    
    if (sale.type === 'CARTE') {
      if (sale.card_purchase_price !== undefined) {
        purchasePrice = sale.card_purchase_price;
      }
    } else {
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
          <StatLabel color={labelColor}>Chiffre d'affaires</StatLabel>
          <StatNumber color={valueColor1} fontSize="2xl">
            {totalRevenue.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
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
          <StatLabel color={labelColor}>Bénéfice</StatLabel>
          <StatNumber color={valueColor2} fontSize="2xl">
            {totalProfit.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
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
          <StatLabel color={labelColor}>Rentabilité</StatLabel>
          <StatNumber color={valueColor3} fontSize="2xl">
            {totalRevenue > 0
              ? `${((totalProfit / totalRevenue) * 100).toFixed(1)}%`
              : '0%'}
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
          <StatLabel color={labelColor}>Items Vendus</StatLabel>
          <StatNumber color={valueColor4} fontSize="2xl">{totalSales}</StatNumber>
          <StatHelpText color={helpTextColor}>
            <Box as="span" color="blue.300">Scellés: {totalSealed}</Box> | <Box as="span" color="purple.300">Cartes: {totalCards}</Box>
          </StatHelpText>
        </Stat>
      </Box>
    </SimpleGrid>
  );
}; 