# Vehicle Stokvel Tracker

A comprehensive web application to manage a stokvel of 13 members contributing monthly to buy e-hailing vehicles. Built with React, TypeScript, Tailwind CSS, and Supabase.

## Features

### 🔐 Authentication
- Secure member login using Supabase Auth
- Email/password authentication
- Protected routes and session management

### 👥 Member Management
- Add, edit, and manage stokvel members
- Track rotation order for vehicle distribution
- Monitor member status and vehicle receipt

### 💰 Contribution Tracking
- Record monthly contributions for each member
- Upload proof of payment documents
- Verify and approve contributions
- Filter contributions by month
- Track pending and verified amounts

### 🚗 Payout Automation
- Automatic payout generation when balance reaches R100,000
- Sequential member rotation system
- Vehicle distribution tracking
- Rollover balance management

### 📊 Dashboard & Analytics
- Real-time balance tracking with progress indicators
- Monthly contribution trends
- Payout history visualization
- Member statistics and status overview
- Interactive charts using Recharts

### 📈 Reporting
- Monthly financial reports
- Member contribution summaries
- Export data to CSV format
- Comprehensive financial overviews

### ⚙️ Settings Management
- Configure stokvel parameters
- Set monthly contribution amounts
- Adjust vehicle target amounts
- Manage member count and start dates

## Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Vite** - Fast development and build tool
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/UI** - Beautiful, accessible UI components
- **React Query** - Data fetching and state management
- **React Router** - Client-side routing
- **Recharts** - Data visualization
- **Framer Motion** - Smooth animations
- **Lucide React** - Beautiful icons

### Backend
- **Supabase** - Backend-as-a-Service
- **PostgreSQL** - Relational database
- **Supabase Auth** - Authentication system
- **Row Level Security (RLS)** - Data security
- **Real-time subscriptions** - Live data updates

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Vehicle-Stokvel-Tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new Supabase project at [supabase.com](https://supabase.com)
   - Copy your project URL and anon key
   - Run the database schema from `database-schema.sql` in the Supabase SQL editor

4. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Update `.env.local` with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:5173`

## Database Schema

The application uses the following main tables:

- **members** - Member information and vehicle status
- **contributions** - Monthly contribution records
- **payouts** - Vehicle payout transactions  
- **settings** - Stokvel configuration

See `database-schema.sql` for the complete schema with triggers and policies.

## Usage

### Initial Setup
1. Create your first member account through the login page
2. Configure stokvel settings (target amount, monthly contribution, etc.)
3. Add all stokvel members with their rotation order
4. Start recording monthly contributions

### Monthly Workflow
1. Members make their monthly contributions
2. Admin records contributions in the system
3. Upload proof of payment documents
4. Verify and approve contributions
5. System automatically triggers payout when target is reached

### Payout Process
1. When balance ≥ R100,000, generate payout for next member
2. Complete the payout to mark member as vehicle recipient
3. System calculates rollover balance for next cycle
4. Process continues for remaining members

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Shadcn/UI components
│   ├── Layout.tsx      # Main layout wrapper
│   └── ProtectedRoute.tsx
├── contexts/           # React contexts
│   └── AuthContext.tsx # Authentication context
├── hooks/              # Custom React hooks
│   ├── useMembers.ts   # Member data operations
│   ├── useContributions.ts
│   ├── usePayouts.ts
│   └── useDashboard.ts
├── lib/                # Configuration and utilities
│   └── supabase.ts     # Supabase client setup
├── pages/              # Application pages
│   ├── Dashboard.tsx   # Main overview
│   ├── Members.tsx     # Member management
│   ├── Contributions.tsx
│   ├── Payouts.tsx
│   ├── Reports.tsx
│   ├── Settings.tsx
│   └── Login.tsx
├── types/              # TypeScript type definitions
│   ├── index.ts        # Main types
│   └── supabase.ts     # Database types
├── utils/              # Utility functions
│   ├── cn.ts          # Class name utility
│   ├── currency.ts    # Currency formatting
│   └── date.ts        # Date utilities
└── App.tsx            # Main application component
```

## Security Features

- **Row Level Security (RLS)** - Database-level access control
- **Authentication required** - All operations require valid session
- **Input validation** - Client and server-side validation
- **Protected routes** - Automatic redirect to login
- **Secure file uploads** - Proof of payment storage

## Business Logic

### Contribution Rules
- Monthly contributions of R3,500 per member
- Verification required before inclusion in balance
- Proof of payment optional but recommended

### Payout Rules  
- Triggered when verified balance ≥ R100,000
- Sequential distribution based on rotation order
- R100,000 fixed payout amount per member
- Automatic rollover of remaining balance

### Member Rotation
- Pre-defined rotation order (1-13)
- Skip members who already received vehicles
- Manual reordering possible through admin

## Deployment

### Frontend (Vercel/Netlify)
1. Connect your repository to Vercel or Netlify
2. Set environment variables in deployment settings
3. Deploy automatically on git push

### Backend (Supabase)
- Supabase handles all backend infrastructure
- Automatic scaling and backups
- Global CDN for optimal performance

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions:
- Create an issue in the GitHub repository
- Review the documentation and code comments
- Check the Supabase documentation for backend-related questions

## Roadmap

- [ ] WhatsApp integration for notifications
- [ ] Mobile app development
- [ ] Advanced reporting and analytics
- [ ] Multi-stokvel support
- [ ] Payment gateway integration
- [ ] Automated email reminders