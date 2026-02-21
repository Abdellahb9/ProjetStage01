import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { ProductData, SupplierData } from '../utils/api';

interface InventoryState {
  products: {
    byId: Record<number, ProductData>;
    allIds: number[];
    loading: boolean;
    error: string | null;
  };
  suppliers: {
    byId: Record<number, SupplierData>;
    allIds: number[];
    loading: boolean;
    error: string | null;
  };
  ui: {
    selectedProductId: number | null;
    searchTerm: string;
    selectedCategory: string;
    selectedSupplierId: number | null;
    sortBy: 'name' | 'price' | 'quantity' | 'category';
    sortOrder: 'asc' | 'desc';
    page: number;
    pageSize: number;
  };
  filters: {
    priceRange: [number, number];
    stockStatus: 'all' | 'inStock' | 'lowStock' | 'outOfStock';
    supplierIds: number[];
  };
}

const initialState: InventoryState = {
  products: {
    byId: {},
    allIds: [],
    loading: false,
    error: null,
  },
  suppliers: {
    byId: {},
    allIds: [],
    loading: false,
    error: null,
  },
  ui: {
    selectedProductId: null,
    searchTerm: '',
    selectedCategory: '',
    selectedSupplierId: null,
    sortBy: 'name',
    sortOrder: 'asc',
    page: 1,
    pageSize: 25,
  },
  filters: {
    priceRange: [0, 10000],
    stockStatus: 'all',
    supplierIds: [],
  },
};

const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    setProducts: (state, action: PayloadAction<ProductData[]>) => {
      const products = action.payload;
      state.products.byId = products.reduce((acc, product) => {
        acc[product.id] = product;
        return acc;
      }, {} as Record<number, ProductData>);
      state.products.allIds = products.map(p => p.id);
      state.products.loading = false;
      state.products.error = null;
    },
    setSuppliers: (state, action: PayloadAction<SupplierData[]>) => {
      const suppliers = action.payload;
      state.suppliers.byId = suppliers.reduce((acc, supplier) => {
        acc[supplier.id] = supplier;
        return acc;
      }, {} as Record<number, SupplierData>);
      state.suppliers.allIds = suppliers.map(s => s.id);
      state.suppliers.loading = false;
      state.suppliers.error = null;
    },
    updateProduct: (state, action: PayloadAction<ProductData>) => {
      const product = action.payload;
      state.products.byId[product.id] = product;
    },
    updateSupplier: (state, action: PayloadAction<SupplierData>) => {
      const supplier = action.payload;
      state.suppliers.byId[supplier.id] = supplier;
    },
    removeProduct: (state, action: PayloadAction<number>) => {
      const productId = action.payload;
      delete state.products.byId[productId];
      state.products.allIds = state.products.allIds.filter(id => id !== productId);
    },
    removeSupplier: (state, action: PayloadAction<number>) => {
      const supplierId = action.payload;
      delete state.suppliers.byId[supplierId];
      state.suppliers.allIds = state.suppliers.allIds.filter(id => id !== supplierId);
    },
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.ui.searchTerm = action.payload;
      state.ui.page = 1; // Reset to first page when searching
    },
    setSelectedCategory: (state, action: PayloadAction<string>) => {
      state.ui.selectedCategory = action.payload;
      state.ui.page = 1;
    },
    setSelectedSupplier: (state, action: PayloadAction<number | null>) => {
      state.ui.selectedSupplierId = action.payload;
      state.ui.page = 1;
    },
    setSorting: (state, action: PayloadAction<{ sortBy: 'name' | 'price' | 'quantity' | 'category'; sortOrder: 'asc' | 'desc' }>) => {
      state.ui.sortBy = action.payload.sortBy;
      state.ui.sortOrder = action.payload.sortOrder;
      state.ui.page = 1;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.ui.page = action.payload;
    },
    setPageSize: (state, action: PayloadAction<number>) => {
      state.ui.pageSize = action.payload;
      state.ui.page = 1;
    },
    setPriceRange: (state, action: PayloadAction<[number, number]>) => {
      state.filters.priceRange = action.payload;
      state.ui.page = 1;
    },
    setStockStatus: (state, action: PayloadAction<'all' | 'inStock' | 'lowStock' | 'outOfStock'>) => {
      state.filters.stockStatus = action.payload;
      state.ui.page = 1;
    },
    setSupplierFilter: (state, action: PayloadAction<number[]>) => {
      state.filters.supplierIds = action.payload;
      state.ui.page = 1;
    },
    setLoading: (state, action: PayloadAction<{ type: 'products' | 'suppliers'; loading: boolean }>) => {
      if (action.payload.type === 'products') {
        state.products.loading = action.payload.loading;
      } else {
        state.suppliers.loading = action.payload.loading;
      }
    },
    setError: (state, action: PayloadAction<{ type: 'products' | 'suppliers'; error: string | null }>) => {
      if (action.payload.type === 'products') {
        state.products.error = action.payload.error;
      } else {
        state.suppliers.error = action.payload.error;
      }
    },
    clearFilters: (state) => {
      state.ui.searchTerm = '';
      state.ui.selectedCategory = '';
      state.ui.selectedSupplierId = null;
      state.filters.priceRange = [0, 10000];
      state.filters.stockStatus = 'all';
      state.filters.supplierIds = [];
      state.ui.page = 1;
    },
  },
});

export const {
  setProducts,
  setSuppliers,
  updateProduct,
  updateSupplier,
  removeProduct,
  removeSupplier,
  setSearchTerm,
  setSelectedCategory,
  setSelectedSupplier,
  setSorting,
  setPage,
  setPageSize,
  setPriceRange,
  setStockStatus,
  setSupplierFilter,
  setLoading,
  setError,
  clearFilters,
} = inventorySlice.actions;

export default inventorySlice.reducer;

