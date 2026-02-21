import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import VirtualizedDataGrid from '../VirtualizedDataGrid';
import type { ProductData, SupplierData } from '../../utils/api';

// Mock react-window
jest.mock('react-window', () => ({
  FixedSizeList: ({ children, itemCount }: { children: (props: { index: number; style: React.CSSProperties }) => React.ReactNode; itemCount: number }) => (
    <div data-testid="virtualized-list">
      {Array.from({ length: Math.min(itemCount, 5) }, (_, index) => 
        children({ index, style: {} })
      )}
    </div>
  ),
}));

const mockProducts: ProductData[] = [
  {
    id: 1,
    name: 'Test Product 1',
    quantity: 10,
    price: 100,
    category: 'Electronics',
    supplierId: 1,
    description: 'Test description 1',
    reorderPoint: 5,
  },
  {
    id: 2,
    name: 'Test Product 2',
    quantity: 20,
    price: 200,
    category: 'Clothing',
    supplierId: 2,
    description: 'Test description 2',
    reorderPoint: 10,
  },
];

const mockSuppliers: SupplierData[] = [
  {
    id: 1,
    name: 'Test Supplier 1',
    email: 'supplier1@test.com',
    phone: '123-456-7890',
    address: '123 Test St',
    rating: 4.5,
    productsCount: 5,
    leadTime: 7,
    status: 'Actif',
  },
  {
    id: 2,
    name: 'Test Supplier 2',
    email: 'supplier2@test.com',
    phone: '098-765-4321',
    address: '456 Test Ave',
    rating: 3.8,
    productsCount: 3,
    leadTime: 14,
    status: 'Surveillance',
  },
];

const createMockStore = () => {
  return configureStore({
    reducer: {
      inventory: (state = { products: { byId: {}, allIds: [] }, suppliers: { byId: {}, allIds: [] } }) => state,
    },
  });
};

describe('VirtualizedDataGrid', () => {
  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();
  const mockOnSelect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders products grid correctly', () => {
    const store = createMockStore();
    
    render(
      <Provider store={store}>
        <VirtualizedDataGrid
          data={mockProducts}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onSelect={mockOnSelect}
          type="products"
        />
      </Provider>
    );

    expect(screen.getByText('ID')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Category')).toBeInTheDocument();
    expect(screen.getByText('Quantity')).toBeInTheDocument();
    expect(screen.getByText('Price')).toBeInTheDocument();
    expect(screen.getByText('Supplier')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });

  it('renders suppliers grid correctly', () => {
    const store = createMockStore();
    
    render(
      <Provider store={store}>
        <VirtualizedDataGrid
          data={mockSuppliers}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onSelect={mockOnSelect}
          type="suppliers"
        />
      </Provider>
    );

    expect(screen.getByText('ID')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Phone')).toBeInTheDocument();
    expect(screen.getByText('Rating')).toBeInTheDocument();
    expect(screen.getByText('Products')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });

  it('handles edit button click', () => {
    const store = createMockStore();
    
    render(
      <Provider store={store}>
        <VirtualizedDataGrid
          data={mockProducts}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onSelect={mockOnSelect}
          type="products"
        />
      </Provider>
    );

    const editButtons = screen.getAllByLabelText('edit');
    fireEvent.click(editButtons[0]);
    
    expect(mockOnEdit).toHaveBeenCalledWith(mockProducts[0]);
  });

  it('handles delete button click', () => {
    const store = createMockStore();
    
    render(
      <Provider store={store}>
        <VirtualizedDataGrid
          data={mockProducts}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onSelect={mockOnSelect}
          type="products"
        />
      </Provider>
    );

    const deleteButtons = screen.getAllByLabelText('delete');
    fireEvent.click(deleteButtons[0]);
    
    expect(mockOnDelete).toHaveBeenCalledWith(mockProducts[0].id);
  });

  it('handles checkbox selection', () => {
    const store = createMockStore();
    
    render(
      <Provider store={store}>
        <VirtualizedDataGrid
          data={mockProducts}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onSelect={mockOnSelect}
          type="products"
        />
      </Provider>
    );

    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[1]); // First item checkbox (skip header)
    
    expect(mockOnSelect).toHaveBeenCalledWith(mockProducts[0].id, true);
  });

  it('handles select all checkbox', () => {
    const store = createMockStore();
    
    render(
      <Provider store={store}>
        <VirtualizedDataGrid
          data={mockProducts}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onSelect={mockOnSelect}
          type="products"
        />
      </Provider>
    );

    const selectAllCheckbox = screen.getAllByRole('checkbox')[0];
    fireEvent.click(selectAllCheckbox);
    
    expect(mockOnSelect).toHaveBeenCalledWith(mockProducts[0].id, true);
    expect(mockOnSelect).toHaveBeenCalledWith(mockProducts[1].id, true);
  });

  it('displays no data message when empty', () => {
    const store = createMockStore();
    
    render(
      <Provider store={store}>
        <VirtualizedDataGrid
          data={[]}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onSelect={mockOnSelect}
          type="products"
        />
      </Provider>
    );

    expect(screen.getByText('No data available')).toBeInTheDocument();
  });

  it('handles sorting', () => {
    const mockOnSort = jest.fn();
    const store = createMockStore();
    
    render(
      <Provider store={store}>
        <VirtualizedDataGrid
          data={mockProducts}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onSelect={mockOnSelect}
          onSort={mockOnSort}
          sortBy="name"
          sortOrder="asc"
          type="products"
        />
      </Provider>
    );

    const nameHeader = screen.getByText('Name');
    fireEvent.click(nameHeader);
    
    expect(mockOnSort).toHaveBeenCalledWith('name');
  });

  it('shows selected items correctly', () => {
    const store = createMockStore();
    const selectedItems = [1];
    
    render(
      <Provider store={store}>
        <VirtualizedDataGrid
          data={mockProducts}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onSelect={mockOnSelect}
          selectedItems={selectedItems}
          type="products"
        />
      </Provider>
    );

    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes[1]).toBeChecked(); // First item should be checked
    expect(checkboxes[2]).not.toBeChecked(); // Second item should not be checked
  });
});



