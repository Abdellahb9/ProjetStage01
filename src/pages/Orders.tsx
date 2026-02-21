import { useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Stack,
  Button,
  Divider,
  IconButton,
  Tooltip,
  Skeleton,
} from '@mui/material';
import { Download as DownloadIcon, Refresh as RefreshIcon, Visibility as VisibilityIcon } from '@mui/icons-material';
import dayjs from 'dayjs';
import { useGetOrdersQuery, useGetSuppliersQuery, useUpdateOrderMutation, useCreateOrderMutation, useGetProductsQuery } from '../store/api';
import { useAuth } from '../contexts/AuthContext';
import { MenuItem, Select, FormControl, InputLabel, Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import { calculateOrderTotal, populateOrderItemFromProduct, transformOrderData } from '../utils/api';

const statusColors: Record<string, 'default' | 'success' | 'warning' | 'error' | 'info'> = {
  'Livré': 'success',
  'En préparation': 'warning',
  'En attente': 'info',
  'Annulé': 'error',
};

export default function Orders() {
  const { data: orders = [], isLoading, refetch } = useGetOrdersQuery();
  const { data: suppliers = [] } = useGetSuppliersQuery();
  const { data: products = [] } = useGetProductsQuery();
  const { user } = useAuth();
  const [updateOrder, { isLoading: isUpdating }] = useUpdateOrderMutation();
  const [createOrder, { isLoading: isCreating }] = useCreateOrderMutation();
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [statusSaving, setStatusSaving] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>(
    { open: false, message: '', severity: 'success' }
  );
  const [openCreate, setOpenCreate] = useState(false);
  const [newOrder, setNewOrder] = useState<{
    supplierId: number | string | '';
    expectedDate: string;
    customerName: string;
    customerPhone: string;
    customerAddress: string;
    items: { productId: number | ''; name: string; unitPrice: number; quantity: number }[];
  }>({ supplierId: '', expectedDate: '', customerName: '', customerPhone: '', customerAddress: '', items: [{ productId: '', name: '', unitPrice: 0, quantity: 1 }] });

  const canAdminEdit = user?.role === 'admin';
  // Transform orders to fix missing fields and recalculate totals
  const transformedOrders = useMemo(() => {
    return orders.map(order => transformOrderData(order, products));
  }, [orders, products]);
  const displayedOrders = useMemo(() => (canAdminEdit ? transformedOrders : transformedOrders.filter(o => o.createdBy === user?.id)), [transformedOrders, canAdminEdit, user]);
  const selectedOrder = useMemo(() => displayedOrders.find(order => order.id === selectedOrderId) ?? null, [displayedOrders, selectedOrderId]);

  const getSupplierName = (supplierId: number) => suppliers.find(s => s.id === supplierId)?.name ?? '—';

  const handleStatusChange = async (newStatus: 'En préparation' | 'Livré' | 'En attente' | 'Annulé') => {
    if (!selectedOrder) return;
    try {
      setStatusSaving(true);
      // Recalculate totalAmount if order items might have changed
      const recalculatedTotal = calculateOrderTotal(selectedOrder.items || []);
      await updateOrder({ 
        id: selectedOrder.id, 
        order: { 
          status: newStatus,
          totalAmount: recalculatedTotal > 0 ? recalculatedTotal : selectedOrder.totalAmount
        } 
      }).unwrap();
      setSnackbar({ open: true, message: 'Statut de la commande mis à jour.', severity: 'success' });
      await refetch();
    } catch (e) {
      setSnackbar({ open: true, message: "Échec de la mise à jour du statut.", severity: 'error' });
    } finally {
      setStatusSaving(false);
    }
  };

  const openCreateDialog = () => {
    setNewOrder({ supplierId: '', expectedDate: dayjs().add(7, 'day').format('YYYY-MM-DD'), customerName: '', customerPhone: '', customerAddress: '', items: [{ productId: '', name: '', unitPrice: 0, quantity: 1 }] });
    setOpenCreate(true);
  };

  const handleItemChange = (index: number, field: 'productId' | 'quantity') => (e: any) => {
    const value = field === 'quantity' ? Number(e.target.value) : e.target.value;
    const items = [...newOrder.items];
    if (field === 'productId') {
      // Don't validate if empty selection
      if (!value || value === '') {
        items[index] = { productId: '', name: '', unitPrice: 0, quantity: items[index].quantity };
        setNewOrder({ ...newOrder, items });
        return;
      }
      const productId = Number(value);
      // Compare with both number and string IDs
      const product = products.find(p => p.id === productId || p.id === String(productId));
      if (!product) {
        // Still update the state but show warning
        console.warn('Product not found:', productId, 'Available products:', products.map(p => ({ id: p.id, name: p.name })));
        items[index] = { productId: '', name: '', unitPrice: 0, quantity: items[index].quantity };
        setNewOrder({ ...newOrder, items });
        return;
      }
      const populatedItem = populateOrderItemFromProduct(
        { productId: productId, name: '', unitPrice: 0, quantity: items[index].quantity },
        product
      );
      items[index] = populatedItem;
    } else {
      const numValue = typeof value === 'number' ? value : Number(value);
      items[index] = { ...items[index], quantity: Number.isNaN(numValue) ? 1 : Math.max(1, numValue) };
    }
    setNewOrder({ ...newOrder, items });
  };

  const addOrderItem = () => {
    setNewOrder({ ...newOrder, items: [...newOrder.items, { productId: '', name: '', unitPrice: 0, quantity: 1 }] });
  };

  const removeOrderItem = (index: number) => {
    const items = newOrder.items.filter((_, i) => i !== index);
    setNewOrder({ ...newOrder, items: items.length ? items : [{ productId: '', name: '', unitPrice: 0, quantity: 1 }] });
  };

  const computeTotal = () => newOrder.items
    .filter(i => i.productId !== '' && i.quantity > 0)
    .reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);

  const submitCreateOrder = async () => {
    try {
      // Validate supplierId
      if (!newOrder.supplierId || newOrder.supplierId === '') {
        setSnackbar({ open: true, message: 'Veuillez sélectionner un fournisseur.', severity: 'error' });
        return;
      }
      if (!newOrder.expectedDate) {
        setSnackbar({ open: true, message: 'Veuillez sélectionner une date.', severity: 'error' });
        return;
      }
      if (!newOrder.customerName.trim()) {
        setSnackbar({ open: true, message: 'Veuillez entrer votre nom complet.', severity: 'error' });
        return;
      }
      if (!newOrder.customerPhone.trim()) {
        setSnackbar({ open: true, message: 'Veuillez entrer votre numéro de téléphone.', severity: 'error' });
        return;
      }
      if (!newOrder.customerAddress.trim()) {
        setSnackbar({ open: true, message: 'Veuillez entrer votre adresse.', severity: 'error' });
        return;
      }
      // Validate and filter items - ensure no null productIds
      const validItems = newOrder.items
        .filter(i => i.productId !== '' && i.productId !== null && i.quantity > 0)
        .map(i => {
          const productId = Number(i.productId);
          if (isNaN(productId)) {
            throw new Error('Invalid productId');
          }
          // Compare with both number and string IDs
          const product = products.find(p => p.id === productId || p.id === String(productId));
          if (!product) {
            throw new Error(`Product with id ${productId} not found`);
          }
          // Ensure name and unitPrice are populated from product
          const populatedItem = populateOrderItemFromProduct(
            { productId, name: i.name, unitPrice: i.unitPrice, quantity: i.quantity },
            product
          );
          return populatedItem;
        });
      
      if (validItems.length === 0) {
        setSnackbar({ open: true, message: 'Ajoutez au moins un article valide.', severity: 'error' });
        return;
      }
      
      // Calculate totalAmount
      const totalAmount = calculateOrderTotal(validItems);
      
      const payload = {
        orderNumber: `ORD-${Date.now()}`,
        supplierId: typeof newOrder.supplierId === 'string' ? newOrder.supplierId : Number(newOrder.supplierId),
        status: 'En attente' as const,
        totalAmount,
        expectedDate: newOrder.expectedDate,
        customerName: newOrder.customerName,
        customerPhone: newOrder.customerPhone,
        customerAddress: newOrder.customerAddress,
        createdBy: user!.id,
        createdAt: dayjs().toISOString(),
        items: validItems,
      };
      await createOrder(payload).unwrap();
      setOpenCreate(false);
      setSnackbar({ open: true, message: 'Commande créée.', severity: 'success' });
      await refetch();
    } catch (e: unknown) {
      setSnackbar({ open: true, message: `Échec de la création de la commande: ${e instanceof Error ? e.message : 'Erreur inconnue'}`, severity: 'error' });
    }
  };

  return (
    <Box display="grid" gridTemplateColumns={{ xs: '1fr', xl: '1.8fr 1fr' }} gap={4}>
      <Box display="flex" flexDirection="column" gap={3}>
        <Paper elevation={0} sx={{ p: 3, borderRadius: 4, boxShadow: 'soft', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="overline" color="primary.main" fontWeight={700} letterSpacing={1.5}>
              Approvisionnement
            </Typography>
            <Typography variant="h4" fontWeight={700}>
              Bons de commande
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={1}>
              Suivez l'état des commandes fournisseurs et anticipez vos réceptions.
            </Typography>
          </Box>
          <Stack direction="row" spacing={1.5}>
            <Button startIcon={<RefreshIcon />} variant="outlined" onClick={() => refetch()}>
              Rafraîchir
            </Button>
            {!canAdminEdit && (
              <Button variant="contained" onClick={openCreateDialog} disabled={isCreating}>
                Passer une commande
              </Button>
            )}
            <Button startIcon={<DownloadIcon />} variant="contained">
              Exporter
            </Button>
          </Stack>
        </Paper>

        <Paper elevation={0} sx={{ borderRadius: 4, boxShadow: 'large' }}>
          {isLoading ? (
            <Box p={4} display="flex" flexDirection="column" gap={2}>
              <Skeleton variant="rectangular" height={48} />
              <Skeleton variant="rectangular" height={48} />
              <Skeleton variant="rectangular" height={48} />
            </Box>
          ) : (
            <TableContainer sx={{ maxHeight: 520 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Commande</TableCell>
                    <TableCell>Fournisseur</TableCell>
                    <TableCell align="center">Articles</TableCell>
                    <TableCell align="right">Montant</TableCell>
                    <TableCell>Date prévue</TableCell>
                    <TableCell align="center">Statut</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow
                      key={order.id}
                      hover
                      selected={order.id === selectedOrderId}
                      onClick={() => setSelectedOrderId(order.id)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell>
                        <Typography fontWeight={600}>{order.orderNumber}</Typography>
                      </TableCell>
                      <TableCell>{getSupplierName(order.supplierId)}</TableCell>
                      <TableCell align="center">{order.items?.length ?? 0}</TableCell>
                      <TableCell align="right">€{Number(order.totalAmount ?? 0).toLocaleString()}</TableCell>
                      <TableCell>{dayjs(order.expectedDate).format('DD MMM YYYY')}</TableCell>
                      <TableCell align="center">
                        <Chip
                          label={order.status}
                          color={statusColors[order.status] ?? 'default'}
                          size="small"
                          sx={{ borderRadius: 2 }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Voir le détail">
                          <IconButton size="small">
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Box>

      <Paper elevation={0} sx={{ p: 3, borderRadius: 4, boxShadow: 'large', minHeight: 360 }}>
        {selectedOrder ? (
          <Stack spacing={3}>
            <Box>
              <Typography variant="overline" color="primary.main" fontWeight={700} letterSpacing={2}>
                Détail
              </Typography>
              <Typography variant="h6" fontWeight={700}>
                {selectedOrder.orderNumber}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Fournisseur : {getSupplierName(selectedOrder.supplierId)}
              </Typography>
              {(selectedOrder as any).customerName && (
                <Box mt={2}>
                  <Typography variant="body2" fontWeight={600} color="text.primary">
                    Informations client :
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Nom : {(selectedOrder as any).customerName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Téléphone : {(selectedOrder as any).customerPhone}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Adresse : {(selectedOrder as any).customerAddress}
                  </Typography>
                </Box>
              )}
            </Box>

            <Divider />

            <Stack spacing={1.5}>
              {(selectedOrder?.items ?? []).map((item, index) => (
                <Box key={index} display="flex" alignItems="center" justifyContent="space-between" p={1.5} borderRadius={3} sx={{ background: 'rgba(0,0,0,0.02)' }}>
                  <Box>
                    <Typography fontWeight={600}>{item.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.quantity} unités × €{item.unitPrice}
                    </Typography>
                  </Box>
                  <Typography fontWeight={600}>
                    €{Number((item?.quantity ?? 0) * (item?.unitPrice ?? 0)).toLocaleString()}
                  </Typography>
                </Box>
              ))}
            </Stack>

            <Divider />

            <Stack spacing={1}>
              <Typography variant="body2" color="text.secondary">
                Statut :
              </Typography>
              {canAdminEdit ? (
                <FormControl size="small" sx={{ width: 260 }} disabled={isUpdating || statusSaving}>
                  <InputLabel id="order-status-label">Statut</InputLabel>
                  <Select
                    labelId="order-status-label"
                    label="Statut"
                    value={selectedOrder.status}
                    onChange={(e) => handleStatusChange(e.target.value as 'En préparation' | 'Livré' | 'En attente' | 'Annulé')}
                  >
                    <MenuItem value="En préparation">En préparation</MenuItem>
                    <MenuItem value="En attente">En attente</MenuItem>
                    <MenuItem value="Livré">Livré</MenuItem>
                    <MenuItem value="Annulé">Annulé</MenuItem>
                  </Select>
                </FormControl>
              ) : (
                <Chip label={selectedOrder.status} color={statusColors[selectedOrder.status] ?? 'default'} sx={{ alignSelf: 'flex-start', borderRadius: 2 }} />
              )}
              <Typography variant="body2" color="text.secondary">
                Réception estimée : {dayjs(selectedOrder.expectedDate).format('DD MMM YYYY')}
              </Typography>
              <Typography variant="h6" fontWeight={700}>
                Total : €{Number(selectedOrder.totalAmount ?? 0).toLocaleString()}
              </Typography>
            </Stack>
          </Stack>
        ) : (
          <Box textAlign="center" py={10} color="text.secondary">
            <Typography variant="h6" fontWeight={600} mb={1}>
              Sélectionnez une commande
            </Typography>
            <Typography variant="body2">
              Consultez le détail des articles, montants et dates prévues pour chaque bon de commande.
            </Typography>
          </Box>
        )}
      </Paper>
      {/* Dialog: Create Order (User) */}
      <Dialog open={openCreate} onClose={() => setOpenCreate(false)} fullWidth maxWidth="md">
        <DialogTitle>Passer une commande</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <Typography variant="subtitle1" fontWeight={600} color="primary.main" mt={1}>
            Informations client
          </Typography>
          <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={2}>
            <TextField
              label="Nom complet"
              value={newOrder.customerName}
              onChange={(e) => setNewOrder({ ...newOrder, customerName: e.target.value })}
              required
              fullWidth
            />
            <TextField
              label="Numéro de téléphone"
              value={newOrder.customerPhone}
              onChange={(e) => setNewOrder({ ...newOrder, customerPhone: e.target.value })}
              required
              fullWidth
            />
          </Box>
          <TextField
            label="Adresse complète"
            value={newOrder.customerAddress}
            onChange={(e) => setNewOrder({ ...newOrder, customerAddress: e.target.value })}
            required
            fullWidth
            multiline
            rows={2}
          />
          <Typography variant="subtitle1" fontWeight={600} color="primary.main" mt={2}>
            Détails de la commande
          </Typography>
          <FormControl fullWidth>
            <InputLabel id="supplier-select">Fournisseur</InputLabel>
            <Select
              labelId="supplier-select"
              label="Fournisseur"
              value={newOrder.supplierId || ''}
              onChange={(e) => setNewOrder({ ...newOrder, supplierId: e.target.value })}
            >
              <MenuItem value="">Sélectionnez un fournisseur</MenuItem>
              {suppliers.map(s => (
                <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Date prévue"
            type="date"
            value={newOrder.expectedDate}
            onChange={(e) => setNewOrder({ ...newOrder, expectedDate: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
          {newOrder.items.map((it, idx) => {
            const itemTotal = Number(it?.quantity ?? 0) * Number(it?.unitPrice ?? 0);
            return (
              <Box key={idx} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: '2fr 1fr 1fr 1fr' }} gap={2} alignItems="center" mb={2}>
                  <FormControl fullWidth>
                    <InputLabel id={`prod-${idx}`}>Produit</InputLabel>
                    <Select
                      labelId={`prod-${idx}`}
                      label="Produit"
                      value={it.productId}
                      onChange={handleItemChange(idx, 'productId')}
                    >
                      <MenuItem value="">Sélectionnez un produit</MenuItem>
                      {products.map(p => (
                        <MenuItem key={p.id} value={p.id}>{p.name} — €{p.price}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <TextField
                    label="Quantité"
                    type="number"
                    value={it.quantity}
                    onChange={handleItemChange(idx, 'quantity')}
                    inputProps={{ min: 1 }}
                  />
                  <Box>
                    <Typography variant="body2" color="text.secondary">Prix unitaire</Typography>
                    <Typography fontWeight={600} color="primary.main">
                      €{Number(it?.unitPrice ?? 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Sous-total</Typography>
                    <Typography variant="h6" fontWeight={700} color="success.main">
                      €{itemTotal.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Typography>
                  </Box>
                </Box>
                <Box display="flex" justifyContent="flex-end">
                  <Button color="error" size="small" onClick={() => removeOrderItem(idx)} disabled={newOrder.items.length === 1}>
                    Supprimer
                  </Button>
                </Box>
              </Box>
            );
          })}
          <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mt: 2, p: 2, bgcolor: 'primary.light', borderRadius: 2 }}>
            <Button onClick={addOrderItem}>Ajouter un article</Button>
            <Typography variant="h5" fontWeight={700} color="primary.main">
              Total: €{computeTotal().toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreate(false)}>Annuler</Button>
          <Button variant="contained" onClick={submitCreateOrder} disabled={isCreating}>Créer</Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
