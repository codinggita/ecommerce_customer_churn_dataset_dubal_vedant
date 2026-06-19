# E-Commerce Customer Churn API

A Node.js + Express + MongoDB backend for analyzing e-commerce customer churn data.

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── db.js               MongoDB connection
│   ├── models/
│   │   ├── customer.model.js    Customer schema + indexes
│   │   └── user.model.js        User schema with bcrypt hashing
│   ├── services/
│   │   └── customer.service.js  Business logic layer
│   ├── controllers/
│   │   └── customer.controller.js Request/response handling
│   ├── routes/
│   │   ├── customer.routes.js   CRUD + filtered views + advanced routes
│   │   ├── analytics.routes.js  Aggregation analytics
│   │   ├── stats.routes.js      Statistics endpoints
│   │   ├── auth.routes.js       Auth + JWT endpoints
│   │   ├── search.routes.js     Search endpoints
│   │   └── filter.routes.js     Dynamic filter endpoints
│   ├── middlewares/
│   │   ├── auth.js              JWT verification
│   │   ├── error-handler.js     Global error handler
│   │   ├── rate-limit.js        Rate limiting
│   │   ├── request-time.js      Request timing logger
│   │   └── index.js             Middleware exports
│   ├── app.js                   Express setup + route mounting
│   └── seeder.js                Database seeding script
├── index.js                     Server entry point
├── .env                         Environment variables
└── package.json
```

## Setup

1. Start MongoDB locally
2. Configure `.env`:

```
PORT=3000
MONGO_URI=mongodb://localhost:27017/ecommerce_churn_db
JWT_SECRET=your_secret_key
NODE_ENV=development
```

3. Install dependencies and seed:

```bash
pnpm install
pnpm run seed
pnpm start
```

## API Endpoints

The API exposes 100+ endpoints across these categories:

- **CRUD** — `GET/POST/PUT/PATCH/DELETE /customers`, bulk operations
- **Filtered Views** — by country, city, gender, age, signup quarter, churn status
- **Query Filters** — min/max age, min purchases, min lifetime value, etc.
- **Pagination** — `?page=1&limit=20` on all list endpoints
- **Sorting** — `?sort=age`, `/sort/age-desc`
- **Search** — `GET /search/customers?q=france`
- **Analytics** — `/analytics/customers/top-buyers`, churn analysis, etc.
- **Statistics** — `/stats/customers/count`, averages, distributions
- **Auth** — register, login, profile, password reset, OTP
- **JWT** — token generate/verify/refresh, protected routes
- **Admin** — protected admin routes
- **Advanced** — random, trending, recommendations, churn predictions, segments, heatmaps, insights, alerts, dashboard
- **Middleware Demos** — logger, auth, rate-limit, error-handler
