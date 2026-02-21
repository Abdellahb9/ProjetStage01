import { useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Stack,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
} from '@mui/material';
import { ArrowDownward, ArrowUpward } from '@mui/icons-material';
import dayjs from 'dayjs';
import { useGetMovementsQuery, useGetProductsQuery } from '../store/api';

const typeConfig = {
  IN: { label: 'Entrée', color: 'success', icon: ArrowDownward },
  OUT: { label: 'Sortie', color: 'error', icon: ArrowUpward },
} as const;

export default function InventoryMovements() {
  const { data: movements = [] } = useGetMovementsQuery();
  const { data: products = [] } = useGetProductsQuery();

  const productsById = useMemo(() => Object.fromEntries(products.map(p => [p.id, p])), [products]);

  return (
    <Box display="flex" flexDirection="column" gap={3}>
      <Paper elevation={0} sx={{ p: 3, borderRadius: 4, boxShadow: 'soft' }}>
        <Typography variant="overline" color="primary.main" fontWeight={700} letterSpacing={1.5}>
          Traçabilité
        </Typography>
        <Typography variant="h4" fontWeight={700}>
          Historique des mouvements
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={1}>
          Visualisez toutes les entrées et sorties de stock avec leur référence d'origine.
        </Typography>
      </Paper>

      <Paper elevation={0} sx={{ borderRadius: 4, boxShadow: 'large' }}>
        <List disablePadding>
          {movements.map((movement) => {
            const product = productsById[movement.productId];
            const config = typeConfig[movement.type];
            const Icon = config.icon;

            return (
              <ListItem key={movement.id} divider sx={{ py: 2.5, px: 3 }}>
                <ListItemIcon sx={{ minWidth: 56 }}>
                  <Avatar sx={{ bgcolor: `${config.color}.light`, color: `${config.color}.dark` }}>
                    <Icon />
                  </Avatar>
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} gap={2}>
                      <Box>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography variant="h6" fontWeight={700}>
                            {product?.name ?? 'Produit inconnu'}
                          </Typography>
                          <Chip label={config.label} color={config.color} size="small" sx={{ borderRadius: 2 }} />
                        </Stack>
                        <Typography variant="body2" color="text.secondary">
                          Mouvement #{movement.reference} · {movement.notes}
                        </Typography>
                      </Box>
                      <Box textAlign={{ xs: 'left', sm: 'right' }}>
                        <Typography variant="h6" fontWeight={700}>
                          {movement.quantity} unités
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {dayjs(movement.date).format('DD MMM YYYY')}
                        </Typography>
                      </Box>
                    </Stack>
                  }
                />
              </ListItem>
            );
          })}
        </List>
      </Paper>
    </Box>
  );
}
