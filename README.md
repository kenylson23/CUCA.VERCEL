# CUCA Beer - Professional Sales Landing Page

A professional landing page for CUCA beer showcasing the brand's rich heritage through an interactive and dynamically animated React-based frontend.

## Features

- Professional sales landing page for CUCA beer
- Interactive product catalog
- Customer management system
- Order processing
- Contact form with admin panel
- Fan photo gallery with moderation
- Analytics tracking
- Admin dashboard

## Technology Stack

- **Frontend**: React with Framer Motion, Tailwind CSS
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM
- **Authentication**: Passport.js
- **Deployment**: Vercel

## Database Setup

The database schema includes:

- Users and admin users
- Product catalog
- Order management
- Contact messages
- Analytics events
- Fan photo gallery
- Session storage

## Environment Variables

Create a `.env` file with:

```env
DATABASE_URL="postgresql://username:password@host:port/database?sslmode=require"
```

## Development

1. Install dependencies:
```bash
npm install
```

2. Set up your database URL in `.env`

3. Run database migrations:
```bash
npm run db:push
```

4. Start the development server:
```bash
npm run dev
```

## Deployment to Vercel

1. Connect your repository to Vercel
2. Configure environment variables in Vercel dashboard:
   ```
   DATABASE_URL=your_postgresql_connection_string
   SESSION_SECRET=your-secure-session-secret
   JWT_SECRET=your-secure-jwt-secret
   NODE_ENV=production
   VERCEL=1
   ```
3. Deploy

The project includes a `vercel.json` configuration file for proper deployment.

## Database Schema

The application includes complete CRUD operations for:
- Product management
- User registration and authentication
- Order processing
- Contact message handling
- Fan photo gallery with moderation
- Analytics tracking