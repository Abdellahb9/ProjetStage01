import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { ProductData, SupplierData, OrderData, InventoryMovement, Category } from '../utils/api';

const API_BASE_URL = 'http://localhost:3001';

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('authToken');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Product', 'Supplier', 'Category', 'Order', 'Movement'],
  endpoints: (builder) => ({
    // Products
    getProducts: builder.query<ProductData[], void>({
      query: () => 'products',
      providesTags: ['Product'],
    }),
    getProduct: builder.query<ProductData, number>({
      query: (id) => `products/${id}`,
      providesTags: (result, error, id) => [{ type: 'Product', id }],
    }),
    createProduct: builder.mutation<ProductData, Omit<ProductData, 'id'>>({
      query: (product) => ({
        url: 'products',
        method: 'POST',
        body: product,
      }),
      invalidatesTags: ['Product'],
    }),
    updateProduct: builder.mutation<ProductData, { id: number; product: Partial<ProductData> }>({
      query: ({ id, product }) => ({
        url: `products/${id}`,
        method: 'PUT',
        body: product,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Product', id }],
    }),
    deleteProduct: builder.mutation<void, number>({
      query: (id) => ({
        url: `products/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Product', id }],
    }),

    // Suppliers
    getSuppliers: builder.query<SupplierData[], void>({
      query: () => 'suppliers',
      providesTags: ['Supplier'],
    }),
    getSupplier: builder.query<SupplierData, number>({
      query: (id) => `suppliers/${id}`,
      providesTags: (result, error, id) => [{ type: 'Supplier', id }],
    }),
    createSupplier: builder.mutation<SupplierData, Omit<SupplierData, 'id'>>({
      query: (supplier) => ({
        url: 'suppliers',
        method: 'POST',
        body: supplier,
      }),
      invalidatesTags: ['Supplier'],
    }),
    updateSupplier: builder.mutation<SupplierData, { id: number; supplier: Partial<SupplierData> }>({
      query: ({ id, supplier }) => ({
        url: `suppliers/${id}`,
        method: 'PATCH',
        body: supplier,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Supplier', id }],
    }),
    deleteSupplier: builder.mutation<void, number>({
      query: (id) => ({
        url: `suppliers/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Supplier', id }],
    }),

    // Categories
    getCategories: builder.query<Category[], void>({
      query: () => 'categories',
      providesTags: ['Category'],
    }),

    // Orders
    getOrders: builder.query<OrderData[], void>({
      query: () => 'orders',
      providesTags: ['Order'],
    }),
    getOrder: builder.query<OrderData, number>({
      query: (id) => `orders/${id}`,
      providesTags: (result, error, id) => [{ type: 'Order', id }],
    }),
    createOrder: builder.mutation<OrderData, Omit<OrderData, 'id'>>({
      query: (order) => ({
        url: 'orders',
        method: 'POST',
        body: order,
      }),
      invalidatesTags: ['Order', 'Product'],
    }),
    updateOrder: builder.mutation<OrderData, { id: number; order: Partial<OrderData> }>({
      query: ({ id, order }) => ({
        url: `orders/${id}`,
        method: 'PATCH',
        body: order,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Order', id },
        'Order',
        'Product',
        'Movement',
      ],
    }),
    deleteOrder: builder.mutation<void, number>({
      query: (id) => ({
        url: `orders/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Order'],
    }),

    // Inventory movements
    getMovements: builder.query<InventoryMovement[], void>({
      query: () => 'inventoryMovements',
      providesTags: ['Movement'],
    }),
    createMovement: builder.mutation<InventoryMovement, Omit<InventoryMovement, 'id'>>({
      query: (movement) => ({
        url: 'inventoryMovements',
        method: 'POST',
        body: movement,
      }),
      invalidatesTags: ['Movement', 'Product'],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useGetSuppliersQuery,
  useGetSupplierQuery,
  useCreateSupplierMutation,
  useUpdateSupplierMutation,
  useDeleteSupplierMutation,
  useGetCategoriesQuery,
  useGetOrdersQuery,
  useGetOrderQuery,
  useCreateOrderMutation,
  useUpdateOrderMutation,
  useDeleteOrderMutation,
  useGetMovementsQuery,
  useCreateMovementMutation,
} = api;



