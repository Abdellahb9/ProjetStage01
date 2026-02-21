import { useMemo, useState } from 'react';
import {
  Box,
  Grid,
  Typography,
  Paper,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Chip,
  Divider,
  useTheme,
} from '@mui/material';
import {
  BarChart,
  PieChart,
  LineChart,
  DoughnutChart,
} from '../components/charts';
import { ChartThemeProvider } from '../components/charts/ChartThemeProvider';
import { useGetProductsQuery, useGetSuppliersQuery, useGetOrdersQuery, useGetMovementsQuery } from '../store/api';
import dayjs from 'dayjs';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`stats-tabpanel-${index}`}
      aria-labelledby={`stats-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function Statistics() {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [selectedPeriod, setSelectedPeriod] = useState<'3months' | '6months' | '12months'>('6months');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const { data: products = [] } = useGetProductsQuery();
  const { data: suppliers = [] } = useGetSuppliersQuery();
  const { data: orders = [] } = useGetOrdersQuery();
  const { data: movements = [] } = useGetMovementsQuery();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Data processing functions
  const getCategoryData = () => {
    const categoryData = products.reduce((acc, product) => {
      const key = product?.category ?? 'Inconnu';
      acc[key] = Number(acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(categoryData)
      .map(([category, count]) => ({ label: String(category), value: Number(count) || 0 }))
      .filter(d => Number.isFinite(d.value));
  };

  const getSupplierRatingData = () => {
    return suppliers
      .map(supplier => ({ label: supplier?.name ?? '—', value: Number(supplier?.rating ?? 0) }))
      .filter(d => Number.isFinite(d.value));
  };

  const getStockLevelData = () => {
    const inStock = products.filter(p => Number(p?.quantity ?? 0) >= 20).length;
    const low = products.filter(p => {
      const q = Number(p?.quantity ?? 0);
      return q < 20 && q > 0;
    }).length;
    const out = products.filter(p => Number(p?.quantity ?? 0) === 0).length;
    return [
      { label: 'In Stock', value: Number(inStock) || 0, color: '#4caf50' },
      { label: 'Low Stock', value: Number(low) || 0, color: '#ff9800' },
      { label: 'Out of Stock', value: Number(out) || 0, color: '#f44336' },
    ];
  };

  const getPriceRangeData = () => {
    const priceRanges = [
      { min: 0, max: 50, label: '€0-50' },
      { min: 50, max: 100, label: '€50-100' },
      { min: 100, max: 200, label: '€100-200' },
      { min: 200, max: 500, label: '€200-500' },
      { min: 500, max: Infinity, label: '€500+' },
    ];

    return priceRanges
      .map(range => ({
        label: range.label,
        value: products.filter(p => {
          const price = Number(p?.price ?? 0);
          return price >= range.min && price < range.max;
        }).length,
      }))
      .filter(d => Number.isFinite(d.value));
  };

  const getMonthlyTrendData = () => {
    const monthsCount = selectedPeriod === '3months' ? 3 : selectedPeriod === '6months' ? 6 : 12;
    const months: { key: string; label: string }[] = [];
    for (let i = monthsCount - 1; i >= 0; i--) {
      const d = dayjs().subtract(i, 'month');
      months.push({ key: d.format('YYYY-MM'), label: d.format('MMM') });
    }
    const totalsByMonth: Record<string, number> = Object.fromEntries(months.map(m => [m.key, 0]));
    orders.forEach(o => {
      const key = dayjs(o?.expectedDate ?? undefined).isValid() ? dayjs(o.expectedDate).format('YYYY-MM') : '';
      if (key in totalsByMonth) {
        totalsByMonth[key] += Number(o?.totalAmount ?? 0);
      }
    });
    return months
      .map(m => ({ label: m.label, value: Math.round(Number(totalsByMonth[m.key] ?? 0)) }))
      .filter(d => Number.isFinite(d.value));
  };

  const getFilteredProducts = () => {
    if (selectedCategory === 'all') return products;
    return products.filter(product => (product?.category ?? '') === selectedCategory);
  };

  const getTopProducts = () => {
    const filtered = getFilteredProducts();
    return [...filtered]
      .sort((a, b) => (Number(b?.price ?? 0) * Number(b?.quantity ?? 0)) - (Number(a?.price ?? 0) * Number(a?.quantity ?? 0)))
      .slice(0, 5)
      .map(product => ({
        label: product?.name ?? '—',
        value: Number(product?.price ?? 0) * Number(product?.quantity ?? 0),
      }))
      .filter(d => Number.isFinite(d.value));
  };

  const getSupplierPerformanceData = () => {
    return suppliers
      .map(supplier => ({
        label: supplier?.name ?? '—',
        value: Number(supplier?.productsCount ?? 0),
        color: Number(supplier?.rating ?? 0) >= 4.5 ? '#4caf50' : Number(supplier?.rating ?? 0) >= 4.0 ? '#ff9800' : '#f44336',
      }))
      .filter(d => Number.isFinite(d.value));
  };

  return (
    <ChartThemeProvider>
      <Box>
        <Typography variant="h4" gutterBottom>
          Statistics & Analytics
        </Typography>
        
        {/* Filters */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Time Period</InputLabel>
                <Select
                  value={selectedPeriod}
                  label="Time Period"
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                >
                  <MenuItem value="3months">Last 3 Months</MenuItem>
                  <MenuItem value="6months">Last 6 Months</MenuItem>
                  <MenuItem value="12months">Last 12 Months</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Category</InputLabel>
                <Select
                  value={selectedCategory}
                  label="Category"
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <MenuItem value="all">All Categories</MenuItem>
                  {Array.from(new Set(products.map(p => p.category))).map(category => (
                    <MenuItem key={category} value={category}>{category}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box display="flex" gap={1} flexWrap="wrap">
                <Chip label={`Total Products: ${products.length}`} color="primary" variant="outlined" />
                <Chip label={`Total Suppliers: ${suppliers.length}`} color="secondary" variant="outlined" />
                <Chip 
                  label={`Total Value: €${products.reduce((sum, p) => sum + p.price * p.quantity, 0).toLocaleString()}`} 
                  color="success" 
                  variant="outlined" 
                />
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Tabs */}
        <Paper sx={{ width: '100%' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="statistics tabs">
            <Tab label="Overview" />
            <Tab label="Products Analysis" />
            <Tab label="Supplier Performance" />
            <Tab label="Trends & Comparisons" />
          </Tabs>

          {/* Overview Tab */}
          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <PieChart
                  data={getCategoryData()}
                  title="Product Distribution by Category"
                  size={300}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <DoughnutChart
                  data={getStockLevelData()}
                  title="Inventory Status Overview"
                  size={300}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <BarChart
                  data={getPriceRangeData()}
                  title="Products by Price Range"
                  height={250}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <BarChart
                  data={getSupplierRatingData()}
                  title="Supplier Ratings Comparison"
                  height={250}
                  maxValue={5}
                />
              </Grid>
            </Grid>
          </TabPanel>

          {/* Products Analysis Tab */}
          <TabPanel value={tabValue} index={1}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <BarChart
                  data={getTopProducts()}
                  title="Top Products by Value"
                  height={300}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <PieChart
                  data={getCategoryData()}
                  title="Category Distribution"
                  size={300}
                />
              </Grid>
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Product Statistics Summary
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6} md={3}>
                        <Box textAlign="center">
                          <Typography variant="h4" color="primary">
                            {products.length}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Total Products
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <Box textAlign="center">
                          <Typography variant="h4" color="success.main">
                            {products.filter(p => p.quantity > 0).length}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            In Stock
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <Box textAlign="center">
                          <Typography variant="h4" color="warning.main">
                            {products.filter(p => p.quantity < 20 && p.quantity > 0).length}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Low Stock
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <Box textAlign="center">
                          <Typography variant="h4" color="error.main">
                            {products.filter(p => p.quantity === 0).length}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Out of Stock
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Supplier Performance Tab */}
          <TabPanel value={tabValue} index={2}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <BarChart
                  data={getSupplierPerformanceData()}
                  title="Supplier Performance by Product Count"
                  height={300}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <BarChart
                  data={getSupplierRatingData()}
                  title="Supplier Rating Comparison"
                  height={300}
                  maxValue={5}
                />
              </Grid>
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Supplier Performance Metrics
                    </Typography>
                    <Grid container spacing={2}>
                      {suppliers.map(supplier => (
                        <Grid item xs={12} sm={6} md={4} key={supplier.id}>
                          <Paper sx={{ p: 2, textAlign: 'center' }}>
                            <Typography variant="h6" gutterBottom>
                              {supplier.name}
                            </Typography>
                            <Typography variant="h4" color="primary" gutterBottom>
                              {supplier.rating.toFixed(1)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Rating
                            </Typography>
                            <Divider sx={{ my: 1 }} />
                            <Typography variant="body2">
                              {supplier.productsCount} Products
                            </Typography>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Trends & Comparisons Tab */}
          <TabPanel value={tabValue} index={3}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <LineChart
                  data={getMonthlyTrendData()}
                  title={`Sales Trend - ${selectedPeriod === '3months' ? 'Last 3 Months' : selectedPeriod === '6months' ? 'Last 6 Months' : 'Last 12 Months'}`}
                  height={300}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <DoughnutChart
                  data={getStockLevelData()}
                  title="Current Stock Distribution"
                  size={300}
                />
              </Grid>
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Trend Analysis Summary
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={4}>
                        <Box textAlign="center">
                          <Typography variant="h5" color="primary">
                            ↗️ +{Math.round(((getMonthlyTrendData()[getMonthlyTrendData().length - 1]?.value || 0) / (getMonthlyTrendData()[0]?.value || 1) - 1) * 100)}%
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Growth Rate
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Box textAlign="center">
                          <Typography variant="h5" color="success.main">
                            {getMonthlyTrendData().reduce((sum, item) => sum + item.value, 0)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Total Sales
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Box textAlign="center">
                          <Typography variant="h5" color="info.main">
                            {Math.round(getMonthlyTrendData().reduce((sum, item) => sum + item.value, 0) / getMonthlyTrendData().length)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Average Monthly
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>
        </Paper>
      </Box>
    </ChartThemeProvider>
  );
}
