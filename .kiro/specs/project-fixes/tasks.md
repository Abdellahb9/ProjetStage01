# Implementation Plan

- [x] 1. Install missing Jest dependencies and fix test configuration
  - Install required Jest and testing library packages
  - Fix Jest configuration for TypeScript and React
  - Verify test setup works correctly
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [ ] 2. Fix ESLint errors systematically
- [x] 2.1 Remove unused imports and variables
  - Clean up all unused imports across all files
  - Remove unused variables and function parameters
  - _Requirements: 2.2_

- [x] 2.2 Replace any types with proper TypeScript interfaces
  - Define proper interfaces for API responses and component props
  - Replace all `any` types with specific types
  - Add type guards where necessary
  - _Requirements: 2.3_

- [x] 2.3 Fix React hooks dependency warnings
  - Fix useEffect dependency arrays
  - Resolve ref cleanup warnings in StarfieldBackground
  - _Requirements: 2.4_

- [ ] 2.4 Remove unnecessary try/catch wrappers and fix component exports
  - Remove useless try/catch blocks in AuthContext
  - Fix component export patterns for fast refresh
  - _Requirements: 2.5_

- [ ] 3. Implement order data consistency fixes
- [ ] 3.1 Create order data transformation utilities
  - Implement transformOrderData function improvements
  - Add order item validation and population logic
  - Create calculateOrderTotal function enhancements
  - _Requirements: 3.1, 3.2, 3.3_

- [ ] 3.2 Fix order display and calculation issues
  - Update Orders page to use transformed data correctly
  - Fix order total calculations in UI components
  - Handle missing or invalid order item data
  - _Requirements: 3.4, 3.5_

- [ ] 4. Fix supplier product count management
- [ ] 4.1 Implement supplier count calculation utilities
  - Enhance calculateSupplierProductsCount function
  - Add updateSupplierProductsCount improvements
  - Create sync functions for all supplier counts
  - _Requirements: 4.1, 4.2, 4.3_

- [ ] 4.2 Update supplier display and management
  - Fix Suppliers page to show accurate product counts
  - Update product CRUD operations to maintain supplier counts
  - Add fallback calculations for missing database values
  - _Requirements: 4.4_

- [ ] 5. Enhance CRUD operations and error handling
- [ ] 5.1 Improve product management operations
  - Fix product creation and update validation
  - Ensure proper error handling in Products page
  - Add proper TypeScript types for form data
  - _Requirements: 5.1, 5.2, 5.3_

- [ ] 5.2 Enhance order management operations
  - Fix order creation validation and error handling
  - Improve order status update functionality
  - Add proper error messages for failed operations
  - _Requirements: 5.4, 5.5_

- [ ]* 6. Add comprehensive unit tests
- [ ]* 6.1 Write tests for data transformation utilities
  - Test transformOrderData function
  - Test calculateOrderTotal function
  - Test supplier count calculation functions
  - _Requirements: 3.1, 3.2, 4.1_

- [ ]* 6.2 Write tests for API utility functions
  - Test error handling in API functions
  - Test data validation functions
  - Test CRUD operation functions
  - _Requirements: 5.5_

- [ ] 7. Final validation and cleanup
- [ ] 7.1 Run all linting and type checking
  - Ensure npm run lint passes without errors
  - Verify npm run type-check passes
  - Test that npm run test executes successfully
  - _Requirements: 1.1, 2.1_

- [ ] 7.2 Test all CRUD operations end-to-end
  - Test product creation, update, and deletion
  - Test order creation and status updates
  - Test supplier management operations
  - Verify data consistency across all operations
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_