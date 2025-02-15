import {
  SimpleGrid,
  Box,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  useColorModeValue,
  Text,
  Flex,
  Badge,
  VStack,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  Portal,
} from '@chakra-ui/react';
import { 
  FaShoppingCart, 
  FaChartLine, 
  FaCubes, 
  FaBoxes 
} from 'react-icons/fa';

type Item = {
  id: string;
  type: 'SCELLE' | 'CARTE';
  sub_type?: string;
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
  const profitColor = useColorModeValue('green.500', 'green.300');
  const lossColor = useColorModeValue('red.500', 'red.300');

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

  // Calculer le bénéfice potentiel
  const potentialProfit = totalMarketValue - totalValue;
  
  // Calculer la distribution par type d'item
  const itemTypes = items.reduce((acc, item) => {
    if (item.type === 'SCELLE' && item.sub_type) {
      const key = item.sub_type;
      acc[key] = (acc[key] || 0) + item.quantity;
    } else if (item.type === 'CARTE') {
      acc['Cartes'] = (acc['Cartes'] || 0) + item.quantity;
    }
    return acc;
  }, {} as { [key: string]: number });

  const StatBox = ({ 
    label, 
    value, 
    helpText, 
    icon, 
    valueColor 
  }: { 
    label: string; 
    value: string | number; 
    helpText?: React.ReactNode; 
    icon: React.ReactElement; 
    valueColor: string; 
  }) => (
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
        <Flex alignItems="center" mb={2}>
          <Box color={valueColor} mr={2}>
            {icon}
          </Box>
          <StatLabel color={labelColor} fontSize={{ base: 'sm', md: 'md' }}>
            {label}
          </StatLabel>
        </Flex>
        <StatNumber 
          color={valueColor} 
          fontSize={{ base: 'xl', md: '2xl' }}
          wordBreak="break-word"
        >
          {value}
        </StatNumber>
        {helpText && (
          <StatHelpText 
            color={helpTextColor}
            fontSize={{ base: 'xs', md: 'sm' }}
            mt={2}
          >
            {helpText}
          </StatHelpText>
        )}
      </Stat>
    </Box>
  );

  return (
    <SimpleGrid 
      columns={{ base: 1, sm: 2, md: 4 }} 
      spacing={{ base: 3, md: 4 }}
      mx={{ base: -2, md: 0 }}
    >
      <StatBox
        label="Valeur d'Achat"
        value={totalValue > 0 ? totalValue.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }) : '-'}
        icon={<FaShoppingCart size="1.2em" />}
        valueColor={valueColor1}
      />

      <StatBox
        label="Valeur sur le marché"
        value={totalMarketValue > 0 ? totalMarketValue.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }) : '-'}
        helpText={
          <Text color={potentialProfit >= 0 ? profitColor : lossColor} fontWeight="bold">
            {potentialProfit >= 0 ? '+' : ''}
            {potentialProfit.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
          </Text>
        }
        icon={<FaChartLine size="1.2em" />}
        valueColor={valueColor2}
      />

      <StatBox
        label="Nombre Total d'Items"
        value={totalItems}
        helpText="En stock"
        icon={<FaCubes size="1.2em" />}
        valueColor={valueColor3}
      />

      <Popover trigger="hover" placement="bottom" gutter={12}>
        <PopoverTrigger>
          <Box>
            <StatBox
              label="Distribution"
              value={totalItems}
              helpText={
                <Text fontSize="sm" color={helpTextColor}>
                  Survoler pour voir les détails
                </Text>
              }
              icon={<FaBoxes size="1.2em" />}
              valueColor={valueColor4}
            />
          </Box>
        </PopoverTrigger>
        <Portal>
          <PopoverContent 
            bg={bgColor} 
            borderColor={borderColor}
            boxShadow="lg"
            _focus={{ outline: 'none' }}
            maxW="300px"
          >
            <PopoverBody>
              <VStack spacing={2} align="stretch">
                {Object.entries(itemTypes).map(([type, count]) => (
                  <Flex key={type} justify="space-between" align="center">
                    <Badge colorScheme={type === 'Cartes' ? 'purple' : 'blue'} px={2} py={1}>
                      {type}
                    </Badge>
                    <Text fontWeight="bold">{count}</Text>
                  </Flex>
                ))}
              </VStack>
            </PopoverBody>
          </PopoverContent>
        </Portal>
      </Popover>
    </SimpleGrid>
  );
}; 