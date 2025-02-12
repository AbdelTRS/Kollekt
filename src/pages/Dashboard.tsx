import {
  Box,
  Container,
  Heading,
  SimpleGrid,
  Text,
  Select,
  Card,
  CardHeader,
  CardBody,
  Stack,
  HStack,
  Badge,
  Image,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  useColorModeValue,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

type TimeRange = 'week' | 'month' | 'year';

type Transaction = {
  id: string;
  date: string;
  type: 'SCELLE' | 'CARTE';
  name: string;
  image?: string;
  price: number;
  quantity: number;
};

type ChartData = {
  date: string;
  sales: number;
  purchases: number;
};

type ItemData = {
  id: string;
  type: 'SCELLE' | 'CARTE';
  item_name?: string;
  card_name?: string;
  card_image?: string;
  sealed_image?: string;
  quantity: number;
  purchase_price?: number;
  card_purchase_price?: number;
  purchase_date?: string;
  card_purchase_date?: string;
  market_value?: number;
};

type SaleData = {
  id: string;
  sale_date: string;
  sale_price: number;
  quantity: number;
  items: {
    type: 'SCELLE' | 'CARTE';
    item_name?: string;
    card_name?: string;
    card_image?: string;
    sealed_image?: string;
    purchase_price?: number;
    card_purchase_price?: number;
  };
};

export const Dashboard = () => {
  const { session } = useAuth();
  const [timeRange, setTimeRange] = useState<TimeRange>('month');
  const [collectionValue, setCollectionValue] = useState(0);
  const [totalMarketValue, setTotalMarketValue] = useState(0);
  const [totalProfit, setTotalProfit] = useState(0);
  const [monthlyProfit, setMonthlyProfit] = useState(0);
  const [monthlySales, setMonthlySales] = useState(0);
  const [totalSales, setTotalSales] = useState(0);
  const [lastPurchases, setLastPurchases] = useState<Transaction[]>([]);
  const [lastSales, setLastSales] = useState<Transaction[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);

  const bgCard = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  useEffect(() => {
    if (session?.user?.id) {
      fetchDashboardData();
    }
  }, [session?.user?.id]);

  useEffect(() => {
    if (session?.user?.id) {
      fetchChartData();
    }
  }, [session?.user?.id, timeRange]);

  const fetchDashboardData = async () => {
    try {
      // Récupérer la valeur totale de la collection et la valeur du marché
      const { data: items, error: itemsError } = await supabase
        .from('items')
        .select('type, quantity, purchase_price, card_purchase_price, market_value')
        .eq('user_id', session?.user?.id);

      if (itemsError) throw itemsError;

      const totalValue = items?.reduce((acc, item) => {
        const price = item.type === 'CARTE' ? item.card_purchase_price : item.purchase_price;
        return acc + (price || 0) * item.quantity;
      }, 0) || 0;

      const marketValue = items?.reduce((acc, item) => {
        return acc + (item.market_value || 0) * item.quantity;
      }, 0) || 0;

      setCollectionValue(totalValue);
      setTotalMarketValue(marketValue);

      // Récupérer les ventes et calculer les profits
      const { data: sales, error: salesError } = await supabase
        .from('sales')
        .select(`
          *,
          items (
            type,
            purchase_price,
            card_purchase_price
          )
        `)
        .eq('user_id', session?.user?.id);

      if (salesError) throw salesError;

      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      const monthSales = sales?.filter(sale => {
        const saleDate = new Date(sale.sale_date);
        return saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear;
      }) || [];

      const monthRevenue = monthSales.reduce((acc, sale) => acc + (sale.sale_price * sale.quantity), 0);
      setMonthlySales(monthRevenue);

      const monthProfit = monthSales.reduce((acc, sale) => {
        const purchasePrice = sale.items.type === 'CARTE' 
          ? sale.items.card_purchase_price 
          : sale.items.purchase_price;
        if (purchasePrice === undefined) return acc;
        return acc + ((sale.sale_price - purchasePrice) * sale.quantity);
      }, 0);
      setMonthlyProfit(monthProfit);

      const profit = sales?.reduce((acc, sale) => {
        const purchasePrice = sale.items.type === 'CARTE' 
          ? sale.items.card_purchase_price 
          : sale.items.purchase_price;
        if (purchasePrice === undefined) return acc;
        return acc + ((sale.sale_price - purchasePrice) * sale.quantity);
      }, 0) || 0;

      setTotalProfit(profit);

      // Calculer le chiffre d'affaires total
      const totalRevenue = sales?.reduce((acc, sale) => acc + (sale.sale_price * sale.quantity), 0) || 0;
      setTotalSales(totalRevenue);

      // Récupérer les 3 derniers achats
      const { data: recentItems, error: recentItemsError } = await supabase
        .from('items')
        .select(`
          id,
          type,
          item_name,
          card_name,
          card_image,
          sealed_image,
          quantity,
          purchase_price,
          card_purchase_price,
          purchase_date,
          card_purchase_date
        `)
        .eq('user_id', session?.user?.id)
        .order('created_at', { ascending: false })
        .limit(3);

      if (recentItemsError) throw recentItemsError;

      const formattedPurchases = (recentItems || []).map(item => ({
        id: item.id,
        date: item.type === 'CARTE' ? item.card_purchase_date || '' : item.purchase_date || '',
        type: item.type,
        name: item.type === 'CARTE' ? item.card_name || '' : item.item_name || '',
        image: item.type === 'CARTE' ? item.card_image : item.sealed_image,
        price: item.type === 'CARTE' ? item.card_purchase_price || 0 : item.purchase_price || 0,
        quantity: item.quantity
      }));

      setLastPurchases(formattedPurchases);

      // Récupérer les 3 dernières ventes
      const { data: recentSales, error: recentSalesError } = await supabase
        .from('sales')
        .select(`
          id,
          sale_date,
          sale_price,
          quantity,
          items (
            type,
            item_name,
            card_name,
            card_image,
            sealed_image
          )
        `)
        .eq('user_id', session?.user?.id)
        .order('created_at', { ascending: false })
        .limit(3) as { data: SaleData[] | null, error: any };

      if (recentSalesError) throw recentSalesError;

      const formattedSales = (recentSales || []).map(sale => ({
        id: sale.id,
        date: sale.sale_date,
        type: sale.items.type,
        name: sale.items.type === 'CARTE' ? sale.items.card_name || '' : sale.items.item_name || '',
        image: sale.items.type === 'CARTE' ? sale.items.card_image : sale.items.sealed_image,
        price: sale.sale_price,
        quantity: sale.quantity
      }));

      setLastSales(formattedSales);

    } catch (error: any) {
      console.error('Erreur lors du chargement des données:', error);
    }
  };

  const fetchChartData = async () => {
    try {
      // Définir la période en fonction du timeRange
      const now = new Date();
      let startDate = new Date();
      switch (timeRange) {
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      // Récupérer les ventes pour la période
      const { data: salesData, error: salesError } = await supabase
        .from('sales')
        .select('sale_date, sale_price, quantity')
        .eq('user_id', session?.user?.id)
        .gte('sale_date', startDate.toISOString())
        .lte('sale_date', now.toISOString());

      if (salesError) throw salesError;

      // Récupérer les achats pour la période
      const { data: purchasesData, error: purchasesError } = await supabase
        .from('items')
        .select('type, purchase_date, card_purchase_date, purchase_price, card_purchase_price, quantity')
        .eq('user_id', session?.user?.id)
        .or(`purchase_date.gte.${startDate.toISOString()},card_purchase_date.gte.${startDate.toISOString()}`)
        .or(`purchase_date.lte.${now.toISOString()},card_purchase_date.lte.${now.toISOString()}`);

      if (purchasesError) throw purchasesError;

      // Organiser les données pour le graphique
      const chartDataMap = new Map<string, ChartData>();

      // Ajouter les ventes
      salesData.forEach(sale => {
        const date = new Date(sale.sale_date).toISOString().split('T')[0];
        const existingData = chartDataMap.get(date) || { date, sales: 0, purchases: 0 };
        existingData.sales += sale.sale_price * sale.quantity;
        chartDataMap.set(date, existingData);
      });

      // Ajouter les achats
      purchasesData.forEach(purchase => {
        const date = new Date(purchase.type === 'CARTE' ? purchase.card_purchase_date : purchase.purchase_date)
          .toISOString().split('T')[0];
        const existingData = chartDataMap.get(date) || { date, sales: 0, purchases: 0 };
        existingData.purchases += (purchase.type === 'CARTE' ? purchase.card_purchase_price : purchase.purchase_price) * purchase.quantity;
        chartDataMap.set(date, existingData);
      });

      // Convertir la Map en tableau trié par date
      const sortedData = Array.from(chartDataMap.values()).sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      setChartData(sortedData);

    } catch (error: any) {
      console.error('Erreur lors du chargement des données du graphique:', error);
    }
  };

  const formatChartDate = (date: string) => {
    const d = new Date(date);
    switch (timeRange) {
      case 'week':
        return d.toLocaleDateString('fr-FR', { weekday: 'short' });
      case 'month':
        return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
      case 'year':
        return d.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
    }
  };

  const TransactionCard = ({ title, transactions }: { title: string, transactions: Transaction[] }) => (
    <Card bg={bgCard} borderColor={borderColor} borderWidth="1px">
      <CardHeader>
        <Heading size="md">{title}</Heading>
      </CardHeader>
      <CardBody>
        <Stack spacing={4}>
          {transactions.map(transaction => (
            <HStack key={transaction.id} spacing={4}>
              <Image
                src={transaction.type === 'CARTE' 
                  ? transaction.image 
                  : transaction.image && session?.user?.id
                    ? `https://odryoxqrsdhsdhfueqqs.supabase.co/storage/v1/object/public/sealed-images/${session.user.id}/${transaction.image}`
                    : undefined
                }
                alt={transaction.name}
                boxSize="40px"
                objectFit="contain"
                fallback={<Box boxSize="40px" bg="gray.100" />}
              />
              <Box flex="1">
                <Text fontSize="sm" fontWeight="bold" noOfLines={1}>
                  {transaction.name}
                </Text>
                <HStack spacing={2}>
                  <Badge colorScheme={transaction.type === 'CARTE' ? 'blue' : 'green'}>
                    {transaction.type}
                  </Badge>
                  <Text fontSize="sm">
                    {new Date(transaction.date).toLocaleDateString()}
                  </Text>
                </HStack>
              </Box>
              <Box textAlign="right">
                <Text fontWeight="bold">
                  {transaction.price.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                </Text>
                <Text fontSize="sm">x{transaction.quantity}</Text>
              </Box>
            </HStack>
          ))}
        </Stack>
      </CardBody>
    </Card>
  );

  return (
    <Container maxW="container.xl" py={10}>
      <Stack spacing={8}>
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={6}>
          <Card bg={bgCard} borderColor={borderColor} borderWidth="1px">
            <CardBody>
              <Stat>
                <StatLabel>Valeur Collection</StatLabel>
                <StatNumber>
                  {collectionValue.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                </StatNumber>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={bgCard} borderColor={borderColor} borderWidth="1px">
            <CardBody>
              <Stat>
                <StatLabel>Valeur sur le marché</StatLabel>
                <StatNumber>
                  {totalMarketValue.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                </StatNumber>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={bgCard} borderColor={borderColor} borderWidth="1px">
            <CardBody>
              <Stat>
                <StatLabel>Chiffre d'affaires (mois en cours)</StatLabel>
                <StatNumber>
                  {monthlySales.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                </StatNumber>
                <StatHelpText>
                  Total: {totalSales.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={bgCard} borderColor={borderColor} borderWidth="1px">
            <CardBody>
              <Stat>
                <StatLabel>Rentabilité (mois en cours)</StatLabel>
                <StatNumber>
                  {monthlyProfit > 0
                    ? `${((monthlyProfit / monthlySales) * 100).toFixed(1)}%`
                    : '0%'}
                </StatNumber>
                <StatHelpText>
                  {totalProfit > 0
                    ? `Global: ${((totalProfit / collectionValue) * 100).toFixed(1)}%`
                    : 'Global: 0%'}
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        <Card bg={bgCard} borderColor={borderColor} borderWidth="1px">
          <CardBody>
            <HStack justify="space-between" align="center" mb={6}>
              <Heading size="md">Évolution des ventes et achats</Heading>
              <Select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as TimeRange)}
                width="200px"
              >
                <option value="week">7 derniers jours</option>
                <option value="month">30 derniers jours</option>
                <option value="year">12 derniers mois</option>
              </Select>
            </HStack>
            <Box height="400px">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={formatChartDate}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    tickFormatter={(value) => 
                      `${value.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}€`
                    }
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip 
                    formatter={(value: number) => 
                      value.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })
                    }
                    labelFormatter={(label) => new Date(label).toLocaleDateString('fr-FR')}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="sales" 
                    stroke="#48BB78" 
                    name="Ventes"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="purchases" 
                    stroke="#F56565" 
                    name="Achats"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </CardBody>
        </Card>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          <TransactionCard title="Derniers Achats" transactions={lastPurchases} />
          <TransactionCard title="Dernières Ventes" transactions={lastSales} />
        </SimpleGrid>
      </Stack>
    </Container>
  );
}; 