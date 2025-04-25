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
- Supabase database integration
- Drizzle ORM for database operations
- PostgreSQL database
- ShadCN UI components
- TailwindCSS for styling
- React Query for data fetching
- React Hook Form for form management
- Zod for validation

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
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
   Create a `.env` file in the root directory with the following variables:
   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/ethics_workshop
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Set up Supabase:
   - Navigate to `/admin/supabase-setup` in the application
   - Copy and run the SQL script in your Supabase SQL Editor
   - Use the "Sync Data to Supabase" button to synchronize your local data

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