import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  LinearProgress,
  Avatar,
  useTheme,
  ListItemButton,
  Stack,
  Divider,
  Tooltip,
  Badge,
} from '@mui/material';
import {
  TrendingUp,
  Inventory,
  People,
  AttachMoney,
  Star,
  ShoppingCart,
  Category,
  Assessment,
} from '@mui/icons-material';
import dayjs from 'dayjs';
import { productAPI, supplierAPI, orderAPI, movementAPI } from '../utils/api';
import type { ProductData, SupplierData, OrderData, InventoryMovement } from '../utils/api';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, subtitle, icon, color }: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color: string;
}) => {
  const theme = useTheme();
  return (
    <motion.div whileHover={{ translateY: -5, boxShadow: theme.shadows[2] }}>
      <Card className="h-full">
        <CardContent>
          <Box className="flex items-center justify-between">
            <Box>
              <Typography variant="overline" fontWeight={700} letterSpacing={0.5} color="text.secondary">
                {title}
              </Typography>
              <Stack direction="row" alignItems="baseline" spacing={1}>
                <Typography variant="h3" fontWeight={700} sx={{ color }}>
                  {value}
                </Typography>
                {subtitle && (
                  <Typography variant="subtitle2" color="text.secondary" fontWeight={600}>
                    {subtitle}
                  </Typography>
                )}
              </Stack>
            </Box>
            <Avatar sx={{ bgcolor: color, color: 'white', width: 60, height: 60, boxShadow: theme.shadows[3] }}>
              {icon}
            </Avatar>
          </Box>
          <Divider sx={{ my: 2 }} />
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="body2" color="text.secondary">
              Updated moments ago
            </Typography>
            <Badge variant="dot" color="success">
              <Box width={10} height={10} borderRadius="50%" bgcolor="success.main" />
            </Badge>
          </Stack>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default function Dashboard() {
  const [products, setProducts] = useState<ProductData[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierData[]>([]);
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

  const fetchData = useCallback(async () => {
    try {
      const [productsData, suppliersData, ordersData, movementsData] = await Promise.all([
        productAPI.getAll(),
        supplierAPI.getAll(),
        orderAPI.getAll(),
        movementAPI.getAll(),
      ]);
      setProducts(productsData);
      setSuppliers(suppliersData);
      setOrders(ordersData);
      setMovements(movementsData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return <LinearProgress />;
  }

  const totalProducts = products.length;
  const totalSuppliers = suppliers.length;
  const totalValue = (products ?? []).reduce((sum, product) => sum + (product?.price ?? 0) * (product?.quantity ?? 0), 0);
  const lowStockProducts = products.filter(product => product.quantity <= product.reorderPoint).length;
  const pendingOrders = orders.filter(order => order.status !== 'Livré').length;
  const incomingStock = (orders ?? [])
    .filter(order => order && order.status !== 'Annulé')
    .reduce((sum, order) => sum + (order.items ?? []).reduce((itemSum, item) => itemSum + (item?.quantity ?? 0), 0), 0);
  const latestMovements = movements.slice(0, 5);

  const recentProducts = products.slice(0, 5);
  const topSuppliers = [...suppliers]
    .sort((a, b) => Number(b?.rating ?? 0) - Number(a?.rating ?? 0))
    .slice(0, 3);

  return (
    <Box display="flex" flexDirection="column" gap={6}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems={{ xs: 'flex-start', md: 'center' }} justifyContent="space-between">
        <Box>
          <Typography variant="overline" color="primary.main" fontWeight={700} letterSpacing={1.5}>
            Overview
          </Typography>
          <Typography variant="h3" fontWeight={700} mt={1}>
            Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary" mt={1.5} maxWidth="sm">
            Monitor inventory health, supplier performance, and revenue metrics in real time.
          </Typography>
        </Box>
        <Paper elevation={0} sx={{ p: 3, borderRadius: 4, boxShadow: 'soft' }}>
          <Stack spacing={1}>
            <Typography variant="subtitle2" color="text.secondary">
              Inventory Health Index
            </Typography>
            <Typography variant="h4" fontWeight={700} color="primary.main">
              92%
            </Typography>
            <Typography variant="body2" color="success.main" fontWeight={600}>
              +6.4% vs last week
            </Typography>
          </Stack>
        </Paper>
      </Stack>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Total Products"
            value={totalProducts}
            subtitle="Active SKUs"
            icon={<Inventory sx={{ fontSize: 30 }} />}
            color={theme.palette.primary.main}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Total Suppliers"
            value={totalSuppliers}
            subtitle="Global partners"
            icon={<People sx={{ fontSize: 30 }} />}
            color="#2e7d32"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Inventory Value"
            value={`€${totalValue.toLocaleString()}`}
            subtitle="Current stock"
            icon={<AttachMoney sx={{ fontSize: 30 }} />}
            color="#ed6c02"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Low Stock"
            value={lowStockProducts}
            subtitle="Below threshold"
            icon={<TrendingUp sx={{ fontSize: 30 }} />}
            color="#d32f2f"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Active Orders"
            value={pendingOrders}
            subtitle="Awaiting delivery"
            icon={<Assessment sx={{ fontSize: 30 }} />}
            color="#0288d1"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Incoming Units"
            value={incomingStock}
            subtitle="On purchase orders"
            icon={<ShoppingCart sx={{ fontSize: 30 }} />}
            color="#7b1fa2"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={0} sx={{ p: 4, borderRadius: 4, boxShadow: 'large', height: '100%' }}>
            <Stack direction="row" spacing={2} alignItems="center" mb={3}>
              <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.dark', width: 48, height: 48 }}>
                <ShoppingCart />
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  Recent Products
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Latest items added across categories
                </Typography>
              </Box>
            </Stack>
            <List>
              {recentProducts.map((product, index) => (
                <ListItem key={product.id} disableGutters divider={index < recentProducts.length - 1} sx={{ py: 1.5 }}>
                  <ListItemButton sx={{ borderRadius: 3 }}>
                    <ListItemIcon sx={{ minWidth: 48 }}>
                      <Avatar variant="rounded" sx={{ bgcolor: 'primary.light', color: 'primary.dark' }}>
                        <Category />
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primaryTypographyProps={{ fontWeight: 600 }}
                      primary={product.name}
                      secondary={`€${product.price} • Qty ${product.quantity}`}
                    />
                    <Chip label={product.category} size="small" color="primary" sx={{ borderRadius: 2 }} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={0} sx={{ p: 4, borderRadius: 4, boxShadow: 'large', height: '100%' }}>
            <Stack direction="row" spacing={2} alignItems="center" mb={3}>
              <Avatar sx={{ bgcolor: '#fff1c9', color: '#b26a00', width: 48, height: 48 }}>
                <Assessment />
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  Top Rated Suppliers
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Partners with highest quality and reliability
                </Typography>
              </Box>
            </Stack>
            <List>
              {topSuppliers.map((supplier, index) => (
                <ListItem key={supplier.id} disableGutters divider={index < topSuppliers.length - 1} sx={{ py: 1.5 }}>
                  <ListItemButton sx={{ borderRadius: 3 }}>
                    <ListItemIcon sx={{ minWidth: 48 }}>
                      <Avatar variant="rounded" sx={{ bgcolor: '#fff1c9', color: '#b26a00' }}>
                        <Star />
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primaryTypographyProps={{ fontWeight: 600 }}
                      primary={supplier.name}
                      secondary={`${supplier?.productsCount ?? 0} products supplied`}
                    />
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <Typography variant="subtitle1" fontWeight={700}>
                        {Number(supplier?.rating ?? 0).toFixed(1)}
                      </Typography>
                      <Tooltip title="Supplier rating">
                        <Star sx={{ fontSize: 18, color: '#f6ad55' }} />
                      </Tooltip>
                    </Stack>
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={0} sx={{ p: 4, borderRadius: 4, boxShadow: 'large', height: '100%' }}>
            <Stack direction="row" spacing={2} alignItems="center" mb={3}>
              <Avatar sx={{ bgcolor: '#e8f5e9', color: '#2e7d32', width: 48, height: 48 }}>
                <TrendingUp />
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  Latest Movements
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Recent stock entries and exits
                </Typography>
              </Box>
            </Stack>
            <List>
              {latestMovements.map((movement, index) => (
                <ListItem key={movement.id} disableGutters divider={index < latestMovements.length - 1} sx={{ py: 1.5 }}>
                  <ListItemIcon sx={{ minWidth: 48 }}>
                    <Avatar sx={{ bgcolor: movement.type === 'IN' ? '#e8f5e9' : '#ffebee', color: movement.type === 'IN' ? '#2e7d32' : '#c62828' }}>
                      {movement.type === 'IN' ? <TrendingUp /> : <Assessment />}
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primaryTypographyProps={{ fontWeight: 600 }}
                    primary={`Movement ${movement.reference}`}
                    secondary={`${movement.quantity} units • ${dayjs(movement.date).format('DD MMM YYYY')}`}
                  />
                  <Chip label={movement.type === 'IN' ? 'Entry' : 'Exit'} color={movement.type === 'IN' ? 'success' : 'error'} size="small" sx={{ borderRadius: 2 }} />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}