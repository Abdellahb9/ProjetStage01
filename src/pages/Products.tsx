import { useState, useEffect, useCallback } from 'react';
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  InputAdornment,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { productAPI, supplierAPI, updateSupplierProductsCount } from '../utils/api';
import type { ProductData as Product, SupplierData as Supplier } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

export default function Products() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'warning' | 'info' });

  const [formData, setFormData] = useState({
    name: '',
    quantity: '',
    price: '',
    category: '',
    supplierId: '',
    description: '',
    reorderPoint: '20',
  });

  const fetchData = useCallback(async () => {
    try {
      const [productsData, suppliersData] = await Promise.all([
        productAPI.getAll(),
        supplierAPI.getAll(),
      ]);
      setProducts(productsData);
      setSuppliers(suppliersData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenDialog = (product?: Product) => {
    if (!isAdmin) return; // Restrict to admin
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        quantity: product.quantity.toString(),
        price: product.price.toString(),
        category: product.category,
        supplierId: product.supplierId.toString(),
        description: product.description,
        reorderPoint: product.reorderPoint?.toString() || '20',
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        quantity: '',
        price: '',
        category: '',
        supplierId: '',
        description: '',
        reorderPoint: '20',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingProduct(null);
    setFormData({
      name: '',
      quantity: '',
      price: '',
      category: '',
      supplierId: '',
      description: '',
      reorderPoint: '20',
    });
  };

  const handleSubmit = async () => {
    try {
      const productData = {
        name: formData.name,
        quantity: parseInt(formData.quantity),
        price: parseFloat(formData.price),
        category: formData.category,
        supplierId: formData.supplierId,
        description: formData.description,
        reorderPoint: parseInt(formData.reorderPoint) || 20,
      };

      const oldSupplierId = editingProduct?.supplierId;
      const newSupplierId = productData.supplierId;

      if (editingProduct) {
        await productAPI.update(editingProduct.id, productData);
        setSnackbar({ open: true, message: 'Product updated successfully!', severity: 'success' });
      } else {
        await productAPI.create(productData);
        setSnackbar({ open: true, message: 'Product created successfully!', severity: 'success' });
      }

      // Refresh products first, then update productsCount
      await fetchData();
      const updatedProducts = await productAPI.getAll();
      
      // Update productsCount for both old and new suppliers if supplier changed
      if (editingProduct && oldSupplierId !== newSupplierId) {
        if (oldSupplierId) {
          await updateSupplierProductsCount(oldSupplierId, updatedProducts);
        }
        if (newSupplierId) {
          await updateSupplierProductsCount(newSupplierId, updatedProducts);
        }
      } else {
        // Update productsCount for the current supplier
        await updateSupplierProductsCount(newSupplierId, updatedProducts);
      }

      handleCloseDialog();
    } catch (error) {
      setSnackbar({ open: true, message: 'Error saving product', severity: 'error' });
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const productToDelete = products.find(p => p.id === id);
        const supplierId = productToDelete?.supplierId;
        
        await productAPI.delete(id);
        setSnackbar({ open: true, message: 'Product deleted successfully!', severity: 'success' });
        
        // Refresh products first, then update productsCount
        await fetchData();
        const updatedProducts = await productAPI.getAll();
        
        // Update productsCount for the supplier
        if (supplierId) {
          await updateSupplierProductsCount(supplierId, updatedProducts);
        }
      } catch (error) {
        setSnackbar({ open: true, message: 'Error deleting product', severity: 'error' });
      }
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(products.map(p => p.category)));

  const getSupplierName = (supplierId: any) => {
    const supplier = suppliers.find(s => s.id == supplierId);
    return supplier ? supplier.name : 'Unknown';
  };

  if (loading) {
    return <Typography>Loading products...</Typography>;
  }

  return (
    <Box display="flex" flexDirection="column" gap={4}>
      <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} alignItems={{ xs: 'flex-start', md: 'center' }} justifyContent="space-between" gap={3}>
        <Box>
          <Typography variant="overline" color="primary.main" fontWeight={700} letterSpacing={1.5}>
            Inventory
          </Typography>
          <Typography variant="h3" fontWeight={700}>
            Products Management
          </Typography>
          <Typography variant="body1" color="text.secondary" mt={1.5} maxWidth="md">
            Manage catalog, track stock levels, and keep supplier information aligned for every product.
          </Typography>
        </Box>
        {isAdmin && (
          <Button
            variant="contained"
            size="large"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{ borderRadius: 3, px: 3, py: 1.5, fontWeight: 600 }}
          >
            Add Product
          </Button>
        )}
      </Box>

      <Paper elevation={0} sx={{ p: 3, borderRadius: 4, boxShadow: 'soft', display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, alignItems: { md: 'center' } }}>
        <TextField
          placeholder="Search products, categories, or descriptions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
          sx={{ flex: 1, minWidth: 240 }}
        />
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Category</InputLabel>
          <Select
            value={selectedCategory}
            label="Category"
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <MenuItem value="">All Categories</MenuItem>
            {categories.map((category) => (
              <MenuItem key={category} value={category}>
                {category}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Paper>

      <Paper elevation={0} sx={{ borderRadius: 4, boxShadow: 'large' }}>
        <TableContainer sx={{ maxHeight: 640 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Category</TableCell>
                <TableCell align="center">Quantity</TableCell>
                <TableCell align="right">Price</TableCell>
                <TableCell>Supplier</TableCell>
                <TableCell>Description</TableCell>
                {isAdmin && <TableCell align="center">Actions</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id} hover>
                  <TableCell>
                    <Typography fontWeight={600}>{product.id}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography fontWeight={600}>{product.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      SKU-{product.id}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={product.category} size="small" color="primary" sx={{ borderRadius: 2 }} />
                  </TableCell>
                  <TableCell align="center">
                    <Typography fontWeight={600}>{product.quantity}</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography fontWeight={600}>€{(product.price ?? 0).toFixed(2)}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography>{getSupplierName(product.supplierId)}</Typography>
                  </TableCell>
                  <TableCell sx={{ maxWidth: 240 }}>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {product.description}
                    </Typography>
                  </TableCell>
                  {isAdmin && (
                    <TableCell align="center">
                      <IconButton onClick={() => handleOpenDialog(product)} color="primary" size="small">
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(product.id)} color="error" size="small">
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {isAdmin && (
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {editingProduct ? 'Edit Product' : 'Add New Product'}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Box display="flex" flexDirection="column" gap={2.5} mt={1}>
            <TextField
              label="Product Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
              required
            />
            <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={2.5}>
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
                  startAdornment: (
                    <InputAdornment position="start">
                      €
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
            <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={2.5}>
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
              rows={4}
            />
            <TextField
              label="Point de réapprovisionnement"
              type="number"
              value={formData.reorderPoint}
              onChange={(e) => setFormData({ ...formData, reorderPoint: e.target.value })}
              fullWidth
              helperText="Seuil d'alerte pour le stock faible"
              inputProps={{ min: 0 }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" sx={{ borderRadius: 3, px: 3 }}>
            {editingProduct ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
      )}

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
}
