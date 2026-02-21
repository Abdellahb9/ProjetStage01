import React, { memo, useMemo } from 'react';
import { FixedSizeList as List } from 'react-window';
import {
  Table,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TableSortLabel,
  Checkbox,
  IconButton,
  Chip,
  Box,
  Typography,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import type { ProductData, SupplierData } from '../utils/api';

interface VirtualizedDataGridProps {
  data: ProductData[] | SupplierData[];
  height?: number;
  itemHeight?: number;
  onEdit?: (item: ProductData | SupplierData) => void;
  onDelete?: (id: number) => void;
  onSelect?: (id: number, selected: boolean) => void;
  selectedItems?: number[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (field: string) => void;
  type: 'products' | 'suppliers';
}

interface RowProps {
  index: number;
  style: React.CSSProperties;
  data: {
    items: (ProductData | SupplierData)[];
    onEdit?: (item: ProductData | SupplierData) => void;
    onDelete?: (id: number) => void;
    onSelect?: (id: number, selected: boolean) => void;
    selectedItems?: number[];
    type: 'products' | 'suppliers';
  };
}

const Row = memo(({ index, style, data }: RowProps) => {
  const { items, onEdit, onDelete, onSelect, selectedItems = [], type } = data;
  const item = items[index];
  const isSelected = selectedItems.includes(item.id);

  const handleSelect = () => {
    onSelect?.(item.id, !isSelected);
  };

  const handleEdit = () => {
    onEdit?.(item);
  };

  const handleDelete = () => {
    onDelete?.(item.id);
  };

  if (type === 'products') {
    const product = item as ProductData;
    return (
      <div style={style}>
        <TableRow
          hover
          selected={isSelected}
          sx={{
            display: 'flex',
            alignItems: 'center',
            '&:hover': {
              backgroundColor: 'action.hover',
            },
          }}
        >
          <TableCell padding="checkbox" sx={{ width: 48, flexShrink: 0 }}>
            <Checkbox
              checked={isSelected}
              onChange={handleSelect}
              color="primary"
            />
          </TableCell>
          <TableCell sx={{ width: 80, flexShrink: 0 }}>{product.id}</TableCell>
          <TableCell sx={{ minWidth: 200, flex: 1 }}>{product.name}</TableCell>
          <TableCell sx={{ width: 120, flexShrink: 0 }}>
            <Chip label={product.category} size="small" color="primary" variant="outlined" />
          </TableCell>
          <TableCell sx={{ width: 80, flexShrink: 0 }}>{product.quantity}</TableCell>
          <TableCell sx={{ width: 100, flexShrink: 0 }}>€{product.price}</TableCell>
          <TableCell sx={{ width: 150, flexShrink: 0 }}>{product.supplierId}</TableCell>
          <TableCell sx={{ width: 200, flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {product.description}
          </TableCell>
          <TableCell sx={{ width: 100, flexShrink: 0 }}>
            <IconButton onClick={handleEdit} color="primary" size="small">
              <EditIcon />
            </IconButton>
            <IconButton onClick={handleDelete} color="error" size="small">
              <DeleteIcon />
            </IconButton>
          </TableCell>
        </TableRow>
      </div>
    );
  } else {
    const supplier = item as SupplierData;
    return (
      <div style={style}>
        <TableRow
          hover
          selected={isSelected}
          sx={{
            display: 'flex',
            alignItems: 'center',
            '&:hover': {
              backgroundColor: 'action.hover',
            },
          }}
        >
          <TableCell padding="checkbox" sx={{ width: 48, flexShrink: 0 }}>
            <Checkbox
              checked={isSelected}
              onChange={handleSelect}
              color="primary"
            />
          </TableCell>
          <TableCell sx={{ width: 80, flexShrink: 0 }}>{supplier.id}</TableCell>
          <TableCell sx={{ minWidth: 200, flex: 1 }}>{supplier.name}</TableCell>
          <TableCell sx={{ width: 200, flexShrink: 0 }}>{supplier.email}</TableCell>
          <TableCell sx={{ width: 120, flexShrink: 0 }}>{supplier.phone}</TableCell>
          <TableCell sx={{ width: 80, flexShrink: 0 }}>{supplier.rating}</TableCell>
          <TableCell sx={{ width: 80, flexShrink: 0 }}>{supplier.productsCount}</TableCell>
          <TableCell sx={{ width: 100, flexShrink: 0 }}>
            <IconButton onClick={handleEdit} color="primary" size="small">
              <EditIcon />
            </IconButton>
            <IconButton onClick={handleDelete} color="error" size="small">
              <DeleteIcon />
            </IconButton>
          </TableCell>
        </TableRow>
      </div>
    );
  }
});

Row.displayName = 'Row';

const VirtualizedDataGrid = memo<VirtualizedDataGridProps>(({
  data,
  height = 400,
  itemHeight = 60,
  onEdit,
  onDelete,
  onSelect,
  selectedItems = [],
  sortBy,
  sortOrder,
  onSort,
  type,
}) => {
  const itemData = useMemo(() => ({
    items: data,
    onEdit,
    onDelete,
    onSelect,
    selectedItems,
    type,
  }), [data, onEdit, onDelete, onSelect, selectedItems, type]);

  const headers = useMemo(() => {
    if (type === 'products') {
      return [
        { id: 'id', label: 'ID', sortable: true },
        { id: 'name', label: 'Name', sortable: true },
        { id: 'category', label: 'Category', sortable: true },
        { id: 'quantity', label: 'Quantity', sortable: true },
        { id: 'price', label: 'Price', sortable: true },
        { id: 'supplierId', label: 'Supplier', sortable: true },
        { id: 'description', label: 'Description', sortable: false },
        { id: 'actions', label: 'Actions', sortable: false },
      ];
    } else {
      return [
        { id: 'id', label: 'ID', sortable: true },
        { id: 'name', label: 'Name', sortable: true },
        { id: 'email', label: 'Email', sortable: true },
        { id: 'phone', label: 'Phone', sortable: true },
        { id: 'rating', label: 'Rating', sortable: true },
        { id: 'productsCount', label: 'Products', sortable: true },
        { id: 'actions', label: 'Actions', sortable: false },
      ];
    }
  }, [type]);

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <TableContainer sx={{ height }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow sx={{ display: 'flex' }}>
              <TableCell padding="checkbox" sx={{ width: 48, flexShrink: 0 }}>
                <Checkbox
                  indeterminate={selectedItems.length > 0 && selectedItems.length < data.length}
                  checked={data.length > 0 && selectedItems.length === data.length}
                  onChange={(e) => {
                    const isChecked = e.target.checked;
                    data.forEach(item => onSelect?.(item.id, isChecked));
                  }}
                  color="primary"
                />
              </TableCell>
              {headers.map((header) => (
                <TableCell
                  key={header.id}
                  sx={{
                    width: header.id === 'name' ? '200px' : 
                           header.id === 'description' ? '200px' :
                           header.id === 'email' ? '200px' :
                           header.id === 'actions' ? '100px' : 'auto',
                    flexShrink: header.id === 'name' || header.id === 'description' || header.id === 'email' ? 0 : 1,
                  }}
                >
                  {header.sortable ? (
                    <TableSortLabel
                      active={sortBy === header.id}
                      direction={sortBy === header.id ? sortOrder : 'asc'}
                      onClick={() => onSort?.(header.id)}
                    >
                      {header.label}
                    </TableSortLabel>
                  ) : (
                    header.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
        </Table>
        <List
          height={height - 57} // Subtract header height
          itemCount={data.length}
          itemSize={itemHeight}
          itemData={itemData}
        >
          {Row}
        </List>
      </TableContainer>
      {data.length === 0 && (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height={200}
        >
          <Typography variant="body1" color="text.secondary">
            No data available
          </Typography>
        </Box>
      )}
    </Paper>
  );
});

VirtualizedDataGrid.displayName = 'VirtualizedDataGrid';

export default VirtualizedDataGrid;



