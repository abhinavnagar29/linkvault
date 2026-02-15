# LinkVault - Secure File & Text Sharing

A modern web application for sharing text and files securely with expiring links, password protection, and user management.

---

## Overview

LinkVault allows users to upload text or files and generate unique, shareable links with customizable security options. Built with React, Node.js, Express, and PostgreSQL.

**Live Demo**: Upload → Generate Link → Share → Auto-Expire

---

## Features

- **Text & File Sharing** - Upload text or files (up to 50MB)
- **Custom Link Names** - Optional naming for organization
- **Password Protection** - Secure links with passwords
- **Flexible Expiry** - 10 mins, 1 hour, 1 day, 1 week, or custom
- **One-Time View** - Self-destruct after first access
- **Maximum Views** - Limit link access count
- **User Authentication** - Register, login, manage links
- **Search & Filter** - Find links by name, type, or status
- **QR Code Generation** - Easy mobile sharing
- **Syntax Highlighting** - Code display with auto language detection

---

## System Architecture

![System Architecture](images/high_level_system_architecture.png)

**Components:**
- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: PostgreSQL
- **Storage**: Cloudinary (file hosting)

---

## Data Flow

### Upload Flow (Text)
![Text Upload Flow](images/upload_flow_(text).png)

### Upload Flow (File)
![File Upload Flow](images/upload_flow_(file).png)

### Content Access Flow
![Access Flow](images/content_access_flow.png)

---

## Database Schema

![Database Schema](images/Database_Schema.png)

**Tables:**
- **users**: User accounts (email, password_hash)
- **links**: Shared content (unique_id, type, content, file_url, expires_at, etc.)

---

## Quick Start

### Prerequisites
- Node.js v18+
- PostgreSQL v14+
- Cloudinary account (free tier)

### Installation

**1. Clone Repository**
```bash
git clone <repository-url>
cd project_1
```

**2. Database Setup**
```bash
# Create database
psql -U postgres -c "CREATE DATABASE linkvault;"

# Run migrations
psql -U postgres -d linkvault -f backend/migrations/combined_migration.sql
```

**3. Backend Setup**
```bash
cd backend
npm install

# Create .env file:
DATABASE_URL=postgresql://user:password@localhost:5432/linkvault
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
JWT_SECRET=your_jwt_secret
PORT=3000
```

**4. Frontend Setup**
```bash
cd frontend
npm install
```

**5. Run Application**
```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

**6. Access Application**
- Frontend: http://localhost:5173
- Backend: http://localhost:3000

---

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | User login |
| GET | `/api/auth/me` | Get current user |

### Links
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload` | Create new link |
| GET | `/api/content/:id` | Access link content |
| GET | `/api/my-links` | Get user's links |
| DELETE | `/api/delete/:id` | Delete link |

### Profile
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/profile` | Get profile |
| PUT | `/api/profile/email` | Update email |
| PUT | `/api/profile/password` | Change password |

---

## Design Decisions

### Architecture
- **PostgreSQL**: ACID compliance, relational data integrity
- **Cloudinary**: Cloud storage, CDN distribution, no local files
- **JWT Auth**: Stateless, scalable, secure
- **React + Vite**: Fast development, modern tooling

### Security
- **nanoid**: Collision-resistant unique IDs (10 chars)
- **bcrypt**: Password hashing with salting
- **Soft Delete**: Audit trail preservation
- **Input Validation**: Frontend + backend protection

### UX
- **Glassmorphism**: Modern, professional design
- **Smart Toggles**: Preserves user preferences
- **Real-time Search**: Instant client-side filtering

---

## Assumptions & Limitations

### Assumptions
- Users have modern browsers (Chrome 90+, Firefox 88+, Safari 14+)
- Stable internet connection for file uploads
- File sizes under 50MB (Cloudinary free tier)
- Users understand expiry times and one-time views

### Limitations
- **File Size**: 50MB maximum (Cloudinary free tier)
- **Storage**: Third-party dependency (Cloudinary required)
- **Authentication**: No OAuth, no 2FA, no email reset
- **Performance**: Client-side search, no pagination
- **Security**: No rate limiting, no CAPTCHA, no malware scanning

### Future Enhancements
- Redis caching for performance
- Server-side pagination
- Rate limiting and CAPTCHA
- Email notifications
- Link editing capability
- Bulk operations

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | React 18 | UI framework |
| | Vite | Build tool |
| | Tailwind CSS v4 | Styling |
| | Axios | HTTP client |
| Backend | Node.js | Runtime |
| | Express.js | Web framework |
| | PostgreSQL | Database |
| | Cloudinary | File storage |
| Security | bcrypt | Password hashing |
| | JWT | Authentication |
| | nanoid | Unique IDs |

---

## Project Structure

```
project_1/
├── backend/
│   ├── config/              # Database & Cloudinary
│   ├── routes/              # API endpoints
│   ├── middleware/          # Authentication
│   ├── migrations/          # Database schema
│   ├── jobs/                # Cleanup cron
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── pages/           # React pages
│   │   ├── contexts/        # Auth context
│   │   ├── utils/           # Helpers
│   │   └── App.jsx
│   └── index.html
├── images/                  # Architecture diagrams
└── README.md
```

---

## Troubleshooting

**Database Connection Failed**
- Verify PostgreSQL is running
- Check credentials in `.env`
- Ensure database exists

**File Upload Fails**
- Verify Cloudinary credentials
- Check file size < 50MB
- Confirm internet connection

**CORS Errors**
- Backend must run on port 3000
- Frontend must run on port 5173
- Check CORS settings in `server.js`

---

## License

This project is for educational purposes (Design Lab Assignment).

---

## Author - ABHINAV NAGAR

**February 2026**

Full-stack application demonstrating React, Node.js, Express, PostgreSQL, and cloud integration.
