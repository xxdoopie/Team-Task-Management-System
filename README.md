# Team Task Management System

A comprehensive full-stack web application for team collaboration and task management, built with modern technologies and featuring role-based access control.
<img width="1885" height="946" alt="image" src="https://github.com/user-attachments/assets/8d1feae0-f051-480a-b4f8-0a773d0c31ef" />

## 🚀 Live Demo

https://team-management-app-alpha.vercel.app/
Here are some demo accounts to use:
  an admin account: admin@gmail.com / Admin@123
  an employee account: mike@mikecorp.com / Employee@123

Or you can create your own admin or employee account:
To create an admin account, The admin code is: ABCD1234 


## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Database Models](#database-models)
- [Getting Started](#getting-started)
- [Environment Setup](#environment-setup)
- [Authentication Flow](#authentication-flow)
- [API Endpoints](#api-endpoints)
- [Supported Features](#supported-features)
- [Screenshots](#screenshots)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

### 🔑 Admin Features
- **Dashboard Analytics**: Comprehensive overview of team performance and task statistics
- **Task Management**: Create, assign, and monitor tasks with priority levels
- **Team Management**: Add/remove team members and manage user roles
- **Progress Tracking**: Real-time monitoring of task completion rates
- **Data Export**: Download CSV reports for tasks and team statistics
- **File Attachments**: Support for links and file uploads on tasks
- **Advanced Filtering**: Filter tasks by status, priority, assignee, and date ranges

### 👥 Employee Features
- **Personal Dashboard**: View assigned tasks and personal completion statistics
- **Interactive Todo Lists**: Check off subtasks with automatic progress calculation
- **Task Updates**: Update task status and add comments
- **Real-time Sync**: Automatic database synchronization on progress changes
- **Deadline Tracking**: Visual indicators for upcoming and overdue tasks
- **Task History**: View completed tasks and achievement metrics

### 🔐 Authentication & Security
- **JWT-based Authentication**: Secure token-based user sessions
- **Role-based Access Control**: Separate admin and employee permissions
- **Password Hashing**: bcrypt encryption for secure password storage
- **Protected Routes**: Server-side route protection
- **Admin Code Verification**: Additional security layer for admin registration

## 🛠 Tech Stack

**Frontend:**
- **Framework**: Next.js 15.4.5 with React 19.1.0
- **Styling**: Tailwind CSS 4.1.11
- **Charts**: Recharts 3.1.2
- **Icons**: Lucide React 0.536.0

**Backend:**
- **Runtime**: Node.js with Next.js API Routes
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (jsonwebtoken 9.0.2)
- **Password Hashing**: bcryptjs 3.0.2
- **File Storage**: Cloudinary 2.7.0

**Development:**
- **Linting**: ESLint with Next.js config
- **Package Manager**: npm
- **Development Server**: Next.js with Turbopack


## 🗄️ Database Models

### User Model
```javascript
{
  email: String (unique, required),
  password: String (hashed, required),
  name: String (required),
  role: String (admin/employee),
  avatar: String (default provided),
  isActive: Boolean (default: true),
  completionRate: Number (0-100),
  createdAt: Date,
  lastLogin: Date
}
```

### Task Model
```javascript
{
  title: String (required),
  description: String,
  priority: String (Low/Medium/High Priority),
  status: String (Pending/In Progress/Completed),
  dueDate: Date (required),
  assignedTo: [ObjectId] (User references),
  createdBy: ObjectId (User reference),
  todoItems: [TodoItemSchema],
  attachments: [AttachmentSchema],
  completionPercentage: Number (0-100),
  estimatedHours: Number,
  actualHours: Number,
  tags: [String],
  comments: [CommentSchema]
}
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB Atlas account or local MongoDB installation
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/xxdoopie/Company-Task-Management-System.git
   cd team-task-management
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

4. **Configure your environment** (see [Environment Setup](#environment-setup))

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   ```
   http://localhost:3000
   ```

## 🔧 Environment Setup

Create a `.env.local` file in the root directory with the following variables:

```env
# Database Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/TaskManagement?retryWrites=true&w=majority

# Authentication Secrets
JWT_SECRET=your-super-secret-jwt-key
NEXTAUTH_SECRET=your-nextauth-secret

# Admin Configuration
ADMIN_CODE=your-admin-registration-code

# Application URLs
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000

# Optional: Cloudinary for file uploads
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### Database Setup

1. **Create a MongoDB Atlas account** at [mongodb.com](https://www.mongodb.com/)
2. **Create a new cluster** and database named `TaskManagement`
3. **Get your connection string** and add it to `MONGODB_URI`
4. **Whitelist your IP address** in MongoDB Atlas Network Access

### Generating Secrets

Generate secure secrets using these commands:

```bash
# For JWT_SECRET and NEXTAUTH_SECRET
openssl rand -base64 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## 🔐 Authentication Flow

### User Registration
1. Users access `/signup` route
2. Admin users require special `ADMIN_CODE` for registration
3. Passwords are hashed using bcrypt with salt rounds of 12
4. User data is stored in MongoDB with role-based permissions

### User Login
1. Users submit credentials to `/api/auth/login`
2. System validates credentials using bcrypt comparison
3. JWT token is generated and returned
4. Token includes user ID, email, and role
5. Client stores token for subsequent API requests

### Route Protection
- **Public routes**: `/`, `/login`, `/signup`
- **Admin routes**: `/admin/*` - requires admin role
- **Employee routes**: `/employee/*` - requires employee role
- **API routes**: Most require valid JWT token

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/signup` - User registration

### Tasks
- `GET /api/tasks` - Get all tasks (filtered by user role)
- `POST /api/tasks` - Create new task (admin only)
- `PUT /api/tasks/[id]` - Update task
- `DELETE /api/tasks/[id]` - Delete task (admin only)
- `GET /api/tasks/export` - Export tasks as CSV

### Users
- `GET /api/users` - Get all users (admin only)
- `PUT /api/users/[id]` - Update user profile
- `DELETE /api/users/[id]` - Delete user (admin only)

### Admin
- `GET /api/admin/dashboard` - Dashboard statistics
- `POST /api/admin/assign-task` - Assign task to users

## 📊 Supported Features

| Feature | Status | Notes |
|---------|--------|-------|
| ✅ Multi-Device Support | Supported | Responsive design |
| ✅ Real-time Updates | Supported | Automatic progress sync |
| ✅ Cookies | Automatic Page Access Sync |
| ✅ File Attachments | Supported | Links and file uploads |
| ✅ CSV Export | Supported | Task and user statistics |
| ✅ Role-based Access | Supported | Admin and Employee roles |
| ✅ Task Prioritization | Supported | Low, Medium, High priority |
| ✅ Progress Tracking | Supported | Automatic percentage calculation |
| ✅ Search & Filter | Supported | Multi-criteria filtering |
| ✅ Dashboard Analytics | Supported | Charts and statistics |
| ✅ Due Date Management | Supported | Date tracking and alerts |
| ✅ Todo Checklists | Supported | Subtask management |
| ✅ Team Management | Supported | Admins have access to all CRUD operations / Employees(RU) |
| ✅ Data Validation | Supported | Client and server-side |
| ✅ Error Handling | Supported | Comprehensive error management |

## 📸 Screenshots

### Admin Dashboard
<img width="1160" height="829" alt="image" src="https://github.com/user-attachments/assets/2c0714ed-a2e3-4905-99c8-1645062976a7" />

### Employee Dashboard
<img width="1015" height="872" alt="image" src="https://github.com/user-attachments/assets/b623c324-4961-4f87-b3c5-4444fd6e12ec" />

### Task Creation
<img width="553" height="455" alt="image" src="https://github.com/user-attachments/assets/3aa55b8a-d617-4dde-87f6-e14da5c0b104" />

### Team Management
<img width="554" height="209" alt="image" src="https://github.com/user-attachments/assets/55be730f-cecf-480f-9365-896b4c4598a2" />
<img width="554" height="125" alt="image" src="https://github.com/user-attachments/assets/db82074b-d10f-4e7e-91e1-40eb59284066" />
<img width="553" height="279" alt="image" src="https://github.com/user-attachments/assets/8f9f4da1-e8b2-46a8-bcf6-4d799d275e81" />


## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Import project in Vercel dashboard
3. Add environment variables
4. Deploy automatically

### Other Platforms
The app can be deployed on any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean
- AWS Amplify

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow existing code style and conventions
- Write meaningful commit messages
- Add comments for complex logic
- Test your changes thoroughly
- Update documentation as needed

## 👨‍💻 Author

**xxdoopie**
- GitHub: [@xxdoopie](https://github.com/xxdoopie)
- LinkedIn: www.linkedin.com/in/wesley-odhiambo-74b571382
- Email: tlegendfox@gmail.com / mpkggamer@gmail.com

⭐ **Star this repository if you found it helpful!**

*Built with ❤️ for efficient team collaboration*
