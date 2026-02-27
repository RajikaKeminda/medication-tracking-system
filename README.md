# Remote Pharmacy Medication Tracker — Order Processing Module

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [API Endpoint Documentation](#api-endpoint-documentation)
  - [Authentication](#authentication)
  - [Standard Response Format](#standard-response-format)
  - [Order Endpoints](#order-endpoints)
    - [Create Order](#1-create-order)
    - [Get All Orders](#2-get-all-orders)
    - [Get Order by ID](#3-get-order-by-id)
    - [Get User Orders](#4-get-user-orders)
    - [Get Pharmacy Orders](#5-get-pharmacy-orders)
    - [Get Delivery Partner Orders](#6-get-delivery-partner-orders)
    - [Get Delivery Tracking](#7-get-delivery-tracking)
    - [Update Order](#8-update-order)
    - [Update Order Status](#9-update-order-status)
    - [Process Payment](#10-process-payment)
    - [Generate Invoice](#11-generate-invoice)
    - [Assign Delivery Partner](#12-assign-delivery-partner)
    - [Cancel Order](#13-cancel-order)
- [Request Medication Endpoints](#request-medication-endpoints)
    - [Create Medication Request](#1-create-medication-request)
    - [Get All Requests](#2-get-all-requests)
    - [Get Urgent Requests](#3-get-urgent-requests)
    - [Get User Requests](#4-get-user-requests)
    - [Get Pharmacy Requests](#5-get-pharmacy-requests)
    - [Get Request by ID](#6-get-request-by-id)
    - [Update Request](#7-update-request)
    - [Update Request Status](#8-update-request-status)
    - [Cancel Request](#9-cancel-request)
- [Testing Instruction Report](#testing-instruction-report)
  - [Testing Environment Configuration](#testing-environment-configuration)
  - [Running Unit Tests](#running-unit-tests)
  - [Integration Testing Setup and Execution](#integration-testing-setup-and-execution)
  - [Performance Testing Setup and Execution](#performance-testing-setup-and-execution)

---

## Overview

The Order Processing module (`/api/orders`) manages the full lifecycle of medication orders — from converting approved medication requests into orders, through payment processing via Stripe, delivery tracking, and cancellation with automatic refunds and inventory restoration. It is part of the Remote Pharmacy Medication Tracker system.

## Tech Stack

| Component       | Technology                        |
| --------------- | --------------------------------- |
| Runtime         | Node.js + TypeScript              |
| Framework       | Express.js                        |
| Database        | MongoDB with Mongoose ODM         |
| Authentication  | JWT (access + refresh tokens)     |
| Validation      | Zod schemas                       |
| Payment Gateway | Stripe                            |
| Testing         | Jest, Supertest, MongoDB Memory Server, Artillery |
| API Docs        | Swagger (swagger-jsdoc)           |

---

## API Endpoint Documentation

### Authentication

All order endpoints require a valid JWT access token passed in the `Authorization` header:

```
Authorization: Bearer <access_token>
```

Tokens are obtained via `POST /api/auth/login` and carry a payload of `{ userId, role }`. Access tokens expire after 15 minutes by default.

**User Roles:**

| Role             | Description                                |
| ---------------- | ------------------------------------------ |
| `Patient`        | End users who request and order medications |
| `Pharmacy Staff` | Pharmacy administrators managing orders     |
| `System Admin`   | Full system access                          |

### Standard Response Format

**Success Response:**

```json
{
  "success": true,
  "message": "Description of the outcome",
  "data": { }
}
```

**Error Response:**

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": [{ "field": "fieldName", "message": "Validation detail" }]
  }
}
```

**HTTP Status Codes Used:**

| Code | Usage                    |
| ---- | ------------------------ |
| 200  | Success                  |
| 201  | Resource created         |
| 400  | Bad request / Validation |
| 401  | Unauthorized             |
| 403  | Forbidden (wrong role)   |
| 404  | Resource not found       |
| 500  | Internal server error    |

---

### Order Endpoints

Base URL: `/api/orders`

---

#### 1. Create Order

Creates an order from an approved medication request. Atomically decrements inventory and marks the medication request as fulfilled within a MongoDB transaction.

| Property | Value |
| -------- | ----- |
| **URL** | `POST /api/orders` |
| **Auth** | Required |
| **Role** | `Patient` |

**Request Body:**

```json
{
  "requestId": "60d5ecb54b24a90015c0b1a2",
  "items": [
    {
      "medicationId": "60d5ecb54b24a90015c0b1a3",
      "name": "Paracetamol 500mg",
      "quantity": 2,
      "unitPrice": 5.99
    }
  ],
  "deliveryAddress": {
    "street": "123 Main Street",
    "city": "Colombo",
    "postalCode": "10100",
    "phoneNumber": "+94771234567",
    "coordinates": {
      "latitude": 6.9271,
      "longitude": 79.8612
    }
  },
  "deliveryFee": 3.00,
  "paymentMethod": "card"
}
```

| Field | Type | Required | Description |
| ----- | ---- | -------- | ----------- |
| `requestId` | string (ObjectId) | Yes | ID of the approved medication request |
| `items` | array | Yes | At least one medication item |
| `items[].medicationId` | string (ObjectId) | Yes | Inventory item ID |
| `items[].name` | string | Yes | Medication name |
| `items[].quantity` | integer | Yes | Quantity (min: 1) |
| `items[].unitPrice` | number | Yes | Price per unit (min: 0) |
| `deliveryAddress.street` | string | Yes | Street address |
| `deliveryAddress.city` | string | Yes | City |
| `deliveryAddress.postalCode` | string | Yes | Postal code |
| `deliveryAddress.phoneNumber` | string | Yes | Phone (format: `+?[digits/spaces/-()]{7,15}`) |
| `deliveryAddress.coordinates` | object | No | Latitude (-90..90) and longitude (-180..180) |
| `deliveryFee` | number | No | Delivery fee (default: 0, min: 0) |
| `paymentMethod` | string | No | `card`, `cash`, or `online` |

**Success Response (201):**

```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "_id": "675a1b2c3d4e5f6a7b8c9d0e",
    "orderNumber": "ORD-2026-000001",
    "requestId": "60d5ecb54b24a90015c0b1a2",
    "userId": {
      "_id": "60d5ecb54b24a90015c0b1a1",
      "name": "Test Patient",
      "email": "patient@test.com",
      "phone": "+94771234567"
    },
    "pharmacyId": {
      "_id": "60d5ecb54b24a90015c0b1a4",
      "name": "City Pharmacy",
      "location": "Colombo",
      "contactInfo": "+94112345678"
    },
    "items": [
      {
        "medicationId": "60d5ecb54b24a90015c0b1a3",
        "name": "Paracetamol 500mg",
        "quantity": 2,
        "unitPrice": 5.99,
        "totalPrice": 11.98
      }
    ],
    "subtotal": 11.98,
    "deliveryFee": 3.00,
    "tax": 0.60,
    "totalAmount": 15.58,
    "deliveryAddress": {
      "street": "123 Main Street",
      "city": "Colombo",
      "postalCode": "10100",
      "phoneNumber": "+94771234567"
    },
    "status": "confirmed",
    "paymentStatus": "pending",
    "paymentMethod": "card",
    "trackingUpdates": [
      {
        "status": "confirmed",
        "timestamp": "2026-02-27T10:00:00.000Z",
        "notes": "Order created from approved medication request"
      }
    ],
    "createdAt": "2026-02-27T10:00:00.000Z",
    "updatedAt": "2026-02-27T10:00:00.000Z"
  }
}
```

**Error Responses:**

| Status | Condition |
| ------ | --------- |
| 400 | Missing/invalid fields, empty items, insufficient stock, request not in `available` status |
| 401 | Missing or invalid auth token |
| 403 | Non-Patient role attempts to create order |
| 404 | Medication request or inventory item not found |

---

#### 2. Get All Orders

Returns a paginated, filterable list of all orders.

| Property | Value |
| -------- | ----- |
| **URL** | `GET /api/orders` |
| **Auth** | Required |
| **Role** | `Pharmacy Staff`, `System Admin` |

**Query Parameters:**

| Parameter | Type | Default | Description |
| --------- | ---- | ------- | ----------- |
| `status` | string | — | Filter: `confirmed`, `packed`, `out_for_delivery`, `delivered`, `cancelled` |
| `paymentStatus` | string | — | Filter: `pending`, `paid`, `failed`, `refunded` |
| `page` | integer | 1 | Page number |
| `limit` | integer | 10 | Items per page |
| `sortBy` | string | `createdAt` | Sort field |
| `sortOrder` | string | `desc` | `asc` or `desc` |

**Example Request:**

```
GET /api/orders?status=packed&page=1&limit=10&sortOrder=desc
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Orders retrieved successfully",
  "data": {
    "orders": [ { "...order object..." } ],
    "total": 25,
    "page": 1,
    "pages": 3
  }
}
```

**Error Responses:**

| Status | Condition |
| ------ | --------- |
| 401 | Missing or invalid auth token |
| 403 | Patient role attempts to access |

---

#### 3. Get Order by ID

Returns a single order with populated user, pharmacy, and delivery partner details.

| Property | Value |
| -------- | ----- |
| **URL** | `GET /api/orders/:id` |
| **Auth** | Required |
| **Role** | Any authenticated user |

**Path Parameters:**

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `id` | string (ObjectId) | Order ID |

**Success Response (200):**

```json
{
  "success": true,
  "message": "Order retrieved successfully",
  "data": {
    "_id": "675a1b2c3d4e5f6a7b8c9d0e",
    "orderNumber": "ORD-2026-000001",
    "status": "confirmed",
    "items": [ "..." ],
    "totalAmount": 15.58,
    "trackingUpdates": [ "..." ]
  }
}
```

**Error Responses:**

| Status | Condition |
| ------ | --------- |
| 400 | Invalid ObjectId format |
| 401 | Missing or invalid auth token |
| 404 | Order not found |

---

#### 4. Get User Orders

Returns order history for a specific user with pagination.

| Property | Value |
| -------- | ----- |
| **URL** | `GET /api/orders/user/:userId` |
| **Auth** | Required |
| **Role** | `Patient`, `System Admin` |

**Path Parameters:**

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `userId` | string (ObjectId) | User ID |

**Query Parameters:** Same pagination params as [Get All Orders](#2-get-all-orders).

**Success Response (200):**

```json
{
  "success": true,
  "message": "User orders retrieved successfully",
  "data": {
    "orders": [ "..." ],
    "total": 5,
    "page": 1,
    "pages": 1
  }
}
```

**Error Responses:**

| Status | Condition |
| ------ | --------- |
| 400 | Invalid userId format |
| 401 | Missing or invalid auth token |
| 403 | Unauthorized role |

---

#### 5. Get Pharmacy Orders

Returns all orders for a specific pharmacy with pagination.

| Property | Value |
| -------- | ----- |
| **URL** | `GET /api/orders/pharmacy/:pharmacyId` |
| **Auth** | Required |
| **Role** | `Pharmacy Staff`, `System Admin` |

**Path Parameters:**

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `pharmacyId` | string (ObjectId) | Pharmacy ID |

**Query Parameters:** Same pagination params as [Get All Orders](#2-get-all-orders).

**Success Response (200):**

```json
{
  "success": true,
  "message": "Pharmacy orders retrieved successfully",
  "data": {
    "orders": [ "..." ],
    "total": 12,
    "page": 1,
    "pages": 2
  }
}
```

**Error Responses:**

| Status | Condition |
| ------ | --------- |
| 400 | Invalid pharmacyId format |
| 401 | Missing or invalid auth token |
| 403 | Patient role attempts to access |

---

#### 6. Get Delivery Partner Orders

Returns all orders assigned to a specific delivery partner.

| Property | Value |
| -------- | ----- |
| **URL** | `GET /api/orders/delivery-partner/:partnerId` |
| **Auth** | Required |
| **Role** | Any authenticated user |

**Path Parameters:**

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `partnerId` | string (ObjectId) | Delivery partner user ID |

**Query Parameters:** Same pagination params as [Get All Orders](#2-get-all-orders).

**Success Response (200):**

```json
{
  "success": true,
  "message": "Delivery partner orders retrieved successfully",
  "data": {
    "orders": [ "..." ],
    "total": 3,
    "page": 1,
    "pages": 1
  }
}
```

---

#### 7. Get Delivery Tracking

Returns real-time tracking information for an order, including all status history.

| Property | Value |
| -------- | ----- |
| **URL** | `GET /api/orders/track/:id` |
| **Auth** | Required |
| **Role** | Any authenticated user |

**Path Parameters:**

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `id` | string (ObjectId) | Order ID |

**Success Response (200):**

```json
{
  "success": true,
  "message": "Tracking info retrieved successfully",
  "data": {
    "order": {
      "_id": "675a1b2c3d4e5f6a7b8c9d0e",
      "orderNumber": "ORD-2026-000001",
      "status": "out_for_delivery",
      "deliveryAddress": { "..." }
    },
    "trackingUpdates": [
      {
        "status": "confirmed",
        "timestamp": "2026-02-27T10:00:00.000Z",
        "notes": "Order created from approved medication request"
      },
      {
        "status": "packed",
        "timestamp": "2026-02-27T11:00:00.000Z",
        "location": "Pharmacy Counter",
        "notes": "All items packaged"
      },
      {
        "status": "out_for_delivery",
        "timestamp": "2026-02-27T12:00:00.000Z",
        "location": "Dispatch Center"
      }
    ]
  }
}
```

**Error Responses:**

| Status | Condition |
| ------ | --------- |
| 400 | Invalid ObjectId format |
| 401 | Missing or invalid auth token |
| 404 | Order not found |

---

#### 8. Update Order

Updates an order's delivery address, delivery fee, or estimated delivery time. Recalculates `totalAmount` when delivery fee changes.

| Property | Value |
| -------- | ----- |
| **URL** | `PUT /api/orders/:id` |
| **Auth** | Required |
| **Role** | `Pharmacy Staff`, `System Admin` |

**Path Parameters:**

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `id` | string (ObjectId) | Order ID |

**Request Body (all fields optional):**

```json
{
  "deliveryAddress": {
    "street": "789 New Road",
    "city": "Galle",
    "postalCode": "80000",
    "phoneNumber": "+94771111111"
  },
  "deliveryFee": 10.00,
  "estimatedDelivery": "2026-03-01T14:00:00.000Z"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Order updated successfully",
  "data": {
    "...updated order..."
  }
}
```

**Error Responses:**

| Status | Condition |
| ------ | --------- |
| 400 | Order is `delivered` or `cancelled` |
| 401 | Missing or invalid auth token |
| 403 | Patient role attempts to update |
| 404 | Order not found |

---

#### 9. Update Order Status

Advances the order through its lifecycle. Enforces valid status transitions.

| Property | Value |
| -------- | ----- |
| **URL** | `PATCH /api/orders/:id/status` |
| **Auth** | Required |
| **Role** | `Pharmacy Staff`, `System Admin` |

**Valid Status Transitions:**

```
confirmed  →  packed  →  out_for_delivery  →  delivered
     ↓            ↓              ↓
  cancelled   cancelled      cancelled
```

**Request Body:**

```json
{
  "status": "packed",
  "location": "Pharmacy Counter",
  "notes": "All items packaged and verified"
}
```

| Field | Type | Required | Description |
| ----- | ---- | -------- | ----------- |
| `status` | string | Yes | `confirmed`, `packed`, `out_for_delivery`, `delivered`, `cancelled` |
| `location` | string | No | Current location of the order |
| `notes` | string | No | Additional notes for tracking |

**Success Response (200):**

```json
{
  "success": true,
  "message": "Order status updated successfully",
  "data": {
    "status": "packed",
    "trackingUpdates": [
      {
        "status": "confirmed",
        "timestamp": "2026-02-27T10:00:00.000Z",
        "notes": "Order created from approved medication request"
      },
      {
        "status": "packed",
        "timestamp": "2026-02-27T11:00:00.000Z",
        "location": "Pharmacy Counter",
        "notes": "All items packaged and verified"
      }
    ]
  }
}
```

**Error Responses:**

| Status | Condition |
| ------ | --------- |
| 400 | Invalid status transition, order already delivered/cancelled |
| 401 | Missing or invalid auth token |
| 403 | Patient role attempts to update status |
| 404 | Order not found |

---

#### 10. Process Payment

Processes payment for an order through the Stripe payment gateway. Creates and confirms a Stripe PaymentIntent.

| Property | Value |
| -------- | ----- |
| **URL** | `POST /api/orders/:id/payment` |
| **Auth** | Required |
| **Role** | `Patient` |

**Request Body:**

```json
{
  "paymentMethod": "card"
}
```

| Field | Type | Required | Description |
| ----- | ---- | -------- | ----------- |
| `paymentMethod` | string | Yes | `card`, `cash`, or `online` |

**Success Response (200):**

```json
{
  "success": true,
  "message": "Payment processed successfully",
  "data": {
    "paymentStatus": "paid",
    "paymentMethod": "card",
    "paymentIntentId": "pi_3abc123def456"
  }
}
```

**Error Responses:**

| Status | Condition |
| ------ | --------- |
| 400 | Order already paid, cancelled order, payment processing failure, missing/invalid paymentMethod |
| 401 | Missing or invalid auth token |
| 403 | Non-Patient role attempts to process payment |
| 404 | Order not found |

---

#### 11. Generate Invoice

Generates a PDF invoice URL for an order.

| Property | Value |
| -------- | ----- |
| **URL** | `POST /api/orders/:id/invoice` |
| **Auth** | Required |
| **Role** | Any authenticated user |

**Success Response (200):**

```json
{
  "success": true,
  "message": "Invoice generated successfully",
  "data": {
    "invoiceUrl": "/invoices/ORD-2026-000001.pdf"
  }
}
```

**Error Responses:**

| Status | Condition |
| ------ | --------- |
| 401 | Missing or invalid auth token |
| 404 | Order not found |

---

#### 12. Assign Delivery Partner

Assigns a delivery partner to an order and adds a tracking update.

| Property | Value |
| -------- | ----- |
| **URL** | `PATCH /api/orders/:id/assign-delivery` |
| **Auth** | Required |
| **Role** | `Pharmacy Staff`, `System Admin` |

**Request Body:**

```json
{
  "deliveryPartnerId": "60d5ecb54b24a90015c0b1a5"
}
```

| Field | Type | Required | Description |
| ----- | ---- | -------- | ----------- |
| `deliveryPartnerId` | string (ObjectId) | Yes | User ID of the delivery partner |

**Success Response (200):**

```json
{
  "success": true,
  "message": "Delivery partner assigned successfully",
  "data": {
    "deliveryPartnerId": {
      "_id": "60d5ecb54b24a90015c0b1a5",
      "name": "Delivery Driver",
      "email": "driver@test.com",
      "phone": "+94771111111"
    },
    "trackingUpdates": [
      "...",
      {
        "status": "delivery_partner_assigned",
        "timestamp": "2026-02-27T11:30:00.000Z",
        "notes": "Delivery partner 60d5ecb54b24a90015c0b1a5 assigned"
      }
    ]
  }
}
```

**Error Responses:**

| Status | Condition |
| ------ | --------- |
| 400 | Order is `delivered` or `cancelled`, missing deliveryPartnerId |
| 401 | Missing or invalid auth token |
| 403 | Patient role attempts to assign |
| 404 | Order not found |

---

#### 13. Cancel Order

Cancels an order, restores inventory quantities, reverts the medication request to `available` status, and processes a Stripe refund if payment was made. Uses a MongoDB transaction.

| Property | Value |
| -------- | ----- |
| **URL** | `PATCH /api/orders/:id/cancel` |
| **Auth** | Required |
| **Role** | Order owner (`Patient`), `Pharmacy Staff`, or `System Admin` |

**Request Body (optional):**

```json
{
  "reason": "No longer needed"
}
```

| Field | Type | Required | Description |
| ----- | ---- | -------- | ----------- |
| `reason` | string | No | Cancellation reason (stored in tracking) |

**Success Response (200):**

```json
{
  "success": true,
  "message": "Order cancelled successfully",
  "data": {
    "status": "cancelled",
    "paymentStatus": "refunded",
    "trackingUpdates": [
      "...",
      {
        "status": "cancelled",
        "timestamp": "2026-02-27T14:00:00.000Z",
        "notes": "No longer needed"
      }
    ]
  }
}
```

**Error Responses:**

| Status | Condition |
| ------ | --------- |
| 400 | Order already cancelled or already delivered |
| 401 | Missing or invalid auth token |
| 403 | Non-owner Patient attempting to cancel another user's order |
| 404 | Order not found |

---

### Request Medication Endpoints

Base URL: `/api/requests`

---

#### 1. Create Medication Request

Creates a new medication request submitted by a patient. Triggers notification to the patient upon successful creation.

| Property | Value |
| -------- | ----- |
| **URL** | `POST /api/requests` |
| **Auth** | Required |
| **Role** | `Patient` |

**Request Body:**

```json
{
  "pharmacyId": "60d5ec49f1b2c72b1c8d1234",
  "medicationName": "Amoxicillin 500mg",
  "quantity": 30,
  "urgencyLevel": "normal",
  "prescriptionRequired": false,
  "prescriptionImage": "https://example.com/prescription.jpg",
  "notes": "Need this medication urgently",
  "estimatedAvailability": "2026-03-05T10:00:00.000Z"
}
```

| Field | Type | Required | Description |
| ----- | ---- | -------- | ----------- |
| `pharmacyId` | string (ObjectId) | Yes | Target pharmacy ID |
| `medicationName` | string | Yes | Name of medication requested |
| `quantity` | integer | Yes | Quantity needed (min: 1) |
| `urgencyLevel` | string | No | `urgent`, `normal`, or `low` (default: `normal`) |
| `prescriptionRequired` | boolean | No | Whether prescription is required (default: `false`) |
| `prescriptionImage` | string | No | URL to prescription image |
| `notes` | string | No | Additional notes (max: 1000 chars) |
| `estimatedAvailability` | string | No | Desired availability date (ISO 8601) |

**Success Response (201):**

```json
{
  "success": true,
  "message": "Medication request created successfully",
  "data": {
    "_id": "60d5ec49f1b2c72b1c8d4567",
    "userId": {
      "_id": "60d5ec49f1b2c72b1c8d1234",
      "name": "Test Patient",
      "email": "patient@test.com",
      "phone": "+94771234567"
    },
    "pharmacyId": {
      "_id": "60d5ec49f1b2c72b1c8d1235",
      "name": "City Pharmacy",
      "location": "Colombo",
      "contactInfo": "+94112345678"
    },
    "medicationName": "Amoxicillin 500mg",
    "quantity": 30,
    "urgencyLevel": "normal",
    "status": "pending",
    "prescriptionRequired": false,
    "notes": "Need this medication urgently",
    "requestDate": "2026-02-27T10:00:00.000Z",
    "createdAt": "2026-02-27T10:00:00.000Z",
    "updatedAt": "2026-02-27T10:00:00.000Z"
  }
}
```

**Error Responses:**

| Status | Condition |
| ------ | --------- |
| 400 | Missing/invalid fields, invalid ObjectId format |
| 401 | Missing or invalid auth token |
| 403 | Non-Patient role attempts to create request |

---

#### 2. Get All Requests

Returns a paginated, filterable list of all medication requests. Accessible to pharmacy staff and system admins.

| Property | Value |
| -------- | ----- |
| **URL** | `GET /api/requests` |
| **Auth** | Required |
| **Role** | `Pharmacy Staff`, `System Admin` |

**Query Parameters:**

| Parameter | Type | Default | Description |
| --------- | ---- | ------- | ----------- |
| `status` | string | — | Filter: `pending`, `processing`, `available`, `unavailable`, `fulfilled`, `cancelled` |
| `urgencyLevel` | string | — | Filter: `urgent`, `normal`, `low` |
| `dateFrom` | string | — | Filter requests from this date (ISO 8601) |
| `dateTo` | string | — | Filter requests until this date (ISO 8601) |
| `page` | integer | 1 | Page number |
| `limit` | integer | 20 | Items per page |
| `sortBy` | string | `createdAt` | Sort field: `createdAt`, `urgencyLevel`, `requestDate`, `status` |
| `sortOrder` | string | `desc` | `asc` or `desc` |

**Example Request:**

```
GET /api/requests?status=pending&urgencyLevel=urgent&page=1&limit=10
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Requests retrieved successfully",
  "data": {
    "requests": [
      {
        "_id": "60d5ec49f1b2c72b1c8d4567",
        "userId": { "name": "Test Patient", "email": "patient@test.com" },
        "pharmacyId": { "name": "City Pharmacy", "location": "Colombo" },
        "medicationName": "Amoxicillin 500mg",
        "quantity": 30,
        "urgencyLevel": "urgent",
        "status": "pending",
        "requestDate": "2026-02-27T10:00:00.000Z"
      }
    ],
    "total": 1,
    "page": 1,
    "pages": 1
  }
}
```

**Error Responses:**

| Status | Condition |
| ------ | --------- |
| 401 | Missing or invalid auth token |
| 403 | Patient role attempts to access |

---

#### 3. Get Urgent Requests

Returns all requests with urgency level set to `urgent`. Prioritizes critical medication needs.

| Property | Value |
| -------- | ----- |
| **URL** | `GET /api/requests/urgent` |
| **Auth** | Required |
| **Role** | `Pharmacy Staff`, `System Admin` |

**Query Parameters:** Same pagination params as [Get All Requests](#2-get-all-requests).

**Success Response (200):**

```json
{
  "success": true,
  "message": "Urgent requests retrieved successfully",
  "data": {
    "requests": [ "...urgent request objects..." ],
    "total": 5,
    "page": 1,
    "pages": 1
  }
}
```

---

#### 4. Get User Requests

Returns all medication requests for a specific user. Patients can only access their own requests.

| Property | Value |
| -------- | ----- |
| **URL** | `GET /api/requests/user/:userId` |
| **Auth** | Required |
| **Role** | `Patient`, `System Admin` |

**Path Parameters:**

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `userId` | string (ObjectId) | User ID |

**Query Parameters:** Same pagination and filter params as [Get All Requests](#2-get-all-requests).

**Success Response (200):**

```json
{
  "success": true,
  "message": "User requests retrieved successfully",
  "data": {
    "requests": [ "...user request objects..." ],
    "total": 3,
    "page": 1,
    "pages": 1
  }
}
```

**Error Responses:**

| Status | Condition |
| ------ | --------- |
| 400 | Invalid userId format |
| 401 | Missing or invalid auth token |
| 403 | Patient tries to access another user's requests |

---

#### 5. Get Pharmacy Requests

Returns all medication requests assigned to a specific pharmacy. Pharmacy staff can only view their own pharmacy's requests.

| Property | Value |
| -------- | ----- |
| **URL** | `GET /api/requests/pharmacy/:pharmacyId` |
| **Auth** | Required |
| **Role** | `Pharmacy Staff`, `System Admin` |

**Path Parameters:**

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `pharmacyId` | string (ObjectId) | Pharmacy ID |

**Query Parameters:** Same pagination and filter params as [Get All Requests](#2-get-all-requests).

**Success Response (200):**

```json
{
  "success": true,
  "message": "Pharmacy requests retrieved successfully",
  "data": {
    "requests": [ "...pharmacy request objects..." ],
    "total": 8,
    "page": 1,
    "pages": 1
  }
}
```

**Error Responses:**

| Status | Condition |
| ------ | --------- |
| 400 | Invalid pharmacyId format |
| 401 | Missing or invalid auth token |
| 403 | Staff tries to access other pharmacy's requests |

---

#### 6. Get Request by ID

Returns a single medication request with full details including user and pharmacy information.

| Property | Value |
| -------- | ----- |
| **URL** | `GET /api/requests/:id` |
| **Auth** | Required |
| **Role** | Any authenticated user |

**Path Parameters:**

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `id` | string (ObjectId) | Request ID |

**Success Response (200):**

```json
{
  "success": true,
  "message": "Request retrieved successfully",
  "data": {
    "_id": "60d5ec49f1b2c72b1c8d4567",
    "userId": {
      "_id": "60d5ec49f1b2c72b1c8d1234",
      "name": "Test Patient",
      "email": "patient@test.com",
      "phone": "+94771234567"
    },
    "pharmacyId": {
      "_id": "60d5ec49f1b2c72b1c8d1235",
      "name": "City Pharmacy",
      "location": "Colombo",
      "contactInfo": "+94112345678"
    },
    "medicationName": "Amoxicillin 500mg",
    "quantity": 30,
    "urgencyLevel": "normal",
    "status": "pending",
    "prescriptionRequired": false,
    "notes": "Need this medication urgently",
    "requestDate": "2026-02-27T10:00:00.000Z",
    "responseDate": null,
    "estimatedAvailability": null,
    "createdAt": "2026-02-27T10:00:00.000Z",
    "updatedAt": "2026-02-27T10:00:00.000Z"
  }
}
```

**Error Responses:**

| Status | Condition |
| ------ | --------- |
| 400 | Invalid ObjectId format |
| 401 | Missing or invalid auth token |
| 403 | Patient tries to access another user's request |
| 404 | Request not found |

---

#### 7. Update Request

Updates editable fields of a pending request. Only the owning patient can update their own requests.

| Property | Value |
| -------- | ----- |
| **URL** | `PUT /api/requests/:id` |
| **Auth** | Required |
| **Role** | `Patient` |

**Path Parameters:**

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `id` | string (ObjectId) | Request ID |

**Request Body (all fields optional):**

```json
{
  "quantity": 45,
  "urgencyLevel": "urgent",
  "notes": "Updated quantity needed",
  "prescriptionImage": "https://example.com/new-prescription.jpg"
}
```

| Field | Type | Description |
| ----- | ---- | ----------- |
| `quantity` | integer | New quantity (min: 1) |
| `urgencyLevel` | string | New urgency: `urgent`, `normal`, or `low` |
| `notes` | string | Updated notes (max: 1000 chars) |
| `prescriptionImage` | string | New prescription image URL |

**Success Response (200):**

```json
{
  "success": true,
  "message": "Request updated successfully",
  "data": {
    "...updated request object...",
    "quantity": 45,
    "urgencyLevel": "urgent",
    "notes": "Updated quantity needed"
  }
}
```

**Error Responses:**

| Status | Condition |
| ------ | --------- |
| 400 | Request is not in `pending` status, invalid data |
| 401 | Missing or invalid auth token |
| 403 | Non-owner tries to update, or non-patient role |
| 404 | Request not found |

---

#### 8. Update Request Status

Updates the status of a medication request. Only pharmacy staff and system admins can change request status. Enforces valid status transitions and triggers patient notifications.

| Property | Value |
| -------- | ----- |
| **URL** | `PATCH /api/requests/:id/status` |
| **Auth** | Required |
| **Role** | `Pharmacy Staff`, `System Admin` |

**Valid Status Transitions:**

```
pending → processing → available → fulfilled
    ↓         ↓           ↓
unavailable  unavailable  cancelled
    ↓
cancelled
```

**Request Body:**

```json
{
  "status": "processing",
  "responseDate": "2026-02-27T11:00:00.000Z",
  "estimatedAvailability": "2026-03-01T14:00:00.000Z",
  "notes": "Processing your request. Expected availability: March 1st"
}
```

| Field | Type | Required | Description |
| ----- | ---- | -------- | ----------- |
| `status` | string | Yes | Target status from valid transitions |
| `responseDate` | string | No | Response timestamp (ISO 8601) |
| `estimatedAvailability` | string | No | Estimated availability date (ISO 8601) |
| `notes` | string | No | Status update notes |

**Success Response (200):**

```json
{
  "success": true,
  "message": "Request status updated successfully",
  "data": {
    "...updated request object...",
    "status": "processing",
    "responseDate": "2026-02-27T11:00:00.000Z",
    "estimatedAvailability": "2026-03-01T14:00:00.000Z",
    "notes": "Processing your request. Expected availability: March 1st"
  }
}
```

**Error Responses:**

| Status | Condition |
| ------ | --------- |
| 400 | Invalid status transition, invalid status value |
| 401 | Missing or invalid auth token |
| 403 | Patient role attempts to update, staff tries to update other pharmacy's request |
| 404 | Request not found |

---

#### 9. Cancel Request

Cancels a medication request. Patients can cancel their own requests; pharmacy staff and admins can cancel any request. Cannot cancel fulfilled or already-cancelled requests.

| Property | Value |
| -------- | ----- |
| **URL** | `DELETE /api/requests/:id` |
| **Auth** | Required |
| **Role** | `Patient`, `Pharmacy Staff`, `System Admin` |

**Path Parameters:**

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `id` | string (ObjectId) | Request ID |

**Request Body (optional):**

```json
{
  "reason": "No longer needed"
}
```

| Field | Type | Description |
| ----- | ---- | ----------- |
| `reason` | string | Cancellation reason (stored in notes) |

**Success Response (200):**

```json
{
  "success": true,
  "message": "Request cancelled successfully",
  "data": {
    "...updated request object...",
    "status": "cancelled",
    "responseDate": "2026-02-27T12:00:00.000Z",
    "notes": "No longer needed"
  }
}
```

**Error Responses:**

| Status | Condition |
| ------ | --------- |
| 400 | Request already fulfilled or cancelled |
| 401 | Missing or invalid auth token |
| 403 | Patient tries to cancel another user's request |
| 404 | Request not found |

---

## Testing Instruction Report

### Testing Environment Configuration

#### Prerequisites

- **Node.js** >= 18.x
- **npm** >= 9.x
- No external MongoDB instance required for unit/integration tests (uses in-memory server)
- **Artillery** (installed globally or via npx) for performance tests
- A running server instance for performance tests only

#### Environment Setup

1. Clone the repository and navigate to the backend directory:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file from the example (only needed for running the server, not for tests):

```bash
cp .env.example .env
```

4. Key environment variables for the test environment:

| Variable | Test Value | Description |
| -------- | ---------- | ----------- |
| `JWT_ACCESS_SECRET` | `test-jwt-secret-key` | Set automatically in test setup |
| `NODE_ENV` | `test` | Set automatically in test setup |
| `STRIPE_SECRET_KEY` | `sk_test_mock_key` | Uses built-in mock Stripe service |

Tests use **MongoDB Memory Server** (`mongodb-memory-server`), which spins up an ephemeral in-memory MongoDB instance — no external database configuration is needed.

#### Test Framework Configuration

The project uses **Jest** with **ts-jest** for TypeScript support. Configuration is in `backend/jest.config.ts`:

| Setting | Value | Purpose |
| ------- | ----- | ------- |
| `preset` | `ts-jest` | TypeScript compilation |
| `testEnvironment` | `node` | Node.js runtime |
| `testMatch` | `**/__tests__/**/*.test.ts` | Test file discovery pattern |
| `testTimeout` | `30000` (30s) | Timeout per test (accounts for DB operations) |
| `forceExit` | `true` | Force Jest to exit after tests complete |
| `detectOpenHandles` | `true` | Warn about open handles preventing exit |
| `verbose` | `true` | Detailed test output |

**Coverage collection** is configured for both Order and Request Medication module files:
- `src/services/order.service.ts`
- `src/controllers/order.controller.ts`
- `src/routes/order.routes.ts`
- `src/services/request.service.ts`
- `src/controllers/request.controller.ts`
- `src/routes/request.routes.ts`

#### Test Directory Structure

```
backend/src/__tests__/
├── helpers/
│   ├── app.helper.ts          # Creates Express app for integration tests
│   ├── auth.helper.ts         # JWT token generators (Patient, Staff, Admin)
│   ├── db.helper.ts           # MongoDB Memory Server connect/disconnect/clear
│   └── test-data.helper.ts    # Factory functions for test data
├── integration/
│   ├── order.api.test.ts      # API-level integration tests (48 tests)
│   └── request.api.test.ts   # Request API integration tests (47 tests)
├── unit/
│   ├── order.service.test.ts  # Service-level unit tests (44 tests)
│   └── request.service.test.ts # Request service unit tests (52 tests)
└── performance/
    ├── order.perf.yml         # Artillery load test configuration
    ├── order.perf.processor.js # Artillery processor with auth setup
    ├── request.perf.yml       # Request medication load test configuration
    ├── request.perf.processor.js # Request medication test processor
    └── seed-perf-data.js      # Performance test data seeding script
```

---

### Running Unit Tests

Unit tests validate the business logic of both `OrderService` and `RequestService` in isolation against a real (in-memory) MongoDB instance. They cover all service methods including request creation, status transitions, updates, cancellations, pagination, and order lifecycle management.

**Run all unit tests:**

```bash
npm run test:unit
```

**Run with coverage report:**

```bash
npm run test:coverage
```

The coverage report will be generated in the `backend/coverage/` directory in text, lcov, and clover formats.

**What the unit tests cover:**

**OrderService (44 tests across 11 describe blocks):**

| Service Method | Tests | Key Scenarios |
| -------------- | ----- | ------------- |
| `createOrder` | 10 | Successful creation, order number generation, tax calculation (5%), inventory decrement, request fulfillment, transaction rollback on failure, insufficient stock, forbidden access |
| `getOrders` | 5 | Pagination, status filter, payment status filter, empty page handling |
| `getOrderById` | 2 | Successful retrieval, not found error |
| `updateOrder` | 6 | Address update, delivery fee recalculation, estimated delivery, not found, blocked for delivered/cancelled orders |
| `updateOrderStatus` | 7 | Valid transitions (confirmed→packed→out_for_delivery→delivered), invalid transitions, tracking updates with location/notes, cancelled/delivered guards |
| `processPayment` | 5 | Successful Stripe payment, already paid guard, cancelled order guard, not found, Stripe failure with status rollback to `failed` |
| `cancelOrder` | 8 | Inventory restoration, request status revert, Stripe refund, already cancelled/delivered guards, permission checks (owner, Staff, Admin), tracking notes |
| `getUserOrders` | 2 | User-specific results, empty results |
| `getPharmacyOrders` | 2 | Pharmacy-specific results, empty results |
| `assignDeliveryPartner` | 5 | Successful assignment, tracking update, not found, cancelled/delivered guards |
| `getDeliveryTracking` | 2 | Tracking retrieval, not found |
| `generateInvoice` | 2 | Invoice URL generation, not found |
| `getDeliveryPartnerOrders` | 2 | Partner-specific results, empty results |

**RequestService (52 tests across 9 describe blocks):**

| Service Method | Tests | Key Scenarios |
| -------------- | ----- | ------------- |
| `createRequest` | 3 | Successful creation, default urgency level, estimated availability handling |
| `getRequests` | 5 | Pagination, status filter, urgency filter, date range filter, empty results |
| `getRequestById` | 2 | Successful retrieval, not found error |
| `getRequestsByUser` | 2 | User-specific results, empty results |
| `getRequestsByPharmacy` | 2 | Pharmacy-specific results, empty results |
| `getUrgentRequests` | 1 | Urgent requests filtering |
| `updateRequest` | 4 | Successful update, non-pending guard, ownership guard, not found |
| `updateRequestStatus` | 4 | Valid transition, invalid transition, pharmacy scope guard, response date handling |
| `cancelRequest` | 6 | Patient cancellation, staff/admin cancellation, ownership guard, fulfilled/cancelled guards, not found |

---

### Integration Testing Setup and Execution

Integration tests validate the full HTTP request/response cycle through Express routes, middleware (authentication, authorization, validation), controllers, and services. They use **Supertest** to make real HTTP requests against the Express app.

**Run all integration tests:**

```bash
npm run test:integration
```

**Run all tests (unit + integration) together:**

```bash
npm test
```

**How integration tests work:**

1. **Before all tests:** Connects to MongoDB Memory Server and creates the Express app.
2. **Before each test:** Clears all collections, creates fresh test users (Patient, Pharmacy Staff, System Admin), inventory, and medication requests.
3. **Each test:** Sends an HTTP request via Supertest and asserts on status codes, response body structure, and database side effects.
4. **After all tests:** Disconnects from MongoDB and stops the memory server.

**What the integration tests cover (48 tests across 12 describe blocks):**

| Endpoint | Tests | Key Scenarios |
| -------- | ----- | ------------- |
| `POST /api/orders` | 9 | Successful creation (201), auth required (401), role guard (403), validation (400), missing fields, empty items, invalid ObjectId, nonexistent request (404), invalid phone, negative fee, inventory decrement, request fulfillment |
| `GET /api/orders` | 6 | Staff access (200), admin access (200), patient blocked (403), status filter, pagination, auth required (401) |
| `GET /api/orders/:id` | 4 | Successful retrieval (200), not found (404), invalid ID (400), auth required (401) |
| `PUT /api/orders/:id` | 4 | Address update (200), delivery fee recalculation, delivered order blocked (400), patient blocked (403) |
| `PATCH /api/orders/:id/status` | 6 | Valid transition (200), invalid transition (400), invalid status value (400), patient blocked (403), tracking with location, full lifecycle test (confirmed→delivered) |
| `POST /api/orders/:id/payment` | 5 | Successful payment (200), already paid (400), missing method (400), invalid method (400), staff blocked (403) |
| `PATCH /api/orders/:id/cancel` | 6 | Successful cancellation (200), inventory restoration, request revert, already cancelled (400), delivered order (400), reason in tracking |
| `GET /api/orders/user/:userId` | 3 | User orders (200), empty results, invalid userId (400) |
| `GET /api/orders/pharmacy/:pharmacyId` | 2 | Pharmacy orders for staff (200), patient blocked (403) |
| `PATCH /api/orders/:id/assign-delivery` | 3 | Successful assignment (200), missing partner ID (400), patient blocked (403) |
| `GET /api/orders/track/:id` | 2 | Tracking info (200), not found (404) |
| `POST /api/orders/:id/invoice` | 2 | Invoice generation (200), not found (404) |
| Unknown Routes | 2 | Non-existent routes (400/404), wrong HTTP method (404) |
| Response Format | 2 | Standard success format validation, standard error format validation |

**Request API Integration Tests (47 tests across 9 describe blocks):**

| Endpoint | Tests | Key Scenarios |
| -------- | ----- | ------------- |
| `POST /api/requests` | 7 | Successful creation (201), auth required (401), role guard (403), validation (400), optional fields, invalid urgency, invalid quantity |
| `GET /api/requests` | 6 | Staff access (200), admin access (200), patient blocked (403), status filter, urgency filter, pagination |
| `GET /api/requests/urgent` | 2 | Staff access (200), patient blocked (403) |
| `GET /api/requests/user/:userId` | 3 | User access (200), admin access (200), patient blocked from other user (403) |
| `GET /api/requests/pharmacy/:pharmacyId` | 3 | Staff access (200), admin access (200), staff blocked from other pharmacy (403) |
| `GET /api/requests/:id` | 4 | Successful retrieval (200), not found (404), invalid ID (400), auth required (401) |
| `PUT /api/requests/:id` | 4 | Successful update (200), non-owner blocked (403), non-pending blocked (400), validation (400) |
| `PATCH /api/requests/:id/status` | 5 | Valid transition (200), invalid transition (400), patient blocked (403), staff scope guard, invalid status |
| `DELETE /api/requests/:id` | 6 | Patient cancellation (200), staff cancellation (200), admin cancellation (200), ownership guard, fulfilled guard, cancelled guard |

---

### Performance Testing Setup and Execution

Performance tests use **Artillery** to simulate realistic load against the running server. The test configuration includes three phases: warm-up, sustained load, and spike testing.

#### Prerequisites

1. Install Artillery globally (if not already installed):

```bash
npm install -g artillery
```

2. Start the application server:

```bash
npm run dev
```

3. Seed the database with performance test data:

```bash
npm run test:perf:seed
```

4. Set required environment variables with valid tokens and IDs from your seeded data:

```bash
export PERF_PATIENT_TOKEN="<JWT token for a Patient user>"
export PERF_STAFF_TOKEN="<JWT token for a Pharmacy Staff user>"
export PERF_ADMIN_TOKEN="<JWT token for a System Admin user>"
export PERF_ORDER_ID="<valid order _id>"
export PERF_REQUEST_ID="<valid request _id>"
export PERF_PENDING_REQUEST_ID="<valid pending request _id>"
export PERF_USER_ID="<valid user _id>"
export PERF_PHARMACY_ID="<valid pharmacy _id>"
```

#### Run Performance Tests

**Order Performance Tests:**

```bash
npm run test:perf
```

**Request Medication Performance Tests:**

```bash
npm run test:perf:requests
```

Or directly with Artillery:

```bash
artillery run src/__tests__/performance/order.perf.yml
artillery run src/__tests__/performance/request.perf.yml
```

#### Load Test Phases

| Phase | Duration | Arrival Rate | Description |
| ----- | -------- | ------------ | ----------- |
| Warm-up | 30s | 5 req/s | Gradual ramp-up |
| Sustained Load | 60s | 20 req/s | Steady traffic |
| Spike Test | 30s | 50 req/s | High traffic burst |

#### Test Scenarios and Weights

| Scenario | Weight | Method | Endpoint | Auth |
| -------- | ------ | ------ | -------- | ---- |
| Get all orders | 30% | GET | `/api/orders?page=1&limit=10` | Staff |
| Get order by ID | 25% | GET | `/api/orders/:id` | Patient |
| Get delivery tracking | 20% | GET | `/api/orders/track/:id` | Patient |
| Get user orders | 15% | GET | `/api/orders/user/:userId` | Patient |
| Get pharmacy orders | 10% | GET | `/api/orders/pharmacy/:pharmacyId` | Staff |

**Request Medication Performance Test Scenarios:**

| Scenario | Weight | Method | Endpoint | Auth |
| -------- | ------ | ------ | -------- | ---- |
| Get all requests | 25% | GET | `/api/requests?page=1&limit=10` | Staff |
| Get request by ID | 20% | GET | `/api/requests/:id` | Patient |
| Get user requests | 15% | GET | `/api/requests/user/:userId?page=1&limit=10` | Patient |
| Get pharmacy requests | 15% | GET | `/api/requests/pharmacy/:pharmacyId?page=1&limit=10` | Staff |
| Get urgent requests | 10% | GET | `/api/requests/urgent?page=1&limit=10` | Staff |
| Create new request | 10% | POST | `/api/requests` | Patient |
| Update request status | 5% | PATCH | `/api/requests/:id/status` | Staff |

#### Performance Thresholds

The test suite enforces the following performance thresholds via the Artillery `ensure` plugin:

| Metric | Threshold | Description |
| ------ | --------- | ----------- |
| `http.response_time.p95` | < 500ms | 95th percentile response time |
| `http.response_time.p99` | < 1000ms | 99th percentile response time |

If any threshold is exceeded, the test run will fail and report the violation.

#### Reading the Results

Artillery outputs a detailed report at the end of the run including:

- **Scenarios launched/completed** — Total virtual users created and finished
- **Request count** — Total HTTP requests made
- **Response time** — min, max, median, p95, p99
- **Status codes** — Breakdown of HTTP response codes (expect all 200)
- **RPS** — Requests per second throughput
- **Errors** — Any connection or timeout errors
