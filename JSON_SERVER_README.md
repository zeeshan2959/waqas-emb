# Ghausia Textile Manager - JSON Server Setup

This project uses JSON Server for local data storage and API mocking during development.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the JSON Server (runs on port 3001):
   ```bash
   npm run server
   ```

3. In another terminal, start the React app (runs on port 3000):
   ```bash
   npm start
   ```

4. Or run both simultaneously:
   ```bash
   npm run dev
   ```

## API Endpoints

The JSON Server provides the following REST endpoints:

### Dashboard
- `GET /dashboard` - Get dashboard statistics

### Collections
- `GET /collections` - Get all collections
- `GET /collections/:id` - Get collection by ID
- `POST /collections` - Create new collection
- `PUT /collections/:id` - Update collection
- `DELETE /collections/:id` - Delete collection

### Parties
- `GET /parties` - Get all parties
- `GET /parties/:id` - Get party by ID
- `POST /parties` - Create new party
- `PUT /parties/:id` - Update party
- `DELETE /parties/:id` - Delete party

### Party Ledger
- `GET /partyLedger` - Get all ledger entries
- `GET /partyLedger?partyId=:id` - Get ledger entries for specific party
- `POST /partyLedger` - Create new ledger entry

### Ghausia Lots
- `GET /ghausiaLots` - Get all production lots
- `GET /ghausiaLots/:id` - Get lot by ID
- `POST /ghausiaLots` - Create new lot
- `PUT /ghausiaLots/:id` - Update lot
- `DELETE /ghausiaLots/:id` - Delete lot

### Party Edits
- `GET /partyEdits` - Get all party edit entries
- `POST /partyEdits` - Create new party edit entry
- `PUT /partyEdits/:id` - Update party edit entry

### Payments
- `GET /payments` - Get all payments
- `GET /payments?partyId=:id` - Get payments for specific party
- `POST /payments` - Create new payment
- `PUT /payments/:id` - Update payment

### Rate Calculations
- `GET /rateCalculations` - Get all rate calculations
- `POST /rateCalculations` - Create new rate calculation
- `PUT /rateCalculations/:id` - Update rate calculation

### Cash Flow
- `GET /cashFlow` - Get all cash flow entries
- `POST /cashFlow` - Create new cash flow entry

## Data Structure

The `db.json` file contains sample data for all entities with the following structure:

- **dashboard**: Application statistics and metrics
- **collections**: Textile collection records
- **parties**: Supplier and buyer information
- **partyLedger**: Transaction history for each party
- **payments**: Payment records
- **rateCalculations**: Pricing calculations
- **cashFlow**: Income and expense tracking

## Usage in React Components

Import the API service and use it in your components:

```javascript
import { apiService } from '../services/api';

// Example usage
const fetchCollections = async () => {
  try {
    const collections = await apiService.getCollections();
    setCollections(collections);
  } catch (error) {
    console.error('Failed to fetch collections:', error);
  }
};
```

## JSON Server Features

- **Full REST API**: Automatic CRUD operations
- **Filtering**: Use query parameters (e.g., `/collections?status=completed`)
- **Sorting**: Add `_sort` and `_order` parameters
- **Pagination**: Use `_page` and `_limit` parameters
- **Searching**: Use `q` parameter for full-text search
- **Relationships**: Access related data through nested queries

## Development Notes

- JSON Server automatically saves changes to `db.json`
- Data persists between server restarts
- Use the provided `apiService` for consistent API calls
- All endpoints support standard HTTP methods (GET, POST, PUT, DELETE)

## Production

For production, replace JSON Server with a proper backend API. The `apiService` can be easily adapted to work with any REST API or GraphQL endpoint.