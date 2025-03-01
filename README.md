# Sales Order Management System API

![License](https://img.shields.io/badge/License-MIT-blue.svg)
![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)
![MongoDB Version](https://img.shields.io/badge/MongoDB-6.0%2B-brightgreen)
![Redis Version](https://img.shields.io/badge/Redis-6.x%2B-brightgreen)

Enterprise-grade backend system for managing sales operations with real-time capabilities and robust access control.

---

## Table of Contents

- [Key Features](#key-features)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Configuration (`.env`)](#configuration-env)
  - [Development](#development)
  - [Core Endpoints](#core-endpoints)
- [Real-Time Integration](#real-time-integration)
  - [WebSocket Connection](#websocket-connection)
  - [Event Payload Example](#event-payload-example)
- [Monitoring](#monitoring)
- [Contributing](#contributing)
- [License](#license)

---

## Key Features

- **Zero-Downtime Architecture**
  - Horizontal scaling support
  - Redis-backed rate limiting
  - Connection pooling (MongoDB/Redis)

- **Real-Time Operations**
  - WebSocket notifications for admin dashboards
  - Event-driven architecture
  - Socket.IO with Redis adapter

- **Enterprise Security**
  - JWT with RSA256 encryption
  - Role-Based Access Control (RBAC)
  - Helmet security headers
  - Request validation middleware

- **Observability**
  - Winston structured logging
  - Prometheus metrics endpoint
  - Health check endpoints
  - Automated error tracking

- **Automation**
  - Atomic order ID generation
  - Hourly cron jobs with locking
  - Database indexing strategies
  - Graceful shutdown handling

---

## Architecture

![System Architecture](docs/architecture-diagram.png)

**Tech Stack:**

- **Runtime:** Node.js 18 LTS
- **Framework:** Express 4.x
- **Database:** MongoDB Atlas (Sharded Cluster)
- **Cache:** Redis 6.x
- **Auth:** JWT, CASL
- **Realtime:** Socket.IO
- **Monitoring:** Prometheus, Grafana
- **CI/CD:** GitHub Actions

---

## Getting Started

### Prerequisites

- **Node.js:** v18.x or higher
- **Database:** MongoDB Atlas cluster
- **Cache:** Redis instance

### Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/sudouserx/sales-order-app.git
cd sales-order-app
npm ci --production=false
cp .env.example .env
```

### Configuration (`.env`)

Customize your environment variables:

```ini
# Core Configuration
JWT_SECRET="your_rsa_private_key_here"
MONGODB_URI="mongodb+srv://<user>:<pass>@cluster.mongodb.net/sales-order"
REDIS_URI="redis://:password@host:port"
PORT=3000

# Observability
LOG_LEVEL="info"
METRICS_PORT=9100

# Rate Limiting
API_RATE_LIMIT="1000/1h"
```

### Development

Start your development server with:

```bash
npm run dev
```

### Core Endpoints

| **Method** | **Endpoint**                 | **Auth**   | **Validation**           |
|------------|------------------------------|------------|--------------------------|
| `POST`   | `/api/orders`                | JWT + RBAC | Order Schema             |
| `GET`    | `/api/orders`                | Admin      | Pagination               |
| `POST`   | `/api/skus`                  | User       | SKU Schema               |
| `GET`    | `/api/reports/summaries`     | Admin      | Date Range Filtering     |

---

## Real-Time Integration

### WebSocket Connection

Establish a secure WebSocket connection:

```javascript
const socket = io('https://api.yourdomain.com', {
  query: { token: 'ADMIN_JWT_TOKEN' },
  transports: ['websocket']
});

socket.on('new_order', (payload) => {
  console.log('New Order:', payload);
});
```

### Event Payload Example

```json
{
  "event_id": "evt_01HXYZ987ABC",
  "type": "order.created",
  "data": {
    "order_id": "ORD-00001",
    "total_amount": 118000,
    "sales_rep": "john.doe@corp.com"
  },
  "metadata": {
    "timestamp": "2025-03-01T12:34:56Z",
    "source": "api-server-01"
  }
}
```

---

## Monitoring

### Metrics Endpoints

Monitor the health and performance of the service:

```http
GET /health       # Service health status
```

---

## Contributing

Contributions are welcome! To contribute:

1. **Fork the repository**
2. **Create a feature branch:** `git checkout -b feat/your-feature`
3. **Submit a pull request** with:
   - Test coverage report
   - API documentation updates
   - Migration scripts (if needed)

---

## License

This project is licensed under the [MIT License](LICENSE).  
