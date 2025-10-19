# 📚 Learning Management System (LMS)

A full-stack **Learning Management System (LMS)** built with **Next.js 15**, **Supabase**, and **Tailwind CSS**.  
It allows instructors to create, manage, and edit courses while students can browse and enroll in them.  
Authentication, database management, and file storage are handled seamlessly via Supabase.

---

## 🚀 Project Overview

### 🎯 Features
- 🔐 Secure authentication via Supabase Auth
- 👩‍🏫 Instructor dashboard to manage courses
- 📘 CRUD operations for courses
- 🧑‍🎓 Student view for browsing and enrolling
- 🖼️ Profile management with avatar upload (Supabase Storage)
- ⚙️ Row Level Security (RLS) for access control
- 🌐 Deployed on **Vercel**

## 🧩 Data Model

Below is a simplified **Entity Relationship Diagram (ERD)** for the system:

![Data Model](https://drive.google.com/uc?export=view&id=1IvP9f99-cU9DJj09r-ik0OEbDa1ayP75)

## Access Control Notes (RLS)
Row Level Security (RLS) ensures that only authorized users can modify their own data.

## Policies Implemented

For courses:

-- Instructors can update their own courses
CREATE POLICY "allow_update_own_courses"
ON public.courses
FOR UPDATE
USING (auth.uid() = instructor_id);

-- Instructors can insert courses
CREATE POLICY "allow_insert_courses"
ON public.courses
FOR INSERT
WITH CHECK (auth.uid() = instructor_id);

-- Everyone can read public courses
CREATE POLICY "allow_read_courses"
ON public.courses
FOR SELECT
USING (true);

For profiles:

-- Each user can read and update their own profile
CREATE POLICY "allow_read_own_profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "allow_update_own_profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id);

## 🛠️ Local Setup Guide
## 1️⃣ Clone the Repository
git clone https://github.com/YOUR_USERNAME/LearningManagementSystem.git
cd LearningManagementSystem

## 2️⃣ Install Dependencies
npm install

## 3️⃣ Create a .env.local File

Add the following environment variables (from your Supabase project):

NEXT_PUBLIC_SUPABASE_URL=https://YOUR_SUPABASE_URL.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
(Do not expose SERVICE_ROLE_KEY publicly — only use it server-side if needed.)

## 4️⃣ Database Setup

Run these SQL scripts in your Supabase SQL editor:

-- Profiles Table
create table if not exists profiles (
  id uuid references auth.users(id) primary key,
  name text,
  email text,
  role text,
  bio text,
  avatar_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Courses Table
create table if not exists courses (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  instructor_id uuid references profiles(id) not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enrollments Table
create table if not exists enrollments (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid references profiles(id),
  course_id uuid references courses(id),
  created_at timestamp with time zone default now()
);


## Enable Row Level Security (RLS) on all tables:

alter table profiles enable row level security;
alter table courses enable row level security;
alter table enrollments enable row level security;


Then apply the policies listed in the Access Control section.

## 5️⃣ Run the Development Server
npm run dev

Open http://localhost:3000

## ⚙️ Feature Mapping
Requirement	Implemented Feature
Authentication	Supabase Auth with RLS
Create Course	Instructor creates via /courses/new
Edit Course	Instructor can update only their own
Delete Course	Instructor-only access
View Courses	Publicly viewable course list
Profile Page	Editable user profile with avatar upload
Access Control	RLS ensures secure per-user updates
Deployment	Deployed on Vercel with Supabase backend

## 🤖 AI Tools & MCPs Used
Tool / Product	Purpose
ChatGPT (GPT-5)	Code generation, debugging, SQL policies, and documentation writing
Supabase MCP	Managed cloud Postgres with auth, storage, and RLS policy control
Vercel AI Tools	For optimizing Next.js deployment and build logs
## 🌍 Deployment

The app is deployed via Vercel:

## 🔗 Production URL: https://leaning-management-system-k97y895fg-jigabardas-projects.vercel.app

(Replace with your actual URL after deployment.)

To redeploy:

vercel --prod

## 👨‍💻 Author
James Ivan Gabarda
Built with using Next.js, Supabase, and AI-assisted development.
