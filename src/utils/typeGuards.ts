import type { ProductData, SupplierData, OrderData, OrderItem } from './api';

// Type guard for ProductData
export function isProductData(obj: unknown): obj is ProductData {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof (obj as ProductData).id === 'number' &&
    typeof (obj as ProductData).name === 'string' &&
    typeof (obj as ProductData).quantity === 'number' &&
    typeof (obj as ProductData).price === 'number' &&
    typeof (obj as ProductData).category === 'string' &&
    typeof (obj as ProductData).supplierId === 'number' &&
    typeof (obj as ProductData).description === 'string' &&
    typeof (obj as ProductData).reorderPoint === 'number'
  );
}

// Type guard for SupplierData
export function isSupplierData(obj: unknown): obj is SupplierData {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof (obj as SupplierData).id === 'number' &&
    typeof (obj as SupplierData).name === 'string' &&
    typeof (obj as SupplierData).email === 'string' &&
    typeof (obj as SupplierData).phone === 'string' &&
    typeof (obj as SupplierData).address === 'string' &&
    typeof (obj as SupplierData).rating === 'number' &&
    typeof (obj as SupplierData).productsCount === 'number' &&
    typeof (obj as SupplierData).leadTime === 'number' &&
    ['Actif', 'Surveillance', 'Suspendu'].includes((obj as SupplierData).status)
  );
}

// Type guard for OrderItem
export function isOrderItem(obj: unknown): obj is OrderItem {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof (obj as OrderItem).productId === 'number' &&
    typeof (obj as OrderItem).name === 'string' &&
    typeof (obj as OrderItem).quantity === 'number' &&
    typeof (obj as OrderItem).unitPrice === 'number'
  );
}

// Type guard for OrderData
export function isOrderData(obj: unknown): obj is OrderData {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof (obj as OrderData).id === 'number' &&
    typeof (obj as OrderData).orderNumber === 'string' &&
    typeof (obj as OrderData).supplierId === 'number' &&
    ['En préparation', 'Livré', 'En attente', 'Annulé'].includes((obj as OrderData).status) &&
    typeof (obj as OrderData).totalAmount === 'number' &&
    typeof (obj as OrderData).expectedDate === 'string' &&
    typeof (obj as OrderData).createdBy === 'number' &&
    typeof (obj as OrderData).createdAt === 'string' &&
    Array.isArray((obj as OrderData).items) &&
    (obj as OrderData).items.every(isOrderItem)
  );
}

// Type guard for sortable product fields
export function isValidSortField(field: string): field is 'name' | 'price' | 'quantity' | 'category' {
  return ['name', 'price', 'quantity', 'category'].includes(field);
}

// Type guard for supplier status
export function isValidSupplierStatus(status: string): status is 'Actif' | 'Surveillance' | 'Suspendu' {
  return ['Actif', 'Surveillance', 'Suspendu'].includes(status);
}

// Type guard for order status
export function isValidOrderStatus(status: string): status is 'En préparation' | 'Livré' | 'En attente' | 'Annulé' {
  return ['En préparation', 'Livré', 'En attente', 'Annulé'].includes(status);
}

// Type guard for API response arrays
export function isProductDataArray(obj: unknown): obj is ProductData[] {
  return Array.isArray(obj) && obj.every(isProductData);
}

export function isSupplierDataArray(obj: unknown): obj is SupplierData[] {
  return Array.isArray(obj) && obj.every(isSupplierData);
}

export function isOrderDataArray(obj: unknown): obj is OrderData[] {
  return Array.isArray(obj) && obj.every(isOrderData);
}