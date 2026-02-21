import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from './index';
import type { ProductData, SupplierData } from '../utils/api';

// Base selectors
export const selectProducts = (state: RootState) => state.inventory.products;
export const selectSuppliers = (state: RootState) => state.inventory.suppliers;
export const selectUI = (state: RootState) => state.inventory.ui;
export const selectFilters = (state: RootState) => state.inventory.filters;

// Product selectors
export const selectAllProducts = createSelector(
  [selectProducts],
  (products) => products.allIds.map(id => products.byId[id])
);

export const selectProductById = (id: number) => createSelector(
  [selectProducts],
  (products) => products.byId[id]
);

export const selectProductsLoading = createSelector(
  [selectProducts],
  (products) => products.loading
);

export const selectProductsError = createSelector(
  [selectProducts],
  (products) => products.error
);

// Supplier selectors
export const selectAllSuppliers = createSelector(
  [selectSuppliers],
  (suppliers) => suppliers.allIds.map(id => suppliers.byId[id])
);

export const selectSupplierById = (id: number) => createSelector(
  [selectSuppliers],
  (suppliers) => suppliers.byId[id]
);

export const selectSuppliersLoading = createSelector(
  [selectSuppliers],
  (suppliers) => suppliers.loading
);

export const selectSuppliersError = createSelector(
  [selectSuppliers],
  (suppliers) => suppliers.error
);

// Filtered and sorted products
export const selectFilteredProducts = createSelector(
  [selectAllProducts, selectUI, selectFilters],
  (products, ui, filters) => {
    return products.filter(product => {
      // Search term filter
      const matchesSearch = !ui.searchTerm || 
        product.name.toLowerCase().includes(ui.searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(ui.searchTerm.toLowerCase());

      // Category filter
      const matchesCategory = !ui.selectedCategory || product.category === ui.selectedCategory;

      // Supplier filter
      const matchesSupplier = !ui.selectedSupplierId || product.supplierId === ui.selectedSupplierId;

      // Price range filter
      const matchesPriceRange = product.price >= filters.priceRange[0] && 
        product.price <= filters.priceRange[1];

      // Stock status filter
      let matchesStockStatus = true;
      if (filters.stockStatus === 'inStock') {
        matchesStockStatus = product.quantity >= 20;
      } else if (filters.stockStatus === 'lowStock') {
        matchesStockStatus = product.quantity > 0 && product.quantity < 20;
      } else if (filters.stockStatus === 'outOfStock') {
        matchesStockStatus = product.quantity === 0;
      }

      // Supplier IDs filter
      const matchesSupplierFilter = filters.supplierIds.length === 0 || 
        filters.supplierIds.includes(product.supplierId);

      return matchesSearch && matchesCategory && matchesSupplier && 
             matchesPriceRange && matchesStockStatus && matchesSupplierFilter;
    });
  }
);

export const selectSortedProducts = createSelector(
  [selectFilteredProducts, selectUI],
  (products, ui) => {
    return [...products].sort((a, b) => {
      let aValue: string | number = a[ui.sortBy as keyof ProductData];
      let bValue: string | number = b[ui.sortBy as keyof ProductData];

      // Handle string comparison
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = (bValue as string).toLowerCase();
      }

      if (aValue < bValue) {
        return ui.sortOrder === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return ui.sortOrder === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }
);

export const selectPaginatedProducts = createSelector(
  [selectSortedProducts, selectUI],
  (products, ui) => {
    const startIndex = (ui.page - 1) * ui.pageSize;
    const endIndex = startIndex + ui.pageSize;
    return {
      products: products.slice(startIndex, endIndex),
      totalCount: products.length,
      totalPages: Math.ceil(products.length / ui.pageSize),
      currentPage: ui.page,
      pageSize: ui.pageSize,
    };
  }
);

// Dashboard statistics
export const selectDashboardStats = createSelector(
  [selectAllProducts, selectAllSuppliers],
  (products, suppliers) => {
    const totalProducts = products.length;
    const totalSuppliers = suppliers.length;
    const totalValue = products.reduce((sum, product) => sum + product.price * product.quantity, 0);
    const lowStockProducts = products.filter(product => product.quantity < 20).length;
    const outOfStockProducts = products.filter(product => product.quantity === 0).length;
    const topRatedSuppliers = suppliers.filter(supplier => supplier.rating >= 4.5).length;

    return {
      totalProducts,
      totalSuppliers,
      totalValue,
      lowStockProducts,
      outOfStockProducts,
      topRatedSuppliers,
    };
  }
);

// Recent products (last 5)
export const selectRecentProducts = createSelector(
  [selectAllProducts],
  (products) => products.slice(0, 5)
);

// Top suppliers (by rating)
export const selectTopSuppliers = createSelector(
  [selectAllSuppliers],
  (suppliers) => [...suppliers]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 3)
);

// Category distribution
export const selectCategoryDistribution = createSelector(
  [selectAllProducts],
  (products) => {
    const categoryData = products.reduce((acc, product) => {
      acc[product.category] = (acc[product.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(categoryData).map(([category, count]) => ({
      label: category,
      value: count,
    }));
  }
);

// Stock level distribution
export const selectStockLevelDistribution = createSelector(
  [selectAllProducts],
  (products) => {
    const inStock = products.filter(p => p.quantity >= 20).length;
    const lowStock = products.filter(p => p.quantity > 0 && p.quantity < 20).length;
    const outOfStock = products.filter(p => p.quantity === 0).length;

    return [
      { label: 'In Stock', value: inStock, color: '#4caf50' },
      { label: 'Low Stock', value: lowStock, color: '#ff9800' },
      { label: 'Out of Stock', value: outOfStock, color: '#f44336' },
    ];
  }
);

// Price range distribution
export const selectPriceRangeDistribution = createSelector(
  [selectAllProducts],
  (products) => {
    const priceRanges = [
      { min: 0, max: 50, label: '€0-50' },
      { min: 50, max: 100, label: '€50-100' },
      { min: 100, max: 200, label: '€100-200' },
      { min: 200, max: 500, label: '€200-500' },
      { min: 500, max: Infinity, label: '€500+' },
    ];

    return priceRanges.map(range => ({
      label: range.label,
      value: products.filter(p => p.price >= range.min && p.price < range.max).length,
    }));
  }
);

// Supplier performance data
export const selectSupplierPerformance = createSelector(
  [selectAllSuppliers],
  (suppliers) => suppliers.map(supplier => ({
    label: supplier.name,
    value: supplier.productsCount,
    color: supplier.rating >= 4.5 ? '#4caf50' : supplier.rating >= 4.0 ? '#ff9800' : '#f44336',
  }))
);

// Supplier ratings data
export const selectSupplierRatings = createSelector(
  [selectAllSuppliers],
  (suppliers) => suppliers.map(supplier => ({
    label: supplier.name,
    value: supplier.rating,
  }))
);



