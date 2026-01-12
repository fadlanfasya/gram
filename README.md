# GRAM - Graph Asset Management

A comprehensive asset management web application built with Next.js, inspired by DataGerry and GLPI.

## Features

- **Asset Management**: Customizable asset types with flexible data models (inspired by DataGerry)
- **Graph Visualization**: Interactive CI Explorer for visualizing asset relationships
- **Service Desk**: ITIL-compliant ticket management system (inspired by GLPI)
- **Reporting & Statistics**: Comprehensive reporting and analytics
- **REST API**: Full API for integration with external systems

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: SQLite with Prisma ORM
- **Styling**: Tailwind CSS
- **Graph Visualization**: React Flow (@xyflow/react)
- **Authentication**: NextAuth.js (to be implemented)
- **Forms**: React Hook Form with Zod validation

## Getting Started

### Prerequisites

- Node.js 20+ 
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up the database:
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

4. Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="file:./prisma/dev.db"
   NEXTAUTH_SECRET="your-secret-here"
   NEXTAUTH_URL="http://localhost:3000"
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
gram/
├── app/                    # Next.js App Router pages
│   ├── assets/            # Asset management pages
│   ├── tickets/           # Service desk pages
│   ├── graph/             # Graph visualization
│   └── api/               # API routes
├── components/            # React components
├── lib/                   # Utility libraries
│   ├── prisma.ts         # Prisma client
│   └── auth.ts           # Authentication helpers
├── prisma/                # Database schema and migrations
├── types/                 # TypeScript type definitions
└── public/                # Static assets
```

## Database Schema

The application uses the following main models:

- **User**: User accounts and authentication
- **AssetType**: Customizable asset type definitions
- **Asset**: Configuration items/assets
- **AssetRelation**: Relationships between assets (for graph visualization)
- **Ticket**: Service desk tickets
- **Comment**: Comments on assets and tickets
- **Activity**: Activity log/audit trail
- **Document**: Document attachments

## Development

### Database Migrations

```bash
# Create a new migration
npx prisma migrate dev --name migration_name

# Apply migrations
npx prisma migrate deploy

# Open Prisma Studio
npx prisma studio
```

### Building for Production

```bash
npm run build
npm start
```

## Known Issues

- Prisma client generation requires manual setup due to custom output path configuration
- Authentication system is not yet fully implemented

## License

MIT
