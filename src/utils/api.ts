const API_BASE_URL = 'http://localhost:3001';

export interface ProductData {
  id: number;
  name: string;
  quantity: number;
  price: number;
  category: string;
  supplierId: number;
  description: string;
  reorderPoint: number;
}

export interface SupplierData {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  rating: number;
  productsCount: number;
  leadTime: number;
  status: 'Actif' | 'Surveillance' | 'Suspendu';
}

export interface Category {
  id: number;
  name: string;
  description: string;
}

export interface OrderItem {
  productId: number;
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface OrderData {
  id: number;
  orderNumber: string;
  supplierId: number;
  status: 'En préparation' | 'Livré' | 'En attente' | 'Annulé';
  totalAmount: number;
  expectedDate: string;
  createdBy: number;
  createdAt: string;
  items: OrderItem[];
}

export interface InventoryMovement {
  id: number;
  productId: number;
  type: 'IN' | 'OUT';
  quantity: number;
  reference: string;
  date: string;
  notes: string;
}

// Utility functions for ID normalization and data transformation
export function normalizeId(id: string | number | null | undefined): number {
  if (id === null || id === undefined) {
    throw new Error('ID cannot be null or undefined');
  }
  if (typeof id === 'number') {
    return id;
  }
  if (typeof id === 'string') {
    const parsed = parseInt(id, 10);
    if (isNaN(parsed)) {
      throw new Error(`Invalid ID format: ${id}`);
    }
    return parsed;
  }
  throw new Error(`Invalid ID type: ${typeof id}`);
}

export function populateOrderItemFromProduct(item: OrderItem, product: ProductData | undefined): OrderItem {
  if (!product) {
    return item;
  }
  return {
    ...item,
    name: item.name || product.name,
    unitPrice: item.unitPrice || product.price,
    productId: item.productId || product.id,
  };
}

export function calculateOrderTotal(items: OrderItem[]): number {
  return items.reduce((sum, item) => {
    if (item.productId && item.quantity > 0 && item.unitPrice > 0) {
      return sum + item.quantity * item.unitPrice;
    }
    return sum;
  }, 0);
}

export function transformOrderData(order: OrderData, products: ProductData[]): OrderData {
  // Fix missing order item fields from product data
  const fixedItems = order.items.map(item => {
    if (!item.productId || item.name === '' || item.unitPrice === 0) {
      const product = products.find(p => p.id === item.productId);
      if (product) {
        return populateOrderItemFromProduct(item, product);
      }
      // Remove items with null productId
      return null;
    }
    return item;
  }).filter((item): item is OrderItem => item !== null);

  // Recalculate totalAmount
  const totalAmount = calculateOrderTotal(fixedItems);

  return {
    ...order,
    items: fixedItems,
    totalAmount: order.totalAmount || totalAmount,
  };
}

export function calculateSupplierProductsCount(supplierId: number, products: ProductData[]): number {
  return products.filter(p => p.supplierId === supplierId).length;
}

export async function updateSupplierProductsCount(supplierId: number, products: ProductData[]): Promise<void> {
  const productsCount = calculateSupplierProductsCount(supplierId, products);
  try {
    await putData<SupplierData>('suppliers', supplierId, { productsCount });
  } catch (error) {
    console.error(`Error updating productsCount for supplier ${supplierId}:`, error);
  }
}

// Generic API functions
async function fetchData<T>(endpoint: string): Promise<T[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/${endpoint}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    return [];
  }
}

async function fetchSingle<T>(endpoint: string): Promise<T | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/${endpoint}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    return null;
  }
}

async function postData<T>(endpoint: string, data: Omit<T, 'id'>): Promise<T | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error(`Error posting to ${endpoint}:`, error);
    return null;
  }
}

async function putData<T>(endpoint: string, id: number, data: Partial<T>): Promise<T | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/${endpoint}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error(`Error updating ${endpoint}/${id}:`, error);
    return null;
  }
}

async function deleteData(endpoint: string, id: number): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/${endpoint}/${id}`, {
      method: 'DELETE',
    });
    return response.ok;
  } catch (error) {
    console.error(`Error deleting ${endpoint}/${id}:`, error);
    return false;
  }
}

// Product API functions
export const productAPI = {
  getAll: () => fetchData<ProductData>('products'),
  getById: (id: number) => fetchSingle<ProductData>(`products/${id}`),
  create: (data: Omit<ProductData, 'id'>) => postData<ProductData>('products', data),
  update: (id: number, data: Partial<ProductData>) => putData<ProductData>('products', id, data),
  delete: (id: number) => deleteData('products', id),
};

// Supplier API functions
export const supplierAPI = {
  getAll: () => fetchData<SupplierData>('suppliers'),
  getById: (id: number) => fetchSingle<SupplierData>(`suppliers/${id}`),
  create: (data: Omit<SupplierData, 'id'>) => postData<SupplierData>('suppliers', data),
  update: (id: number, data: Partial<SupplierData>) => putData<SupplierData>('suppliers', id, data),
  delete: (id: number) => deleteData('suppliers', id),
};

// Category API functions
export const categoryAPI = {
  getAll: () => fetchData<Category>('categories'),
};

// Orders API functions
export const orderAPI = {
  getAll: async (): Promise<OrderData[]> => {
    const orders = await fetchData<OrderData>('orders');
    const products = await fetchData<ProductData>('products');
    return orders.map(order => transformOrderData(order, products));
  },
  getById: async (id: number): Promise<OrderData | null> => {
    const order = await fetchSingle<OrderData>(`orders/${id}`);
    if (!order) return null;
    const products = await fetchData<ProductData>('products');
    return transformOrderData(order, products);
  },
  create: (data: Omit<OrderData, 'id'>) => postData<OrderData>('orders', data),
  update: (id: number, data: Partial<OrderData>) => putData<OrderData>('orders', id, data),
  delete: (id: number) => deleteData('orders', id),
};

// Inventory movement API
export const movementAPI = {
  getAll: () => fetchData<InventoryMovement>('inventoryMovements'),
  create: (data: Omit<InventoryMovement, 'id'>) => postData<InventoryMovement>('inventoryMovements', data),
};

