# Sales Order Management System API

![License](https://img.shields.io/badge/License-MIT-blue.svg)
![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)
![MongoDB Version](https://img.shields.io/badge/MongoDB-6.0%2B-brightgreen)
![Express.js Version](https://img.shields.io/badge/Express-4.x-blue)

A robust, production-ready backend API for managing sales orders, customers, and inventory with real-time notifications and role-based access control.

---

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Configuration](#configuration)
- [API Documentation](#api-documentation)
- [Real-Time Features](#real-time-features)
- [Testing](#testing)
- [Deployment](#deployment)
- [Environment Variables](#environment-variables)
- [Security](#security)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- **Authentication & Authorization**:
  - JWT-based authentication
  - Role-Based Access Control (RBAC) using CASL
  - Secure password hashing with bcrypt

- **Core Functionality**:
  - SKU (Stock Keeping Unit) management
  - Customer management
  - Order creation and tracking
  - Data isolation between users

- **Real-Time Capabilities**:
  - WebSocket notifications for admins
  - Instant order placement alerts

- **Automation**:
  - Hourly order summaries via cron jobs
  - Automated order ID generation

- **Production-Ready**:
  - Rate limiting
  - Request validation
  - Comprehensive error handling
  - Logging and monitoring

---

## Tech Stack

- **Runtime**: Node.js 18.x
- **Framework**: Express.js 4.x
- **Database**: MongoDB Atlas
- **Authentication**: JWT
- **Authorization**: CASL
- **Real-Time**: Socket.IO
- **Cron Jobs**: node-cron
- **Validation**: Joi
- **Logging**: Winston

---

## Installation

### Prerequisites
- Node.js 18.x
- MongoDB Atlas cluster
- Redis (for rate limiting, optional)

### Steps
1. Clone the repository:
   ```bash
   git clone https://github.com/sudouserx/sales-order-app.git
   cd sales-order-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables (see [Configuration](#configuration)).

4. Start the server:
   ```bash
   npm start
   ```

---

## Configuration

Create a `.env` file in the root directory with the following variables:

```env
# Required
JWT_SECRET=your_jwt_secret_here
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/sales-order
PORT=3000

# Optional
REDIS_URI=redis://localhost:6379
LOG_LEVEL=info
API_RATE_LIMIT=1000/1h
```

---

## API Documentation

Explore the API using the interactive Swagger UI:
```http
GET /api-docs
```

### Key Endpoints

| Method | Endpoint                         | Description                    |
|--------|----------------------------------|--------------------------------|
| POST   | `/api/auth/signup`               | User registration              |
| POST   | `/api/auth/login`                | User login (JWT token)         |
| POST   | `/api/skus`                      | Create new SKU                 |
| POST   | `/api/customers`                 | Create new customer            |
| POST   | `/api/orders`                    | Create new order               |
| GET    | `/api/orders`                    | Fetch all orders (Admin only)  |
| GET    | `/api/reports/hourly-summaries`  | Hourly order summary           |

---

## Real-Time Features

Admins receive real-time notifications via WebSocket when new orders are placed.

### Example Notification
```json
{
  "message": "New order placed",
  "order_id": "ORD-00001",
  "user": "salesman1",
  "customer": "John Doe",
  "sku": "Laptop",
  "total_amount": 118000,
  "timestamp": "2025-02-28T14:05:00Z"
}
```

---

## Testing

Run the test suite:
```bash
npm test
```

---

## Deployment

### Docker
1. Build the Docker image:
   ```bash
   docker build -t sales-order-api .
   ```

2. Run the container:
   ```bash
   docker run -p 3000:3000 --env-file .env sales-order-api
   ```

### Kubernetes
Deploy using the provided Kubernetes manifests:
```bash
kubectl apply -f k8s/
```

---

## Environment Variables

| Variable         | Required | Default     | Description                           |
|------------------|----------|-------------|---------------------------------------|
| `JWT_SECRET`     | Yes      | -           | Secret for JWT signing                |
| `MONGODB_URI`    | Yes      | -           | MongoDB connection string             |
| `PORT`           | No       | 3000        | Server port                          |
| `REDIS_URI`      | No       | -           | Redis connection for rate limiting    |
| `LOG_LEVEL`      | No       | info        | Logging level (debug, info, warn, error) |

---

## Security

### Best Practices
- JWT tokens with expiration
- Role-based access control
- Input validation for all endpoints
- Rate limiting to prevent abuse
- Secure password hashing
- HTTPS enforced in production

---

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add your feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

---

## Support

For issues or questions, please open an issue on GitHub or contact:
- **Email**: ebrahimaliyou@gmail.com
