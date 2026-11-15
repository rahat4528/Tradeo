# API Specification: Inventory Management System

Base URL: `/api/v1`

## 1. Authentication Endpoints

### POST `/auth/register`
Register enterprise operator and organization.
- **Request Body**:
  ```json
  {
    "companyName": "Apex Logistics Group",
    "name": "Marcus Vance",
    "email": "marcus@apexlogistics.io",
    "password": "SecurePassword123!",
    "currency": "USD"
  }
  ```

### POST `/auth/login`
Authenticate credentials and issue JWT.
- **Response**: `{ "token": "jwt", "user": { ... }, "organization": { ... } }`

---

## 2. Warehouses Endpoints

### POST `/warehouses`
Create a warehouse facility.
- **Request Body**:
  ```json
  {
    "code": "WH-EAST",
    "name": "East Coast Distribution Hub",
    "address": "400 Logistics Blvd, Newark NJ",
    "phone": "+1 (555) 234-5678"
  }
  ```

### GET `/warehouses`
List all warehouses with total SKU count and on-hand units.

### GET `/warehouses/:id`
Get warehouse profile and stock breakdown.

---

## 3. Products & Stock Endpoints

### POST `/products`
Create a product SKU with reorder threshold.
- **Request Body**:
  ```json
  {
    "sku": "ELEC-USB-C-2M",
    "name": "Braided USB-C Cable 2m",
    "barcode": "8901234567890",
    "category": "Electronics",
    "unit": "PCS",
    "costPrice": 4.50,
    "sellingPrice": 14.99,
    "reorderPoint": 50,
    "initialWarehouseId": "uuid",
    "initialStock": 200
  }
  ```

### GET `/products`
Search and list products with aggregated on-hand quantities and low-stock alert flags.
- **Query Parameters**: `search`, `category`, `lowStockOnly` (boolean).

### GET `/products/:id`
Get product details with stock counts per warehouse facility.

---

## 4. Inventory Movements & Adjustments Endpoints

### POST `/movements/adjust`
Make a manual cycle count adjustment.
- **Request Body**:
  ```json
  {
    "productId": "uuid",
    "warehouseId": "uuid",
    "type": "ADJUSTMENT_IN",
    "quantity": 15,
    "reason": "Cycle count discrepancy reconciliation",
    "reference": "CC-2026-Q2"
  }
  ```

### POST `/movements/transfer`
Transfer stock from source warehouse to destination warehouse.
- **Request Body**:
  ```json
  {
    "productId": "uuid",
    "sourceWarehouseId": "uuid-1",
    "destinationWarehouseId": "uuid-2",
    "quantity": 30,
    "reference": "TR-1044",
    "notes": "Rebalancing stock before promo"
  }
  ```

### GET `/movements`
List recent inventory movements ledger with pagination.

---

## 5. Suppliers & Purchase Orders Endpoints

### POST `/suppliers`
Create a vendor profile.

### GET `/suppliers`
List suppliers.

### POST `/purchase-orders`
Create a purchase order.

### POST `/purchase-orders/:id/receive`
Receive items from purchase order directly into designated warehouse facility.

---

## 6. Reports & Data Utilities Endpoints

### GET `/reports/summary`
Get inventory valuation, total SKUs, low-stock count, and top-moving products.

### GET `/reports/export-csv`
Download full CSV export of inventory stock across all warehouses.

### POST `/reports/import-csv`
Bulk import products from CSV data.
