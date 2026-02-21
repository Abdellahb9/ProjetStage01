import React, { memo, useEffect } from 'react';
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
  Alert,
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
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  selectDashboardStats,
  selectRecentProducts,
  selectTopSuppliers,
} from '../store/selectors';
import { useGetProductsQuery, useGetSuppliersQuery } from '../store/api';
import { usePerformanceMonitor } from '../hooks/usePerformanceMonitor';

const StatCard = memo(({ title, value, icon, color }: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography color="textSecondary" gutterBottom variant="h6">
            {title}
          </Typography>
          <Typography variant="h4" component="div" sx={{ color }}>
            {value}
          </Typography>
        </Box>
        <Box sx={{ color, opacity: 0.7 }}>
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
));

StatCard.displayName = 'StatCard';

interface Product {
  id: number;
  name: string;
  price: number;
  quantity: number;
  category: string;
}

const RecentProductsList = memo(({ products }: { products: Product[] }) => (
  <List>
    {products.map((product) => (
      <ListItem key={product.id} divider>
        <ListItemIcon>
          <Category color="primary" />
        </ListItemIcon>
        <ListItemText
          primary={product.name}
          secondary={`€${product.price} - Qty: ${product.quantity}`}
        />
        <Chip
          label={product.category}
          size="small"
          color="primary"
          variant="outlined"
        />
      </ListItem>
    ))}
  </List>
));

RecentProductsList.displayName = 'RecentProductsList';

interface Supplier {
  id: number;
  name: string;
  productsCount: number;
  rating: number;
}

const TopSuppliersList = memo(({ suppliers }: { suppliers: Supplier[] }) => (
  <List>
    {suppliers.map((supplier) => (
      <ListItem key={supplier.id} divider>
        <ListItemIcon>
          <Star sx={{ color: '#ffc107' }} />
        </ListItemIcon>
        <ListItemText
          primary={supplier.name}
          secondary={`${supplier.productsCount} products`}
        />
        <Box display="flex" alignItems="center">
          <Typography variant="body2" sx={{ mr: 1 }}>
            {supplier.rating}
          </Typography>
          <Star sx={{ fontSize: 16, color: '#ffc107' }} />
        </Box>
      </ListItem>
    ))}
  </List>
));

TopSuppliersList.displayName = 'TopSuppliersList';

const OptimizedDashboard = memo(() => {
  const { measureRenderTime } = usePerformanceMonitor({
    componentName: 'Dashboard',
    logToConsole: process.env.NODE_ENV === 'development',
  });

  // Use RTK Query hooks for data fetching
  const {
    isLoading: productsLoading,
    error: productsError,
  } = useGetProductsQuery();

  const {
    isLoading: suppliersLoading,
    error: suppliersError,
  } = useGetSuppliersQuery();

  // Selectors for computed values
  const stats = useAppSelector(selectDashboardStats);
  const recentProducts = useAppSelector(selectRecentProducts);
  const topSuppliers = useAppSelector(selectTopSuppliers);

  // Measure render time
  const endRenderMeasurement = measureRenderTime();

  useEffect(() => {
    endRenderMeasurement();
  }, [endRenderMeasurement]);

  // Handle loading state
  if (productsLoading || suppliersLoading) {
    return <LinearProgress />;
  }

  // Handle errors
  if (productsError || suppliersError) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load dashboard data. Please try refreshing the page.
        </Alert>
        {productsError && (
          <Alert severity="error" sx={{ mb: 1 }}>
            Products Error: {productsError.toString()}
          </Alert>
        )}
        {suppliersError && (
          <Alert severity="error">
            Suppliers Error: {suppliersError.toString()}
          </Alert>
        )}
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      
      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Products"
            value={stats.totalProducts}
            icon={<Inventory sx={{ fontSize: 40 }} />}
            color="#1976d2"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Suppliers"
            value={stats.totalSuppliers}
            icon={<People sx={{ fontSize: 40 }} />}
            color="#2e7d32"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Value"
            value={`€${stats.totalValue.toLocaleString()}`}
            icon={<AttachMoney sx={{ fontSize: 40 }} />}
            color="#ed6c02"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Low Stock Items"
            value={stats.lowStockProducts}
            icon={<TrendingUp sx={{ fontSize: 40 }} />}
            color="#d32f2f"
          />
        </Grid>
      </Grid>

      {/* Recent Activity Section */}
      <Grid container spacing={3}>
        {/* Recent Products */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <ShoppingCart color="primary" />
              <Typography variant="h6">
                Recent Products
              </Typography>
            </Box>
            <RecentProductsList products={recentProducts} />
          </Paper>
        </Grid>

        {/* Top Suppliers */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <Assessment color="primary" />
              <Typography variant="h6">
                Top Rated Suppliers
              </Typography>
            </Box>
            <TopSuppliersList suppliers={topSuppliers} />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
});

OptimizedDashboard.displayName = 'OptimizedDashboard';

export default OptimizedDashboard;



