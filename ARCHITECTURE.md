# LinkVault - System Architecture

Complete technical architecture documentation with data flow diagrams.

---

## High-Level Architecture

![System Architecture](images/high_level_system_architecture.png)

### Component Layers

**1. Client Layer**
- Web browsers (Chrome, Firefox, Safari)
- Responsive UI for desktop and mobile

**2. Frontend Layer (React)**
- Home Page - Upload interface
- View Page - Content display
- My Links - Dashboard with search/filter
- Profile - User management
- API Client - Axios with interceptors

**3. Backend Layer (Express)**
- Auth Routes - Registration, login, JWT
- Upload Routes - Text and file handling
- Content Routes - Link access with validation
- Delete Routes - Soft delete implementation
- Middleware - Authentication, validation

**4. Data Layer**
- PostgreSQL - Users and links tables
- Cloudinary - File storage with CDN

**5. Background Jobs**
- Cleanup Cron - Runs hourly to delete expired links

---

## Data Flow Diagrams

### 1. Text Upload Flow

![Text Upload](images/upload_flow_(text).png)

**Process:**
1. User enters text in form
2. Frontend validates and sends POST request
3. Backend validates input
4. Generate unique ID (nanoid)
5. Hash password if provided (bcrypt)
6. Calculate expiry timestamp
7. Insert record into PostgreSQL
8. Return unique URL to frontend
9. Display success page with QR code

### 2. File Upload Flow

![File Upload](images/upload_flow_(file).png)

**Process:**
1. User selects file
2. Frontend validates file size (<50MB)
3. Send multipart/form-data to backend
4. Backend validates file
5. Generate unique ID
6. Upload file to Cloudinary
7. Receive file URL from Cloudinary
8. Store metadata in PostgreSQL
9. Return unique URL
10. Display success page

### 3. Content Access Flow

![Access Flow](images/content_access_flow.png)

**Validation Chain:**
1. User visits `/view/:id`
2. Backend queries database
3. Check if link exists → 404 if not
4. Check if expired → 410 if yes
5. Check password → 401 if wrong
6. Check max views → 410 if exceeded
7. Increment view count
8. Mark as deleted if one-time view
9. Return content to user

---

## Database Schema

![Database Schema](images/Database_Schema.png)

### Users Table
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Links Table
```sql
CREATE TABLE links (
    id SERIAL PRIMARY KEY,
    unique_id VARCHAR(20) UNIQUE NOT NULL,
    user_id INTEGER REFERENCES users(id),
    type VARCHAR(10) CHECK (type IN ('text', 'file')),
    content TEXT,
    file_url TEXT,
    file_name VARCHAR(255),
    file_size BIGINT,
    password_hash VARCHAR(255),
    expires_at TIMESTAMP NOT NULL,
    max_views INTEGER,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    link_name VARCHAR(255)
);

-- Indexes for performance
CREATE INDEX idx_links_unique_id ON links(unique_id);
CREATE INDEX idx_links_user_id ON links(user_id);
CREATE INDEX idx_links_expires_at ON links(expires_at);
```

---

## Security Architecture

### Authentication Flow
1. User registers → Password hashed with bcrypt
2. User logs in → JWT token generated
3. Token stored in HTTP-only cookie
4. Token validated on protected routes
5. Token expires after 7 days

### Link Security
- **Unique IDs**: 10-character nanoid (URL-safe)
- **Collision Probability**: ~2.7M years at 1000 IDs/hour for 1% collision
- **No Enumeration**: Links cannot be guessed
- **Password Protection**: Optional bcrypt-hashed passwords
- **Soft Delete**: Audit trail preservation

### Input Validation
- Frontend: Client-side validation for UX
- Backend: Server-side validation for security
- SQL Injection: Parameterized queries
- XSS Protection: Input sanitization

---

## Performance Optimizations

### Frontend
- Code splitting with React Router
- Lazy loading components
- Vite build optimization
- Browser caching for static assets

### Backend
- PostgreSQL connection pooling (max 20)
- Indexed database queries
- Async/await for non-blocking I/O
- Streaming file uploads

### Database
- Strategic indexes on frequently queried columns
- Soft delete to avoid immediate file deletion
- Batch cleanup via cron job

---

## Scalability Considerations

### Current Architecture
- Single server deployment
- PostgreSQL on same machine
- Cloudinary auto-scales for files
- No load balancing

### Future Scaling
1. **Horizontal Scaling**
   - Multiple backend instances
   - Load balancer (Nginx)
   - Shared PostgreSQL instance
   - Redis for session management

2. **Database Scaling**
   - Read replicas for content retrieval
   - Partitioning by date
   - Archival of old records

3. **Caching Layer**
   - Redis for frequently accessed links
   - CDN for static assets
   - Browser caching headers

---

## Technology Stack

| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| Frontend | React | 18.x | UI framework |
| | Vite | 5.x | Build tool |
| | Tailwind CSS | 4.x | Styling |
| | Axios | 1.x | HTTP client |
| Backend | Node.js | 18+ | Runtime |
| | Express | 4.x | Web framework |
| | PostgreSQL | 14+ | Database |
| | Cloudinary | - | File storage |
| Security | bcrypt | 5.x | Password hashing |
| | JWT | 9.x | Authentication |
| | nanoid | 5.x | Unique IDs |
| Jobs | node-cron | 3.x | Scheduled tasks |

---

## Deployment Architecture

### Recommended Setup
- **Frontend**: Vercel, Netlify (static hosting)
- **Backend**: Heroku, Railway, DigitalOcean
- **Database**: AWS RDS, DigitalOcean Managed PostgreSQL
- **Storage**: Cloudinary (already cloud-based)

### Production Checklist
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] HTTPS enabled
- [ ] CORS configured for production domain
- [ ] Cloudinary credentials secured
- [ ] Cron job running
- [ ] Error logging enabled
- [ ] Monitoring setup

---

## Monitoring & Logging

### Current Implementation
- Console logging for operations
- Error logging with stack traces (dev mode)
- Database connection monitoring
- Cleanup job execution logs

### Production Recommendations
- **Application**: PM2, New Relic
- **Errors**: Sentry
- **Logs**: Loggly, Papertrail
- **Database**: pgAdmin, DataDog
- **Uptime**: UptimeRobot, Pingdom

---

This architecture is designed for simplicity, security, and scalability.
