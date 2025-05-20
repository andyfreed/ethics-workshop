# CFP Ethics Workshop Management System

A professional React-based Ethics Workshop management system for FPA Chapters, focusing on streamlined course requests, participant management, and CFP Board reporting.

## Features

- Chapter request form for FPA chapters to request workshop sessions
- Workshop session management for administrators
- Participant sign-in system that collects name, CFP ID, and email
- Reporting functionality for CFP Board CE credit submission
- Supabase integration for database storage and synchronization
- Responsive design with professional UI
- Admin dashboard for managing workshops and participant data

## Technologies Used

- React with TypeScript
- Express.js backend
- Supabase for database and authentication
- Tailwind CSS for styling
- ShadCN UI components
- React Query for data fetching
- React Hook Form for form management
- Zod for validation

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account and project

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/andyfreed/ethics-workshop.git
   cd ethics-workshop
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Copy `.env.example` to `.env` and update with your Supabase credentials:
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   
   # Server Configuration
   PORT=5002
   NODE_ENV=development
   
   # Client Configuration
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_API_URL=http://localhost:5002
   VITE_DEV_SERVER_URL=http://localhost:3002
   ```

4. Start the backend server:
   ```bash
   npm run dev
   ```

5. In a new terminal, start the frontend:
   ```bash
   cd client
   npm run dev
   ```

6. Set up Supabase:
   - Navigate to `/admin/supabase-setup` in the application
   - Copy and run the SQL script in your Supabase SQL Editor
   - Use the "Sync Data to Supabase" button to synchronize data

## Running in Development Mode

The application supports a mock data fallback when Supabase is not configured. This allows for development without requiring an actual Supabase project. However, for full functionality, we recommend setting up Supabase.

## Starting in Production Mode

To build and start the application in production mode:

```bash
npm run build
npm start
```

## Supabase Configuration

The application requires the following Supabase tables:
- chapter_requests
- workshop_sessions
- participants
- users

The setup script on the admin panel provides the full SQL to create these tables.

## Usage

### For FPA Chapters

- Visit the homepage to see course descriptions
- Fill out the chapter request form to request a workshop
- Receive confirmation and follow-up communications

### For Administrators

- Manage chapter requests and workshop sessions
- View and export participant data
- Submit participant information to CFP Board for CE credits
- Synchronize data with Supabase

## License

This project is proprietary and confidential.
This project is proprietary and confidential.