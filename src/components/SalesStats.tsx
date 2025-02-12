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
};

export const SalesStats = ({ sales }: SalesStatsProps) => {
  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // Calculer les statistiques
  const totalSales = sales.reduce((acc, sale) => acc + sale.quantity, 0);
  const totalRevenue = sales.reduce((acc, sale) => acc + (sale.sale_price * sale.quantity), 0);
  
  // Calculer le bénéfice total
  const totalProfit = sales.reduce((acc, sale) => {
    const purchasePrice = sale.type === 'CARTE' ? sale.card_purchase_price : sale.purchase_price;
    if (purchasePrice === undefined) return acc;
    
    const profit = (sale.sale_price - purchasePrice) * sale.quantity;
    return acc + profit;
  }, 0);
  
  const sealedSales = sales.filter(sale => sale.type === 'SCELLE');
  const cardSales = sales.filter(sale => sale.type === 'CARTE');
  const totalSealed = sealedSales.reduce((acc, sale) => acc + sale.quantity, 0);
  const totalCards = cardSales.reduce((acc, sale) => acc + sale.quantity, 0);

  // Calculer les revenus du mois en cours
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const currentMonthSales = sales.filter(sale => {
    const saleDate = new Date(sale.sale_date);
    return saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear;
  });
  const currentMonthRevenue = currentMonthSales.reduce(
    (acc, sale) => acc + (sale.sale_price * sale.quantity),
    0
  );

  // Calculer le bénéfice mensuel
  const currentMonthProfit = currentMonthSales.reduce((acc, sale) => {
    const purchasePrice = sale.type === 'CARTE' ? sale.card_purchase_price : sale.purchase_price;
    if (purchasePrice === undefined) return acc;
    
    const profit = (sale.sale_price - purchasePrice) * sale.quantity;
    return acc + profit;
  }, 0);

  return (
    <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
      <Box p={4} borderRadius="lg" bg={bgColor} borderWidth="1px" borderColor={borderColor} shadow="sm">
        <Stat>
          <StatLabel>Chiffre d'affaires (mois en cours)</StatLabel>
          <StatNumber>
            {currentMonthRevenue.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
          </StatNumber>
          <StatHelpText>
            Total: {totalRevenue.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
          </StatHelpText>
        </Stat>
      </Box>

      <Box p={4} borderRadius="lg" bg={bgColor} borderWidth="1px" borderColor={borderColor} shadow="sm">
        <Stat>
          <StatLabel>Bénéfice (mois en cours)</StatLabel>
          <StatNumber>
            {currentMonthProfit.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
          </StatNumber>
          <StatHelpText>
            Total: {totalProfit.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
          </StatHelpText>
        </Stat>
      </Box>

      <Box p={4} borderRadius="lg" bg={bgColor} borderWidth="1px" borderColor={borderColor} shadow="sm">
        <Stat>
          <StatLabel>Rentabilité (mois en cours)</StatLabel>
          <StatNumber>
            {currentMonthRevenue > 0
              ? `${((currentMonthProfit / currentMonthRevenue) * 100).toFixed(1)}%`
              : '0%'}
          </StatNumber>
          <StatHelpText>
            Total: {totalRevenue > 0
              ? `${((totalProfit / totalRevenue) * 100).toFixed(1)}%`
              : '0%'}
          </StatHelpText>
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