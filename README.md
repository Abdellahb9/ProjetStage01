# Inventory Management System

A modern, responsive inventory management application built with React, TypeScript, and Material-UI.

## Features

### 🎯 Dashboard
- **Statistics Overview**: Total products, suppliers, inventory value, and low stock alerts
- **Recent Products**: Latest added products with quick access
- **Top Suppliers**: Highest-rated suppiliers based on ratings
- **Real-time Data**: Live updates from the backend

### 📦 Products Management
- **CRUD Operations**: Create, read, update, and delete products
- **Advanced Search**: Search by name or description
- **Category Filtering**: Filter products by category
- **Data Grid**: Sortable and paginated data table
- **Form Validation**: Input validation and error handling

### 👥 Suppliers Management
- **Supplier Profiles**: Complete supplier information management
- **Rating System**: 5-star rating system for suppliers
- **Product Association**: Track products per supplier
- **Smart Deletion**: Prevents deletion of suppliers with associated products

### 🎨 User Interface
- **Material-UI Design**: Modern, consistent design system
- **Responsive Layout**: Works on desktop, tablet, and mobile
- **Dark/Light Theme**: Customizable theme support
- **Navigation**: Sidebar navigation with active state indicators

## Technology Stack

- **Frontend**: React 19 + TypeScript
- **UI Framework**: Material-UI (MUI) v7
- **Data Grid**: MUI X Data Grid
- **Routing**: React Router DOM v7
- **Build Tool**: Vite
- **Backend**: JSON Server (mock API)
- **Styling**: Emotion (CSS-in-JS)

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd pro01
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Start the mock API server** (in a separate terminal)
   ```bash
   npm run server
   ```

5. **Open your browser**
   - Frontend: http://localhost:5173
   - API: http://localhost:3001

## Available Scripts

- `npm run dev` - Start development server
- `npm run server` - Start JSON Server (mock API)
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── components/          # Reusable UI components
├── pages/              # Page components
│   ├── Dashboard.tsx   # Dashboard with statistics
│   ├── Products.tsx    # Products management
│   └── Suppliers.tsx   # Suppliers management
├── utils/              # Utility functions
│   └── api.ts         # API client and interfaces
├── Layout.tsx          # Main layout with navigation
├── App.tsx            # App routing
├── main.tsx           # App entry point
├── theme.ts           # Material-UI theme configuration
└── index.css          # Global styles
```

## API Endpoints

The application uses JSON Server to provide a mock REST API:

- `GET /products` - Get all products
- `POST /products` - Create a new product
- `PUT /products/:id` - Update a product
- `DELETE /products/:id` - Delete a product

- `GET /suppliers` - Get all suppliers
- `POST /suppliers` - Create a new supplier
- `PUT /suppliers/:id` - Update a supplier
- `DELETE /suppliers/:id` - Delete a supplier

- `GET /categories` - Get all categories

## Data Models

### Product
```typescript
interface Product {
  id: number;
  name: string;
  quantity: number;
  price: number;
  category: string;
  supplierId: number;
  description: string;
}
```

### Supplier
```typescript
interface Supplier {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  rating: number;
  productsCount: number;
}
```

## Features in Detail

### Dashboard Analytics
- **Inventory Overview**: Real-time statistics about your inventory
- **Low Stock Alerts**: Products with quantity below 20
- **Value Calculation**: Total inventory value in euros
- **Performance Metrics**: Supplier ratings and product counts

### Advanced Search & Filtering
- **Text Search**: Search across product names and descriptions
- **Category Filtering**: Filter products by category
- **Real-time Results**: Instant search results as you type

### Data Management
- **Bulk Operations**: Efficient handling of large datasets
- **Pagination**: Navigate through large product/supplier lists
- **Sorting**: Sort by any column for better data analysis
- **Export Ready**: Data grid ready for export functionality

### Responsive Design
- **Mobile First**: Optimized for mobile devices
- **Adaptive Layout**: Automatically adjusts to screen size
- **Touch Friendly**: Optimized for touch interactions
- **Progressive Web App**: Can be installed on mobile devices

## Customization

### Theme Configuration
The application uses a custom Material-UI theme defined in `src/theme.ts`. You can customize:

- Color palette (primary, secondary, background)
- Typography (fonts, sizes, weights)
- Component styles (buttons, cards, inputs)

### Adding New Features
1. Create new page components in `src/pages/`
2. Add routing in `src/App.tsx`
3. Update navigation in `src/Layout.tsx`
4. Add API endpoints in `src/utils/api.ts`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please open an issue in the repository.
