# Modern TypeScript Full-Stack Template

A modern, type-safe full-stack application template featuring React, Hono, PostgreSQL, and MinIO with end-to-end type safety. Includes built-in item management and image upload functionality.

## Tech Stack

### Frontend

- **React 19** with TypeScript
- **TanStack Router** for file-based routing with type safety
- **TanStack Query** for server state management
- **Tailwind CSS** with shadcn/ui components
- **React Hook Form** with Zod validation
- **Vite** for fast development

### Backend

- **Hono** web framework for lightweight, fast APIs
- **tRPC** for type-safe client-server communication
- **Better-Auth** for authentication
- **Drizzle ORM** with PostgreSQL
- **MinIO** for object storage
- **Bun** runtime

### Database & Storage

- **PostgreSQL 17** with Drizzle ORM
- **MinIO** for scalable object storage
- Auto-migration on server startup
- Type-safe database operations

## Quick Start

### Prerequisites

- [Docker](https://www.docker.com/) and Docker Compose
- (Alternative) [Bun](https://bun.sh/) for local development

### Docker Setup (Recommended)

1. Start all services with Docker Compose:

```bash
docker compose up
```

This will start:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- PostgreSQL: localhost:5432
- MinIO: http://localhost:9000 (Console: http://localhost:9001)

The database migrations and MinIO bucket setup will run automatically.

### Local Development Setup

1. Install dependencies:

```bash
bun install
```

2. Set up PostgreSQL and MinIO (or use Docker for these services):

```bash
# Start only database and MinIO
docker compose up db minio minio-init
```

3. Set up your environment variables (see `.env.example`)

4. Generate and apply database migrations:

```bash
bun db:generate
```

5. Start development servers:

```bash
bun dev
```

This will start:

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

## Development Commands

### Docker Commands

```bash
docker compose up              # Start all services
docker compose down            # Stop all services
docker compose down -v         # Stop and remove volumes (fresh start)
docker compose logs app        # View application logs
docker compose logs db         # View database logs
docker compose logs minio      # View MinIO logs
docker compose exec app bun db:generate  # Generate migrations
docker compose restart app     # Restart application
```

### Root Commands (Local Development)

```bash
bun install           # Install all dependencies
bun dev               # Start both client and server
bun dev:client        # Start only frontend (port 5173)
bun dev:server        # Start only backend (port 3000)
bun typecheck         # Type check all packages
bun typecheck:client  # Type check frontend only
bun typecheck:server  # Type check backend only
bun db:generate       # Generate migration files
bun db:migrate        # Apply database migrations
bun clean             # Clean all node_modules and lock files
```

### Package-Specific Commands

**Client (`packages/client/`)**

```bash
cd packages/client
bun dev               # Start development server
bun build             # Build for production
bun typecheck         # Type check
```

**Server (`packages/server/`)**

```bash
cd packages/server
bun dev               # Start with hot reload
bun db:generate       # Generate migrations
bun db:migrate        # Apply migrations
bun typecheck         # Type check
```

## Key Features

### Built-in Functionality

- **Item Management**: Full CRUD operations for items with type-safe tRPC APIs
- **Image Upload**: Drag-and-drop image upload with MinIO object storage
  - 3-stage upload: presigned URL → MinIO → metadata confirmation
  - Image preview and management
  - Automatic URL generation for downloads
  - Support for JPEG, PNG, GIF, WebP (max 10MB)

### Type Safety

- **End-to-end type safety** with tRPC
- **Shared Zod schemas** for validation
- **TypeScript strict mode** enabled
- **Auto-generated route types** with TanStack Router

### Authentication

- **Better-Auth** integration
- Secure session management
- Ready-to-use auth components
- Protected routes and API endpoints

### Database & Storage

- **PostgreSQL** with Drizzle ORM
- **MinIO** for scalable object storage
- **Auto-migration** on development startup
- **Type-safe queries** and schemas
- **Migration versioning**
- **Presigned URLs** for secure uploads/downloads

### UI/UX

- **shadcn/ui** component system
- **Radix UI** primitives
- **Tailwind CSS** styling
- **Dark mode** support with next-themes
- **Responsive design**
- **Drag-and-drop** file upload
- **Real-time progress** indicators

## Database Setup

### Migration Workflow

1. **Edit schema** in `packages/server/src/db/schema.ts`
2. **Generate migration**:

   ```bash
   bun db:generate
   ```

3. **Apply migration**:

   ```bash
   bun dev  # Auto-applies on startup
   # OR manually:
   bun db:migrate
   ```

### Database Configuration

Configure your database connection in your environment:

```bash
# Development
DATABASE_URL="postgresql://username:password@localhost:5432/your_db"
```

## Application Features

### Items Management (`/items`)

- Create, read, update, and delete items
- Table view with sorting
- Real-time updates with optimistic UI
- Type-safe API calls with tRPC

### Image Management (`/images`)

- Upload images via drag-and-drop or file selector
- Grid view with hover actions
- Image preview dialog
- Delete confirmation
- Automatic thumbnail generation
- Secure presigned URLs for uploads and downloads

## Production Deployment

### Building

```bash
# Build client
cd packages/client && bun run build

# The server runs directly from TypeScript in production
```

### Environment Variables

Required environment variables:

- `DATABASE_URL` - PostgreSQL connection string
- `MINIO_ENDPOINT` - MinIO endpoint (internal)
- `MINIO_EXTERNAL_ENDPOINT` - MinIO endpoint (external/public)
- `MINIO_PORT` - MinIO port
- `MINIO_ACCESS_KEY` - MinIO access key
- `MINIO_SECRET_KEY` - MinIO secret key
- `MINIO_BUCKET` - MinIO bucket name
- `MINIO_UPLOAD_URL_EXPIRY` - Upload URL expiry time (seconds)
- Additional auth configuration as needed

See `.env.example` for a complete list of environment variables.

## Contributing

1. Follow the existing code style and conventions
2. Run type checking before committing: `bun typecheck`
3. Ensure all migrations are properly generated and tested
4. Use the existing component patterns and utilities

## License

This is a template project. Customize the license as needed for your project.
