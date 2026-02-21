import { useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Card,
  CardContent,
  Stack,
  IconButton,
  Tooltip,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
} from '@mui/material';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Select, FormControl, InputLabel, Snackbar, Alert } from '@mui/material';
import {
  Star as StarIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  Refresh as RefreshIcon,
  Launch as LaunchIcon,
} from '@mui/icons-material';
import { useGetSuppliersQuery, useCreateSupplierMutation, useUpdateSupplierMutation, useDeleteSupplierMutation, useGetProductsQuery } from '../store/api';
import { useAuth } from '../contexts/AuthContext';
import { calculateSupplierProductsCount } from '../utils/api';

const statusColors: Record<string, 'default' | 'success' | 'warning' | 'error'> = {
  Actif: 'success',
  Surveillance: 'warning',
  Suspendu: 'error',
};

export default function Suppliers() {
  const { data: suppliers = [], refetch } = useGetSuppliersQuery();
  const { data: products = [] } = useGetProductsQuery();
  const { user } = useAuth();
  const [createSupplier, { isLoading: isCreating }] = useCreateSupplierMutation();
  const [updateSupplier, { isLoading: isUpdating }] = useUpdateSupplierMutation();
  const [deleteSupplier, { isLoading: isDeleting }] = useDeleteSupplierMutation();
  const [selectedSupplierId, setSelectedSupplierId] = useState<number | null>(null);
  const [openCreate, setOpenCreate] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    rating: 4,
    productsCount: 0,
    leadTime: 7,
    status: 'Actif' as 'Actif' | 'Surveillance' | 'Suspendu',
  });
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({ open: false, message: '', severity: 'success' });

  // Calculate productsCount dynamically as fallback if DB value is missing or 0
  const suppliersWithCalculatedCount = useMemo(() => {
    return suppliers.map(supplier => {
      const calculatedCount = calculateSupplierProductsCount(supplier.id, products);
      return {
        ...supplier,
        productsCount: supplier.productsCount > 0 ? supplier.productsCount : calculatedCount,
      };
    });
  }, [suppliers, products]);

  const activeSuppliers = suppliersWithCalculatedCount.filter(s => s.status === 'Actif').length;
  const averageRating = suppliersWithCalculatedCount.length ? (suppliersWithCalculatedCount.reduce((sum, supplier) => sum + Number(supplier?.rating ?? 0), 0) / suppliersWithCalculatedCount.length).toFixed(1) : '0.0';
  const averageLeadTime = suppliersWithCalculatedCount.length ? Math.round(suppliersWithCalculatedCount.reduce((sum, supplier) => sum + Number(supplier?.leadTime ?? 0), 0) / suppliersWithCalculatedCount.length) : 0;

  const selectedSupplier = useMemo(() => suppliersWithCalculatedCount.find(s => s.id === selectedSupplierId) ?? null, [suppliersWithCalculatedCount, selectedSupplierId]);

  const isAdmin = user?.role === 'admin';

  const handleStatusChange = async (supplierId: number, newStatus: 'Actif' | 'Surveillance' | 'Suspendu') => {
    try {
      await updateSupplier({ id: supplierId, supplier: { status: newStatus } }).unwrap();
      setSnackbar({ open: true, message: 'Statut fournisseur mis à jour.', severity: 'success' });
      await refetch();
    } catch (e) {
      setSnackbar({ open: true, message: 'Échec de la mise à jour du statut.', severity: 'error' });
    }
  };

  const handleCreate = async () => {
    try {
      await createSupplier({ ...form }).unwrap();
      setOpenCreate(false);
      setForm({ name: '', email: '', phone: '', address: '', rating: 4, productsCount: 0, leadTime: 7, status: 'Actif' });
      setSnackbar({ open: true, message: 'Fournisseur ajouté.', severity: 'success' });
      await refetch();
    } catch (e) {
      setSnackbar({ open: true, message: 'Échec de l\'ajout du fournisseur.', severity: 'error' });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteSupplier(id).unwrap();
      if (selectedSupplierId === id) setSelectedSupplierId(null);
      setSnackbar({ open: true, message: 'Fournisseur supprimé.', severity: 'success' });
      await refetch();
    } catch (e) {
      setSnackbar({ open: true, message: 'Échec de la suppression (produits associés ?).', severity: 'error' });
    }
  };

  return (
    <Box display="flex" flexDirection="column" gap={4}>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ borderRadius: 4, boxShadow: 'soft' }}>
            <CardContent>
              <Typography variant="overline" color="primary.main" fontWeight={700} letterSpacing={1.5}>
                Réseau fournisseurs
              </Typography>
              <Typography variant="h4" fontWeight={700}>
                {suppliers.length} partenaires
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {activeSuppliers} actifs · Délais moyens {averageLeadTime} jours
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ borderRadius: 4, boxShadow: 'soft' }}>
            <CardContent>
              <Typography variant="overline" color="primary.main" fontWeight={700} letterSpacing={1.5}>
                Satisfaction globale
              </Typography>
              <Box display="flex" alignItems="center" gap={1}>
                <Typography variant="h4" fontWeight={700}>
                  {averageRating}
                </Typography>
                <StarIcon sx={{ color: '#ffc107', fontSize: 28 }} />
              </Box>
              <Typography variant="body2" color="text.secondary">
                Basé sur les évaluations fournisseurs
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ borderRadius: 4, boxShadow: 'soft' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="overline" color="primary.main" fontWeight={700} letterSpacing={1.5}>
                    Actualisation
                  </Typography>
                  <Typography variant="h4" fontWeight={700}>
                    Suivi temps réel
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Mettez à jour le statut et suivez les performances
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1}>
                  <Tooltip title="Rafraîchir les données">
                    <IconButton onClick={() => refetch()}>
                      <RefreshIcon />
                    </IconButton>
                  </Tooltip>
                  {isAdmin && (
                    <Button variant="contained" onClick={() => setOpenCreate(true)}>
                      Ajouter un fournisseur
                    </Button>
                  )}
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper elevation={0} sx={{ borderRadius: 4, boxShadow: 'large' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Fournisseur</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Adresse</TableCell>
                <TableCell align="center">Produits</TableCell>
                <TableCell align="center">Lead time</TableCell>
                <TableCell align="center">Statut</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {suppliersWithCalculatedCount.map((supplier) => (
                <TableRow key={supplier.id} hover selected={supplier.id === selectedSupplierId} onClick={() => setSelectedSupplierId(supplier.id)} sx={{ cursor: 'pointer' }}>
                  <TableCell>
                    <Typography fontWeight={600}>{supplier.name}</Typography>
                    <Stack direction="row" spacing={1} alignItems="center" mt={0.5}>
                      <StarIcon sx={{ fontSize: 18, color: '#ffc107' }} />
                      <Typography variant="body2" color="text.secondary">
                        {Number(supplier?.rating ?? 0).toFixed(1)} / 5
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Stack spacing={0.5}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <EmailIcon fontSize="small" />
                        <Typography variant="body2">{supplier.email}</Typography>
                      </Stack>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <PhoneIcon fontSize="small" />
                        <Typography variant="body2">{supplier.phone}</Typography>
                      </Stack>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <LocationIcon fontSize="small" />
                      <Typography variant="body2" color="text.secondary">
                        {supplier.address}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell align="center">{supplier.productsCount}</TableCell>
                  <TableCell align="center">{supplier.leadTime} jours</TableCell>
                  <TableCell align="center">
                    {isAdmin ? (
                      <FormControl size="small" sx={{ minWidth: 160 }}>
                        <InputLabel id={`status-${supplier.id}`}>Statut</InputLabel>
                        <Select
                          labelId={`status-${supplier.id}`}
                          label="Statut"
                          value={supplier.status}
                          onChange={(e) => handleStatusChange(supplier.id, e.target.value as 'Actif' | 'Surveillance' | 'Inactif')}
                          disabled={isUpdating}
                        >
                          <MenuItem value="Actif">Actif</MenuItem>
                          <MenuItem value="Surveillance">Surveillance</MenuItem>
                          <MenuItem value="Suspendu">Suspendu</MenuItem>
                        </Select>
                      </FormControl>
                    ) : (
                      <Chip label={supplier.status} color={statusColors[supplier.status] ?? 'default'} size="small" sx={{ borderRadius: 2 }} />
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={1} justifyContent="center">
                      <Tooltip title="Ouvrir la fiche">
                        <IconButton>
                          <LaunchIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {isAdmin && (
                        <Tooltip title="Supprimer le fournisseur">
                          <span>
                            <IconButton color="error" disabled={isDeleting} onClick={(e) => { e.stopPropagation(); handleDelete(supplier.id); }}>
                              {/* Using LaunchIcon as placeholder if no Delete icon imported earlier */}
                              <LaunchIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {selectedSupplier && (
        <Paper elevation={0} sx={{ p: 3, borderRadius: 4, boxShadow: 'large' }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems={{ md: 'center' }} justifyContent="space-between">
            <Box>
              <Typography variant="h6" fontWeight={700}>
                {selectedSupplier.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedSupplier.address}
              </Typography>
            </Box>
            <Stack direction="row" spacing={2}>
              <Chip label={`${selectedSupplier.productsCount} produits`} color="primary" sx={{ borderRadius: 2 }} />
              <Chip label={`Lead time ${selectedSupplier.leadTime} jours`} color="info" sx={{ borderRadius: 2 }} />
            </Stack>
          </Stack>
        </Paper>
      )}

      {/* Dialog: Create Supplier (Admin) */}
      <Dialog open={openCreate} onClose={() => setOpenCreate(false)} fullWidth maxWidth="sm">
        <DialogTitle>Ajouter un fournisseur</DialogTitle>
        <DialogContent sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mt: 1 }}>
          <TextField label="Nom" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} fullWidth />
          <TextField label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} fullWidth />
          <TextField label="Téléphone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} fullWidth />
          <TextField label="Adresse" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} fullWidth sx={{ gridColumn: { sm: '1 / -1' } }} />
          <TextField label="Note (0-5)" type="number" inputProps={{ min: 0, max: 5, step: 0.1 }} value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })} fullWidth />
          <TextField label="Lead time (jours)" type="number" inputProps={{ min: 0 }} value={form.leadTime} onChange={(e) => setForm({ ...form, leadTime: Number(e.target.value) })} fullWidth />
          <FormControl fullWidth>
            <InputLabel id="status-new">Statut</InputLabel>
            <Select labelId="status-new" label="Statut" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as 'Actif' | 'Surveillance' | 'Suspendu' })}>
              <MenuItem value="Actif">Actif</MenuItem>
              <MenuItem value="Surveillance">Surveillance</MenuItem>
              <MenuItem value="Suspendu">Suspendu</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreate(false)}>Annuler</Button>
          <Button variant="contained" onClick={handleCreate} disabled={isCreating || !form.name || !form.email}>Créer</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
