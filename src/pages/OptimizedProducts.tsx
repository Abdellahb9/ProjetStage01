import React, { memo, useState, useCallback, useMemo } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Alert,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Paper,
  Grid,
  Pagination,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  selectPaginatedProducts,
  selectAllSuppliers,
  selectProductsLoading,
  selectProductsError,
  selectUI,
} from '../store/selectors';
import {
  useGetProductsQuery,
  useGetSuppliersQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} from '../store/api';
import {
  setSearchTerm,
  setSelectedCategory,
  setSorting,
  setPage,
  setPageSize,
  clearFilters,
} from '../store/inventorySlice';
import VirtualizedDataGrid from '../components/VirtualizedDataGrid';
import { usePerformanceMonitor } from '../hooks/usePerformanceMonitor';
import type { ProductData, SupplierData } from '../utils/api';

const ProductForm = memo(({ 
  product, 
  suppliers, 
  onSave, 
  onCancel 
}: {
  product?: ProductData;
  suppliers: SupplierData[];
  onSave: (data: Omit<ProductData, 'id'>) => void;
  onCancel: () => void;
}) => {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    quantity: product?.quantity?.toString() || '',
    price: product?.price?.toString() || '',
    category: product?.category || '',
    supplierId: product?.supplierId?.toString() || '',
    description: product?.description || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name: formData.name,
      quantity: parseInt(formData.quantity),
      price: parseFloat(formData.price),
      category: formData.category,
      supplierId: formData.supplierId,
      description: formData.description,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Box display="flex" flexDirection="column" gap={2} mt={1}>
        <TextField
          label="Product Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          fullWidth
          required
        />
        <Box display="flex" gap={2}>
          <TextField
            label="Quantity"
            type="number"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
            fullWidth
            required
          />
          <TextField
            label="Price"
            type="number"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            fullWidth
            required
            InputProps={{
              startAdornment: <Typography>€</Typography>,
            }}
          />
        </Box>
        <Box display="flex" gap={2}>
          <TextField
            label="Category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            fullWidth
            required
          />
          <FormControl fullWidth required>
            <InputLabel>Supplier</InputLabel>
            <Select
              value={formData.supplierId || ''}
              label="Supplier"
              onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
            >
              <MenuItem value="">Select a supplier</MenuItem>
              {suppliers.map((supplier) => (
                <MenuItem key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <TextField
          label="Description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          fullWidth
          multiline
          rows={3}
        />
      </Box>
      <DialogActions>
        <Button onClick={onCancel}>Cancel</Button>
        <Button type="submit" variant="contained">
          {product ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </form>
  );
});

ProductForm.displayName = 'ProductForm';

const OptimizedProducts = memo(() => {
  const dispatch = useAppDispatch();
  const { measureRenderTime } = usePerformanceMonitor({
    componentName: 'Products',
    logToConsole: process.env.NODE_ENV === 'development',
  });

  // State
  const [openDialog, setOpenDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductData | null>(null);
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' as 'success' | 'error' | 'warning' | 'info' 
  });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [showFilters, setShowFilters] = useState(false);

  // Redux selectors
  const paginatedProducts = useAppSelector(selectPaginatedProducts);
  const loading = useAppSelector(selectProductsLoading);
  const error = useAppSelector(selectProductsError);
  const ui = useAppSelector(selectUI);

  // RTK Query hooks
  const { data: allProducts = [] } = useGetProductsQuery();
  const { data: allSuppliers = [] } = useGetSuppliersQuery();
  const [createProduct] = useCreateProductMutation();
  const [updateProduct] = useUpdateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();

  // Measure render time
  const endRenderMeasurement = measureRenderTime();

  // Memoized handlers
  const handleOpenDialog = useCallback((product?: ProductData) => {
    setEditingProduct(product || null);
    setOpenDialog(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setOpenDialog(false);
    setEditingProduct(null);
  }, []);

  const handleSave = useCallback(async (data: Omit<ProductData, 'id'>) => {
    try {
      if (editingProduct) {
        await updateProduct({ id: editingProduct.id, product: data }).unwrap();
        setSnackbar({ open: true, message: 'Product updated successfully!', severity: 'success' });
      } else {
        await createProduct(data).unwrap();
        setSnackbar({ open: true, message: 'Product created successfully!', severity: 'success' });
      }
      handleCloseDialog();
    } catch {
      setSnackbar({ 
        open: true, 
        message: 'Error saving product', 
        severity: 'error' 
      });
    }
  }, [editingProduct, createProduct, updateProduct, handleCloseDialog]);

  const handleDelete = useCallback(async (id: number) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(id).unwrap();
        setSnackbar({ open: true, message: 'Product deleted successfully!', severity: 'success' });
      } catch {
        setSnackbar({ open: true, message: 'Error deleting product', severity: 'error' });
      }
    }
  }, [deleteProduct]);

  const handleSearch = useCallback((term: string) => {
    dispatch(setSearchTerm(term));
  }, [dispatch]);

  const handleCategoryChange = useCallback((category: string) => {
    dispatch(setSelectedCategory(category));
  }, [dispatch]);

  const handleSort = useCallback((field: string) => {
    const newOrder = ui.sortBy === field && ui.sortOrder === 'asc' ? 'desc' : 'asc';
    dispatch(setSorting({ sortBy: field, sortOrder: newOrder }));
  }, [dispatch, ui.sortBy, ui.sortOrder]);

  const handlePageChange = useCallback((page: number) => {
    dispatch(setPage(page));
  }, [dispatch]);

  const handlePageSizeChange = useCallback((pageSize: number) => {
    dispatch(setPageSize(pageSize));
  }, [dispatch]);

  const handleClearFilters = useCallback(() => {
    dispatch(clearFilters());
  }, [dispatch]);

  // Memoized categories
  const categories = useMemo(() => {
    return Array.from(new Set(allProducts.map(p => p.category)));
  }, [allProducts]);

  // Memoized supplier lookup
  const getSupplierName = useCallback((supplierId: any) => {
    const supplier = allSuppliers.find(s => s.id == supplierId);
    return supplier ? supplier.name : 'Unknown';
  }, [allSuppliers]);

  // Measure render time
  React.useEffect(() => {
    endRenderMeasurement();
  }, [endRenderMeasurement]);

  if (loading) {
    return <Box>Loading products...</Box>;
  }

  if (error) {
    return (
      <Alert severity="error">
        Failed to load products: {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Products Management</Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<FilterIcon />}
            onClick={() => setShowFilters(!showFilters)}
          >
            Filters
          </Button>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(_, newMode) => newMode && setViewMode(newMode)}
            size="small"
          >
            <ToggleButton value="list">
              <ViewListIcon />
            </ToggleButton>
            <ToggleButton value="grid">
              <ViewModuleIcon />
            </ToggleButton>
          </ToggleButtonGroup>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Product
          </Button>
        </Box>
      </Box>

      {/* Search and Filter */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              placeholder="Search products..."
              value={ui.searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={ui.selectedCategory}
                label="Category"
                onChange={(e) => handleCategoryChange(e.target.value)}
              >
                <MenuItem value="">All Categories</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Page Size</InputLabel>
              <Select
                value={ui.pageSize}
                label="Page Size"
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              >
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={25}>25</MenuItem>
                <MenuItem value={50}>50</MenuItem>
                <MenuItem value={100}>100</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box display="flex" gap={1}>
              <Button onClick={handleClearFilters} size="small">
                Clear Filters
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Products Display */}
      {viewMode === 'list' ? (
        <VirtualizedDataGrid
          data={paginatedProducts.products}
          height={600}
          onEdit={handleOpenDialog}
          onDelete={handleDelete}
          sortBy={ui.sortBy}
          sortOrder={ui.sortOrder}
          onSort={handleSort}
          type="products"
        />
      ) : (
        <Grid container spacing={2}>
          {paginatedProducts.products.map((product) => (
            <Grid item xs={12} sm={6} md={4} key={product.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {product.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {product.category}
                  </Typography>
                  <Typography variant="h6" color="primary">
                    €{product.price}
                  </Typography>
                  <Typography variant="body2">
                    Qty: {product.quantity}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Supplier: {getSupplierName(product.supplierId)}
                  </Typography>
                  <Box display="flex" justifyContent="flex-end" mt={2}>
                    <IconButton onClick={() => handleOpenDialog(product)} color="primary">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(product.id)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Pagination */}
      <Box display="flex" justifyContent="center" mt={3}>
        <Pagination
          count={paginatedProducts.totalPages}
          page={ui.page}
          onChange={(_, page) => handlePageChange(page)}
          color="primary"
        />
      </Box>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingProduct ? 'Edit Product' : 'Add New Product'}
        </DialogTitle>
        <DialogContent>
          <ProductForm
            product={editingProduct || undefined}
            suppliers={allSuppliers}
            onSave={handleSave}
            onCancel={handleCloseDialog}
          />
        </DialogContent>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
});

OptimizedProducts.displayName = 'OptimizedProducts';

export default OptimizedProducts;



