# LegalVault - Lawyer Case Management System

A modern, secure web application for lawyers to manage cases, documents, notes, and speeches.

## Features

- 🔐 **Secure Authentication** - Email/password authentication with Supabase
- 📁 **Case Management** - Create, organize, and track legal cases
- 📄 **Document Upload** - Upload and manage images, videos, audio files, and documents
- 📝 **Notes System** - Write and organize case notes
- 🎤 **Speech Editor** - Prepare and manage legal speeches and arguments
- 🎨 **Premium UI** - Modern, responsive design with glassmorphism effects
- 🔍 **Search & Filter** - Easily find cases with advanced filtering

## Tech Stack

- **Frontend**: React 18 + Vite
- **Routing**: React Router v6
- **Styling**: Custom CSS with modern design system
- **Icons**: Bootstrap Icons
- **Backend**: Supabase (Auth + Database + Storage)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account and project

### Installation

1. Clone the repository
```bash
cd frontend
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables

Create a `.env` file in the frontend directory:
```env
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

4. Start the development server
```bash
npm run dev
```

The application will open at `http://localhost:3000`

## Backend Setup

Refer to `../backend/requirements.md` for detailed Supabase setup instructions including:
- Database schema
- Row Level Security policies
- Storage bucket configuration
- Authentication setup

## Project Structure

```
frontend/
├── src/
│   ├── components/       # Reusable components
│   │   ├── Navbar.jsx
│   │   ├── CreateCaseModal.jsx
│   │   └── ProtectedRoute.jsx
│   ├── pages/           # Page components
│   │   ├── Login.jsx
│   │   ├── Signup.jsx
│   │   ├── Dashboard.jsx
│   │   └── CaseDetail.jsx
│   ├── hooks/           # Custom React hooks
│   │   └── useAuth.js
│   ├── lib/             # Utilities and configurations
│   │   └── supabase.js
│   ├── index.css        # Global styles and design system
│   ├── App.jsx          # Main app component with routing
│   └── main.jsx         # Entry point
├── index.html
├── package.json
└── vite.config.js
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Features Overview

### Authentication
- Secure email/password signup and login
- Protected routes with authentication guards
- Persistent sessions

### Dashboard
- Overview of all cases with statistics
- Search and filter functionality
- Quick case creation
- Status-based filtering (Active, Pending, Closed)

### Case Management
- Detailed case information display
- Client and court details
- Hearing date tracking
- Case status management

### Document Management
- Upload multiple file types (images, videos, audio, PDFs)
- Secure cloud storage with Supabase
- File preview and download
- Delete documents with confirmation

### Notes System
- Create and edit case notes
- Optional note titles
- Timestamp tracking
- Full CRUD operations

### Speech Editor
- Write and organize legal speeches
- Categorize by type (Opening, Closing, Examination, Argument)
- Full text editing capabilities
- Save and manage multiple speeches per case

## Design Features

- Modern gradient backgrounds
- Glassmorphism effects
- Smooth animations and transitions
- Responsive design for all screen sizes
- Dark mode support (system preference)
- Premium color palette
- Micro-interactions for better UX

## Security

- Row Level Security (RLS) on all database tables
- Secure file storage with signed URLs
- Authentication required for all protected routes
- User data isolation

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT

## Support

For backend integration questions, refer to `../backend/requirements.md`
