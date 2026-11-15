# System Requirements Specification: Inventory Management System

## 1. Executive Summary

The **Inventory Management System** is a business-grade warehouse management system (WMS) and stock ledger engine designed for multi-facility retail, distribution, manufacturing, and eCommerce operations. It provides precise double-entry style stock ledger accounting, SKU and barcode generation, multi-warehouse inventory levels, inter-warehouse stock transfers, supplier management, purchase order recording, automated low-stock reorder thresholds, audit movement logs, and tabular CSV import/export utilities.

## 2. Core Functional Requirements

### 2.1 Multi-Tenant Organization & Authentication
- Enterprise user registration and authentication (JWT, bcrypt).
- Role-based operational access: `ADMIN`, `WAREHOUSE_MANAGER`, `STAFF`.
- Organization / Company profiles with localized default currency (`USD`, `EUR`, `GBP`) and timezone settings.

### 2.2 Product Catalog & SKU / Barcode Registry
- Product attributes: Name, unique SKU (Stock Keeping Unit), UPC/EAN barcode, category, unit of measure (e.g. `PCS`, `KG`, `BOX`), cost price, selling price, and description.
- Minimum threshold ("Reorder Point") configuration per product.
- Automatic low-stock alert flag when total on-hand stock drops below the reorder point.

### 2.3 Multi-Warehouse Facilities
- Multiple distinct warehouse locations (e.g., "Primary Fulfillment Center", "West Coast Hub", "Retail Showroom").
- Facility attributes: Name, code (e.g. `WH-01`), address, contact, and capacity notes.
- Per-warehouse on-hand, allocated, and available stock tracking.

### 2.4 Stock Ledger & Inventory Movements
- Deterministic, immutable inventory transaction ledger (`InventoryMovement`):
  - Movement Types: `RECEIVING` (from supplier), `DISPATCH` (sales order delivery), `TRANSFER_IN` / `TRANSFER_OUT` (inter-warehouse), `ADJUSTMENT_IN` / `ADJUSTMENT_OUT` (cycle count corrections), `SCRAP` (damaged goods).
  - Strict audit trail: records previous quantity, quantity delta, resulting quantity, user ID, reference number, and explanatory notes.
- Real-time stock balance recalculation ensuring negative inventory cannot silently occur without supervisor override.

### 2.5 Inter-Warehouse Stock Transfers
- Initiating stock transfer requests between a source warehouse and a destination warehouse.
- Two-step confirmation lifecycle: `DRAFT` -> `IN_TRANSIT` -> `RECEIVED` (or `CANCELLED`).
- Automatic debit from source facility and credit to destination facility upon receipt.

### 2.6 Suppliers & Purchase Order Tracking
- Supplier directory: Vendor name, contact person, email, phone, address, and payment terms.
- Purchase order recording: Vendor selection, line items with expected quantities and purchase cost, delivery status (`PENDING`, `PARTIAL`, `RECEIVED`, `CANCELLED`).
- One-click goods receipt: automatically generates `RECEIVING` movements into the chosen warehouse.

### 2.7 Low-Stock Alerts & Notification Worker
- Automated scan for items whose aggregate or facility-specific stock is `<= reorderPoint`.
- Redis-backed notification queue for dispatching low-stock warning digests.

### 2.8 Tabular Reporting & CSV Import / Export
- One-click CSV export of stock levels across all facilities.
- Bulk product CSV import for rapid catalog onboarding.
- Financial inventory valuation report: Total asset value based on Weighted Average Cost (WAC) or FIFO valuation.
