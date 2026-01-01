# LegalVault - Lawyer Case Management System

A modern, secure web application for lawyers to manage cases, documents, notes, and speeches.

## 📁 Project Structure

```
doccheker/
├── frontend/          # React application (COMPLETED ✅)
│   ├── src/
│   ├── package.json
│   ├── README.md
│   └── .env.example
│
└── backend/           # Backend requirements & documentation
    └── requirements.md
```

## 🚀 Quick Start

### Frontend (Ready to Use)

```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your Supabase credentials
npm run dev
```

### Backend (To Be Implemented)

See [backend/requirements.md](./backend/requirements.md) for complete Supabase setup instructions.

## ✨ Features

- 🔐 **Secure Authentication** - Email/password with Supabase
- 📁 **Case Management** - Create and organize legal cases
- 📄 **Document Upload** - Images, videos, audio, PDFs
- 📝 **Notes System** - Write and organize case notes
- 🎤 **Speech Editor** - Prepare legal speeches and arguments
- 🎨 **Premium UI** - Modern design with glassmorphism
- 🔍 **Search & Filter** - Advanced case filtering

## 🛠️ Tech Stack

### Frontend
- React 18 + Vite
- React Router v6
- Supabase JS Client
- Bootstrap Icons
- Custom CSS Design System

### Backend (To Be Configured)
- Supabase (Auth + Database + Storage)
- PostgreSQL with Row Level Security
- Cloud Storage for documents

## 📖 Documentation

- **Frontend README**: [frontend/README.md](./frontend/README.md)
- **Backend Requirements**: [backend/requirements.md](./backend/requirements.md)

## 🎯 Current Status

✅ **Frontend**: Complete and ready for backend integration  
⏳ **Backend**: Requires Supabase project setup (see requirements.md)

## 🔗 Integration Steps

1. **Set up Supabase Project**
   - Create project at [supabase.com](https://supabase.com)
   - Run SQL scripts from backend/requirements.md
   - Configure storage buckets
   - Set up authentication

2. **Configure Frontend**
   - Copy `.env.example` to `.env`
   - Add Supabase URL and anon key
   - Run `npm run dev`

3. **Test Application**
   - Sign up new user
   - Create cases
   - Upload documents
   - Write notes and speeches

## 📝 Notes

- Frontend is production-ready
- All Supabase integration points are documented
- Backend developer should refer to requirements.md
- Environment variables required for connection


