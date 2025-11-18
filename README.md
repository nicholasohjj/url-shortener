# URL Shortener - System Design Project

A production-ready URL shortener service built with Next.js, featuring a modern web interface, RESTful API, click tracking, and comprehensive system design documentation.

## 🚀 Features

- **URL Shortening**: Convert long URLs into short, shareable links
- **Custom Slugs**: Optionally specify custom slugs for your short URLs
- **Click Tracking**: Automatically track click counts and last accessed timestamps
- **Fast Redirects**: Optimized redirects with asynchronous click tracking (fire-and-forget)
- **Modern UI**: Clean, responsive interface with dark mode support
- **Database Schema Sync**: Automated database schema synchronization with migration generation
- **System Design Documentation**: Comprehensive PlantUML diagrams documenting the architecture

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **UI**: [React 19](https://react.dev/) + [Tailwind CSS 4](https://tailwindcss.com/)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **ORM**: [Prisma](https://www.prisma.io/)
- **ID Generation**: [nanoid](https://github.com/ai/nanoid)
- **Package Manager**: [pnpm](https://pnpm.io/)

## 📋 Prerequisites

- Node.js 20 or higher
- pnpm (or npm/yarn)
- PostgreSQL database
- Git

## 🏗️ Architecture

The application follows a clean architecture pattern with clear separation of concerns:

```
┌─────────────────┐
│  React Frontend │
└────────┬────────┘
         │
┌────────▼────────┐
│  Next.js Router │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───▼───┐ ┌──▼──────┐
│  API  │ │ Redirect│
│ Route │ │ Handler │
└───┬───┘ └──┬──────┘
    │        │
┌───▼────────▼───┐
│  Prisma ORM    │
└───────┬────────┘
        │
┌───────▼────────┐
│  PostgreSQL    │
└────────────────┘
```

### Key Components

1. **Frontend** (`app/page.tsx`): React component with form for URL shortening
2. **API Route** (`app/api/shorten/route.ts`): Handles POST requests to create short URLs
3. **Redirect Handler** (`app/[slug]/route.ts`): Handles GET requests to redirect short URLs
4. **Database Layer** (`lib/prisma.ts`): Prisma client singleton with connection pooling
5. **Schema Sync** (`scripts/sync-schema.js`): Automated database schema synchronization

## 🚦 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd system-design
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/url_shortener"
```

### 4. Set Up Database

```bash
# Generate Prisma Client
pnpm prisma generate

# Run migrations
pnpm prisma migrate dev

# Or sync schema from existing database
pnpm db:sync
```

### 5. Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📚 API Documentation

### Create Short URL

**Endpoint**: `POST /api/shorten`

**Request Body**:
```json
{
  "url": "https://example.com/very/long/url",
  "slug": "custom-slug" // optional
}
```

**Response** (200 OK):
```json
{
  "slug": "abc12345",
  "shortUrl": "http://localhost:3000/abc12345",
  "targetUrl": "https://example.com/very/long/url"
}
```

**Error Responses**:
- `400 Bad Request`: Invalid URL format or missing URL
- `500 Internal Server Error`: Failed to generate unique slug or database error

### Redirect Short URL

**Endpoint**: `GET /[slug]`

**Response**:
- `302 Found`: Redirects to the target URL
- `404 Not Found`: Short URL does not exist

**Note**: Click tracking is performed asynchronously to ensure fast redirects.

## 🗄️ Database Schema

### ShortUrl Model

```prisma
model ShortUrl {
  id            String    @id @default(cuid())
  slug          String    @unique
  targetUrl     String
  clicks        Int       @default(0)
  lastAccessedAt DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}
```

**Indexes**:
- Primary key on `id`
- Unique index on `slug` for fast lookups

## 🔄 Database Schema Sync

The project includes an automated schema synchronization system that:

1. Pulls the current database schema
2. Compares it with `schema.prisma`
3. Generates migrations for any differences
4. Marks migrations as applied (since DB already has changes)

**Usage**:
```bash
pnpm db:sync
```

**CI/CD**: A GitHub Actions workflow automatically syncs the schema on pushes to `main` or `develop` branches.

## 📊 System Design Diagrams

The project includes comprehensive PlantUML diagrams in the `diagrams/` directory:

- **System Overview** (`url-shortener/system-overview.puml`): Complete architecture diagram
- **Component Diagram** (`url-shortener/component-diagram.puml`): Component relationships
- **Create URL Sequence** (`url-shortener/create-url-sequence.puml`): Flow for creating short URLs
- **Redirect Sequence** (`url-shortener/redirect-sequence.puml`): Flow for redirecting short URLs
- **Data Flow** (`url-shortener/data-flow.puml`): Data flow through the system

To view these diagrams, use a PlantUML viewer or VS Code extension.

## 🧪 Development

### Available Scripts

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linter
pnpm lint

# Sync database schema
pnpm db:sync
```

### Code Structure

```
system-design/
├── app/                    # Next.js App Router
│   ├── [slug]/            # Dynamic route for redirects
│   ├── api/               # API routes
│   │   └── shorten/       # Shorten URL endpoint
│   ├── generated/         # Generated Prisma client
│   └── page.tsx           # Home page
├── diagrams/              # PlantUML system design diagrams
├── lib/                   # Shared utilities
│   └── prisma.ts         # Prisma client singleton
├── prisma/                # Database schema and migrations
│   ├── schema.prisma     # Prisma schema
│   └── migrations/       # Database migrations
├── scripts/               # Utility scripts
│   └── sync-schema.js    # Schema sync automation
└── .github/              # GitHub Actions workflows
    └── workflows/
        └── sync-db-schema.yml
```

## 🚀 Deployment

### Environment Variables

Ensure the following environment variables are set in your production environment:

- `DATABASE_URL`: PostgreSQL connection string
- `NODE_ENV`: Set to `production`

### Build and Deploy

```bash
# Build the application
pnpm build

# Start the production server
pnpm start
```

### Database Migrations

In production, run migrations using:

```bash
pnpm prisma migrate deploy
```

## 🎯 Performance Optimizations

1. **Asynchronous Click Tracking**: Click count updates are performed asynchronously (fire-and-forget) to ensure instant redirects
2. **Database Indexing**: Unique index on `slug` for O(1) lookups
3. **Connection Pooling**: Prisma client uses connection pooling for efficient database connections
4. **Next.js Optimization**: Leverages Next.js App Router for optimal performance

## 🔒 Security Considerations

- URL validation to prevent malicious inputs
- SQL injection protection via Prisma ORM
- Input sanitization for custom slugs
- Error handling that doesn't expose sensitive information

## 📝 License

This project is private and proprietary.

## 🤝 Contributing

This is a system design project. For contributions, please follow the existing code style and ensure all tests pass.

## 📧 Contact

For questions or issues, please open an issue in the repository.

