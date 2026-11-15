# REST API Specification: Restaurant Menu Management

Base URL: `http://localhost:4002/api/v1`

## 1. Authentication Endpoints

### POST `/auth/register`
- **Request Body**:
  ```json
  {
    "email": "owner@bistro.local",
    "password": "Password123!",
    "name": "Jean Dupont",
    "restaurantName": "Bistro Parisien",
    "restaurantSlug": "bistro-parisien"
  }
  ```
- **Response `201 Created`**: `{ "user": { ... }, "restaurant": { ... }, "token": "jwt-token" }`

### POST `/auth/login`
- **Request Body**: `{ "email": "owner@bistro.local", "password": "Password123!" }`
- **Response `200 OK`**: `{ "user": { ... }, "restaurant": { ... }, "token": "jwt-token" }`

### GET `/auth/me`
- **Headers**: `Authorization: Bearer <token>`
- **Response `200 OK`**

---

## 2. Restaurant Profile Endpoints

### GET `/restaurant`
Retrieve restaurant profile of authenticated operator.
- **Headers**: `Authorization: Bearer <token>`

### PATCH `/restaurant`
Update restaurant settings (name, currency, description, operating hours).
- **Headers**: `Authorization: Bearer <token>`

---

## 3. Menu Endpoints

### POST `/menus`
Create a new menu (e.g. "Lunch Menu", "Dinner Menu").
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "title": "Summer Dinner Menu",
    "description": "Seasonal dinner specials",
    "isPublished": true,
    "startTime": "17:00",
    "endTime": "23:00",
    "daysOfWeek": [1, 2, 3, 4, 5, 6]
  }
  ```
- **Response `201 Created`**

### GET `/menus`
List menus for the restaurant.
- **Headers**: `Authorization: Bearer <token>`
- **Response `200 OK`**

### GET `/menus/:id`
Get menu with its categories and items.
- **Response `200 OK`**

### PATCH `/menus/:id`
Update menu metadata or schedule.
- **Response `200 OK`**

### DELETE `/menus/:id`
Delete menu.
- **Response `200 OK`**

---

## 4. Category Endpoints

### POST `/menus/:menuId/categories`
Create category in menu.
- **Request Body**: `{ "name": "Appetizers", "description": "Small plates", "sortOrder": 1 }`
- **Response `201 Created`**

### PATCH `/categories/:id`
Update category details or order.
- **Response `200 OK`**

### DELETE `/categories/:id`
Delete category.
- **Response `200 OK`**

---

## 5. Menu Item Endpoints

### POST `/categories/:categoryId/items`
Create a new menu item.
- **Request Body**:
  ```json
  {
    "name": "Truffle Tagliatelle",
    "description": "Handmade pasta with black truffle cream",
    "price": 24.50,
    "promoPrice": 21.00,
    "imageUrl": "https://storage.tradeo.local/menu/truffle.jpg",
    "calories": 680,
    "prepTimeMinutes": 18,
    "badge": "Chef Special",
    "isAvailable": true,
    "allergens": ["Gluten", "Dairy"],
    "dietary": ["Vegetarian"],
    "ingredients": "Semolina flour, black summer truffles, butter, parmesan",
    "variants": [
      {
        "name": "Portion Size",
        "minSelections": 1,
        "maxSelections": 1,
        "options": [
          { "name": "Regular", "priceDelta": 0 },
          { "name": "Large (+50%)", "priceDelta": 6.00 }
        ]
      }
    ]
  }
  ```
- **Response `201 Created`**

### PATCH `/items/:id`
Update item details or toggle availability.
- **Response `200 OK`**

### DELETE `/items/:id`
Delete item.
- **Response `200 OK`**

---

## 6. Public Guest Menu Endpoints

### GET `/public/menu/:slug`
Customer-facing public endpoint returning live published menus, categories, items, and active schedules.
- **Response `200 OK`**: `{ "restaurant": { ... }, "menus": [ ... ] }`

### GET `/public/qr/:slug`
Generate vector QR code pointing to public digital menu.
- **Query Params**: `format=svg|png`, `table=12`
- **Response `200 OK`**
