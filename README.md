# Restaurant Order Management and QR Code Generation Platform for Restaurants — QResto

## 📌 Overview

**QResto** is a modern SaaS platform designed to simplify digital ordering and restaurant management for restaurants.
The platform allows restaurants to generate unique QR codes for tables, manage customer orders in real time, organize menus, and enhance the dining experience with a fast, contactless ordering system.

Built with a modern full-stack architecture using Next.js, Prisma ORM, Docker, and PostgreSQL, QResto provides scalability, performance, and a clean developer experience.


### Features
1. QR Code generation for restaurant tables
2. Digital menu management
3. Real-time restaurant order management
4. Full-stack architecture with Next.js
5. Database management with PostgreSQL
5. Prisma ORM integration
5. Responsive and modern UI
6. Docker-ready development environment
7. Secure API routes and backend logic
8. Scalable SaaS architecture

## 🛠️ Tech Stack

| Technology  | Purpose |
| ------------- |:-------------:|
| Next.js      | FullStack Framework     |
| React.js      | Frontend UI     |
| Typescript      | Type Safety     |
| Prisma ORM     | Database ORM     |
| Postgresql      | Relational Database     |
| Docker       | Containerization & Multi-stage Deployment |
| Tailwind CSS     | UI Styling     |
| Node.js      | Runtime environment     |

## Project Structure

```bash
QResto/
│
├── prisma/             # Prisma schema and migrations
├── public/             # Static assets
├── src/
│   ├── app/            # Next.js App Router
│   ├── components/     # Reusable UI components
│   ├── lib/            # Utility functions
│   ├── services/       # Business logic
│   ├── styles/         # Global styles
│   └── types/          # TypeScript types
│
├── docker-compose.yml
├── package.json
└── README.md
```

## Installation

### 1. Clone the repository

```bash
git clone git@github.com:Josue-ui582/qresto.git
cd qresto
```

## 2. Install dependencies and run the project

Make sure you have Node.js v20 installed.

### Docker Setup

Make sure you have Docker installed

cd qresto

#### create your docker-compose.yml file

```yml
version: '3.8'

name: qresto

services:
  postgres:
    image: postgres:15-alpine
    restart: always
    environment:
      POSTGRES_USER: myuser
      POSTGRES_PASSWORD: mypassword
      POSTGRES_DB: mydb
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  web:
    build:
      context: .
      dockerfile: Dockerfile
    restart: always
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: "postgresql://myuser:mypassword@postgres:5432/mydb?schema=public"
    depends_on:
      - postgres

volumes:
  - .:/app
```

#### create your Dockerfile

```Dockerfile
# -------------------------
# Stage 1: Dependencies
# -------------------------
FROM node:20-alpine AS deps

RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json yarn.lock ./

RUN corepack enable && yarn install --frozen-lockfile

COPY prisma ./prisma


# -------------------------
# Stage 2: Builder
# -------------------------
FROM node:20-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN corepack enable

# Generate Prisma Client
RUN npx prisma generate

# Build Next.js app
RUN yarn build


# -------------------------
# Stage 3: Runner
# -------------------------
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy production build
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

USER nextjs

EXPOSE 3000

# Run migrations + start server
CMD ["sh", "-c", "npx prisma migrate deploy && node server.js"]
```

### 3. Configure environment variables

Create a .env file:

```bash
DATABASE_URL="postgresql://postgres:password@localhost:5432/qresto"
```

🐳 Docker Setup

Run PostgreSQL with Docker:

```bash
docker compose up -build
```

### 🗄️ Prisma Setup

Run migrations:

```bash
npx prisma migrate dev
```

Open Prisma Studio:

```bash
npx prisma studio
```

Application avaible on [localhost:3000](http://localhost:3000/).

### 📱 QR Code System

Each restaurant table receives a unique QR code.
Customers can scan the QR code using their smartphone to:

- View the digital menu
- Place orders instantly
- Reduce waiting time
- Improve customer experience

### 🔐 Authentication & Security

QResto includes:

- Protected routes
- Secure backend APIs
- Environment variable protection
- Database validation with Prisma

### 📈 Future Improvements

- Online payments integration
- Real-time notifications
- Restaurant analytics dashboard
- Multi-restaurant support
- AI-powered recommendations
- Multi-language support

### 🤝 Contributing

Contributions are welcome.

1. Fork the project
2. Create your feature branch

```bash
git checkout -b feature/amazing-feature
```

3. Commit your changes

````bash
git commit -m "Add amazing feature"
````

#### 4. Push to the branch

```bash
git push origin <your-branch>
```

## 📄 License

This project is licensed under the MIT License.

### 👨‍💻 Author

Developed by QResto dev team 🚀
