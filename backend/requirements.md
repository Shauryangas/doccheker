# Backend Requirements - Lawyer Case Management System

## Overview
This document outlines the backend requirements for the Lawyer Case Management System. The backend uses **Supabase** for authentication, database, and file storage.

---

## 1. Supabase Project Setup

### 1.1 Create Supabase Project
1. Go to [https://supabase.com](https://supabase.com)
2. Create a new project
3. Note down:
   - **Project URL**: `https://your-project.supabase.co`
   - **Anon/Public Key**: Used in frontend
   - **Service Role Key**: Used for admin operations (keep secret)

### 1.2 Environment Variables
Provide these to the frontend developer:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

---

## 2. Database Schema

### 2.1 Tables

#### **users** (handled by Supabase Auth)
Supabase automatically creates this table. Additional profile data can be stored in a custom table.

#### **profiles**
```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  bar_license_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only read/update their own profile
CREATE POLICY "Users can view own profile" 
  ON profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);
```

#### **cases**
```sql
CREATE TABLE cases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lawyer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  case_number TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  client_name TEXT NOT NULL,
  client_contact TEXT,
  case_type TEXT, -- e.g., Criminal, Civil, Family, Corporate
  status TEXT DEFAULT 'active', -- active, closed, pending
  court_name TEXT,
  next_hearing_date TIMESTAMP WITH TIME ZONE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;

-- Policy: Lawyers can only see their own cases
CREATE POLICY "Lawyers can view own cases" 
  ON cases FOR SELECT 
  USING (auth.uid() = lawyer_id);

CREATE POLICY "Lawyers can insert own cases" 
  ON cases FOR INSERT 
  WITH CHECK (auth.uid() = lawyer_id);

CREATE POLICY "Lawyers can update own cases" 
  ON cases FOR UPDATE 
  USING (auth.uid() = lawyer_id);

CREATE POLICY "Lawyers can delete own cases" 
  ON cases FOR DELETE 
  USING (auth.uid() = lawyer_id);
```

#### **documents**
```sql
CREATE TABLE documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL, -- image, video, audio, pdf, etc.
  file_size BIGINT, -- in bytes
  storage_path TEXT NOT NULL, -- path in Supabase storage
  uploaded_by UUID REFERENCES auth.users(id) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access documents for their own cases
CREATE POLICY "Users can view own case documents" 
  ON documents FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM cases 
      WHERE cases.id = documents.case_id 
      AND cases.lawyer_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own case documents" 
  ON documents FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM cases 
      WHERE cases.id = documents.case_id 
      AND cases.lawyer_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own case documents" 
  ON documents FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM cases 
      WHERE cases.id = documents.case_id 
      AND cases.lawyer_id = auth.uid()
    )
  );
```

#### **notes**
```sql
CREATE TABLE notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE NOT NULL,
  title TEXT,
  content TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access notes for their own cases
CREATE POLICY "Users can view own case notes" 
  ON notes FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM cases 
      WHERE cases.id = notes.case_id 
      AND cases.lawyer_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own case notes" 
  ON notes FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM cases 
      WHERE cases.id = notes.case_id 
      AND cases.lawyer_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own case notes" 
  ON notes FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM cases 
      WHERE cases.id = notes.case_id 
      AND cases.lawyer_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own case notes" 
  ON notes FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM cases 
      WHERE cases.id = notes.case_id 
      AND cases.lawyer_id = auth.uid()
    )
  );
```

#### **speeches**
```sql
CREATE TABLE speeches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  speech_type TEXT, -- opening, closing, examination, argument
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE speeches ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access speeches for their own cases
CREATE POLICY "Users can view own case speeches" 
  ON speeches FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM cases 
      WHERE cases.id = speeches.case_id 
      AND cases.lawyer_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own case speeches" 
  ON speeches FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM cases 
      WHERE cases.id = speeches.case_id 
      AND cases.lawyer_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own case speeches" 
  ON speeches FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM cases 
      WHERE cases.id = speeches.case_id 
      AND cases.lawyer_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own case speeches" 
  ON speeches FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM cases 
      WHERE cases.id = speeches.case_id 
      AND cases.lawyer_id = auth.uid()
    )
  );
```

---

## 3. Storage Buckets

### 3.1 Create Storage Bucket
1. Go to Supabase Dashboard → Storage
2. Create a new bucket named: **`case-documents`**
3. Set it to **private** (not public)

### 3.2 Storage Policies
```sql
-- Policy: Users can upload files to their own cases
CREATE POLICY "Users can upload case documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'case-documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Users can view their own files
CREATE POLICY "Users can view own case documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'case-documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Users can delete their own files
CREATE POLICY "Users can delete own case documents"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'case-documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

### 3.3 File Organization
Files should be organized in the bucket as:
```
case-documents/
  {user_id}/
    {case_id}/
      {file_name}
```

Example: `case-documents/abc123-user-id/xyz789-case-id/evidence-photo.jpg`

---

## 4. Authentication Setup

### 4.1 Enable Email Authentication
1. Go to Supabase Dashboard → Authentication → Providers
2. Enable **Email** provider
3. Configure email templates (optional):
   - Confirmation email
   - Password reset email
   - Magic link email

### 4.2 Email Confirmation
- **Recommended**: Enable email confirmation for security
- Users must verify their email before accessing the system

### 4.3 Password Requirements
Set minimum password requirements:
- Minimum 8 characters
- At least one uppercase letter
- At least one number

---

## 5. API Integration Points

### 5.1 Frontend Will Use These Supabase Client Methods

#### Authentication
```javascript
// Sign up
supabase.auth.signUp({ email, password })

// Sign in
supabase.auth.signInWithPassword({ email, password })

// Sign out
supabase.auth.signOut()

// Get current user
supabase.auth.getUser()

// Listen to auth state changes
supabase.auth.onAuthStateChange((event, session) => {})
```

#### Database Operations
```javascript
// Fetch cases
supabase.from('cases').select('*').eq('lawyer_id', userId)

// Create case
supabase.from('cases').insert({ ... })

// Update case
supabase.from('cases').update({ ... }).eq('id', caseId)

// Delete case
supabase.from('cases').delete().eq('id', caseId)

// Similar operations for notes, speeches, documents
```

#### File Upload
```javascript
// Upload file
supabase.storage
  .from('case-documents')
  .upload(`${userId}/${caseId}/${fileName}`, file)

// Get public URL (for private buckets, use signed URLs)
supabase.storage
  .from('case-documents')
  .createSignedUrl(`${userId}/${caseId}/${fileName}`, 3600)

// Delete file
supabase.storage
  .from('case-documents')
  .remove([`${userId}/${caseId}/${fileName}`])
```

---

## 6. Security Considerations

### 6.1 Row Level Security (RLS)
- **CRITICAL**: All tables MUST have RLS enabled
- Policies ensure users can only access their own data
- Never disable RLS in production

### 6.2 File Upload Security
- Validate file types on frontend AND backend
- Set maximum file size limits (e.g., 100MB per file)
- Scan uploaded files for malware (optional, requires additional service)

### 6.3 API Keys
- **Never** expose the Service Role Key in frontend
- Use Anon Key in frontend (it's safe, RLS protects data)
- Store keys in environment variables

### 6.4 HTTPS
- Always use HTTPS in production
- Supabase provides HTTPS by default

---

## 7. File Upload Handling

### 7.1 Supported File Types
- **Images**: jpg, jpeg, png, gif, webp
- **Videos**: mp4, mov, avi, webm
- **Audio**: mp3, wav, m4a, ogg
- **Documents**: pdf, doc, docx

### 7.2 File Size Limits
- Maximum per file: **100 MB**
- Total storage per user: Set based on pricing plan

### 7.3 File Metadata
Store in `documents` table:
- Original filename
- File type/extension
- File size
- Upload timestamp
- Storage path
- Optional description

---

## 8. Database Triggers (Optional)

### 8.1 Auto-update `updated_at` Timestamp
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_cases_updated_at
  BEFORE UPDATE ON cases
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notes_updated_at
  BEFORE UPDATE ON notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_speeches_updated_at
  BEFORE UPDATE ON speeches
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### 8.2 Auto-create Profile on Signup
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

---

## 9. Testing Checklist

### 9.1 Authentication
- [ ] User can sign up with email/password
- [ ] User receives confirmation email
- [ ] User can log in after confirmation
- [ ] User can log out
- [ ] User cannot access protected routes when logged out

### 9.2 Case Management
- [ ] User can create a new case
- [ ] User can view all their cases
- [ ] User can update case details
- [ ] User can delete a case
- [ ] User cannot see other users' cases

### 9.3 Document Upload
- [ ] User can upload images
- [ ] User can upload videos
- [ ] User can upload audio files
- [ ] Files are stored in correct folder structure
- [ ] User can view/download uploaded files
- [ ] User can delete uploaded files

### 9.4 Notes & Speeches
- [ ] User can create notes for a case
- [ ] User can edit notes
- [ ] User can delete notes
- [ ] User can create speeches for a case
- [ ] User can edit speeches
- [ ] User can delete speeches

---

## 10. Deployment Notes

### 10.1 Environment Variables
Ensure these are set in production:
```
VITE_SUPABASE_URL=your-production-url
VITE_SUPABASE_ANON_KEY=your-production-anon-key
```

### 10.2 Database Migrations
- Run all SQL scripts in order
- Test RLS policies thoroughly
- Backup database before major changes

### 10.3 Monitoring
- Monitor Supabase dashboard for:
  - API usage
  - Storage usage
  - Database performance
  - Authentication logs

---

## 11. Future Enhancements (Optional)

- **Real-time collaboration**: Multiple lawyers on same case
- **Calendar integration**: Sync hearing dates with Google Calendar
- **Email notifications**: Remind lawyers of upcoming hearings
- **Document OCR**: Extract text from scanned documents
- **Search functionality**: Full-text search across cases, notes, speeches
- **Audit logs**: Track all changes to cases and documents
- **Role-based access**: Admin, Senior Lawyer, Junior Lawyer roles

---

## Contact & Support

For any questions or issues during backend integration:
- Refer to [Supabase Documentation](https://supabase.com/docs)
- Check [Supabase Discord](https://discord.supabase.com)
- Review this requirements document

---

**Document Version**: 1.0  
**Last Updated**: 2025-12-29
