# CMR Services AI Digital Enrollment

A secure, full-stack multi-tenant patient enrollment platform with AI-powered form generation, session-based authentication, and dynamic branding capabilities.

## 🚀 Overview

AI Digital Enrollment is an enterprise patient enrollment platform that combines Spring Boot backend with Angular frontend, featuring AI-powered PDF form analysis, dynamic multi-tenant branding, and comprehensive authentication.

## 📁 Project Structure

```
ai-digital-enrollment-poc/
├── backend/              # Spring Boot REST API (Java 17)
├── frontend/             # Angular 17 application (TypeScript)
├── e2e-tests/            # Playwright end-to-end tests
├── Enrollment Forms/     # Sample PDF enrollment forms
├── DEPLOYMENT.md         # Railway deployment guide
├── AUTH_SETUP.md         # Authentication setup guide
└── README.md            # This file
```

## 🎯 Key Features

### Patient Enrollment
- **Multi-tenant architecture** - Manage multiple enrollment programs via Contentful CMS
- **Dynamic branding** - Per-program customization (colors, logos, footer text, company names)
- **AI-powered form generation** - Convert PDF forms to JSON schemas using Claude AI
- **Responsive design** - Works seamlessly on desktop, tablet, and mobile
- **Form submissions** - Store enrollment data in PostgreSQL (Supabase)
- **Visual schema editor** - Modify form fields without touching code

### AI Form Builder (Admin)
- **PDF analysis** - Upload PDF enrollment forms for automatic schema generation
- **Intelligent field detection** - Claude AI identifies form fields, types, and validation rules
- **Website color extraction** - Analyze company websites to suggest brand colors
- **PDF color analysis** - Extract colors directly from PDF forms
- **Logo fetching** - Automatic company logo retrieval
- **Screenshot preview** - Website screenshot capture for brand verification
- **Visual form editor** - Drag-and-drop interface for form customization
- **Program management** - Create, edit, and update enrollment programs
- **Form schema versioning** - Update existing forms with new PDFs

### Security & Authentication
- **Session-based authentication** - Secure login with HTTP-only cookies
- **Route protection** - All routes require authentication (redirects to login)
- **30-minute sessions** - Automatic timeout with secure session management
- **CORS support** - Configured for cross-origin requests with credentials
- **Branded login page** - Professional CMR Services login interface
- **Logout functionality** - Secure session invalidation

### Deployment
- **Railway ready** - Pre-configured for Railway cloud deployment
- **Environment-based configuration** - Separate settings for local/production
- **Health checks** - Comprehensive health monitoring endpoints
- **Static file serving** - Optimized production builds with Express server
- **Cross-origin cookies** - Proper SameSite and Secure attributes for HTTPS

## 🛠️ Technology Stack

### Backend
- **Spring Boot 3.2.1** - Enterprise Java application framework
- **Java 17** - LTS Java version
- **Spring Security** - Session-based authentication and authorization
- **Spring Data JPA** - ORM with Hibernate
- **PostgreSQL** - Relational database (via Supabase)
- **Contentful CMS** - Headless CMS for program management
- **Claude AI API** - Sonnet 4 for PDF analysis and form generation
- **Apache PDFBox 2.0.31** - PDF processing and text extraction
- **WebFlux** - Reactive HTTP client for external APIs
- **Maven** - Dependency management and build tool

### Frontend
- **Angular 17** - Modern TypeScript framework
- **TypeScript 5.4** - Type-safe JavaScript
- **Standalone Components** - Angular's latest architecture
- **RxJS 7.8** - Reactive programming
- **SCSS** - Advanced CSS with variables and mixins
- **ngx-color-picker** - Color selection component
- **Express 4.18** - Production static file server

### Infrastructure
- **Railway** - Cloud deployment platform
- **Supabase** - PostgreSQL hosting with connection pooling
- **GitHub** - Version control and CI/CD trigger
- **Playwright** - End-to-end testing framework

### External APIs
- **Claude AI (Anthropic)** - PDF analysis and form generation
- **Logo.dev** - Company logo fetching
- **ScreenshotOne** - Website screenshot capture

## 📋 Prerequisites

- **Java 17** or higher
- **Maven 3.6+**
- **Node.js 18+** and npm
- **PostgreSQL** database (Supabase recommended)
- **Contentful** account with space configured
- **Claude API key** (Anthropic)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/ramseychad1/ai-digital-enrollment-poc.git
cd ai-digital-enrollment-poc
```

### 2. Setup Environment Variables

```bash
# Copy the example file
cp backend/start.sh.example backend/start.sh

# Edit start.sh with your actual credentials
nano backend/start.sh
```

Required environment variables:

```bash
# Database (Supabase PostgreSQL)
export DB_URL="jdbc:postgresql://aws-0-us-west-2.pooler.supabase.com:5432/postgres"
export DB_USERNAME="postgres.your-project-id"
export SUPABASE_DB_PASSWORD="your-database-password"

# Contentful CMS
export CONTENTFUL_SPACE_ID="your-space-id"
export CONTENTFUL_ACCESS_TOKEN="your-delivery-token"
export CONTENTFUL_MANAGEMENT_TOKEN="your-management-token"

# Claude AI
export CLAUDE_API_KEY="sk-ant-your-api-key"

# Authentication (for local development)
export AUTH_USERNAME="demo"
export AUTH_PASSWORD="demo123"

# Database Schema Management (optional)
# export DDL_AUTO="validate"  # Default: validate (safe, no changes)
# export DDL_AUTO="update"    # Add new columns/tables without dropping
# export DDL_AUTO="create"    # Drop and recreate (DESTRUCTIVE - fresh start)

# Optional: External APIs
export LOGO_DEV_API_KEY="your-logo-dev-key"
export SCREENSHOTONE_API_KEY="your-screenshotone-key"
```

### 3. Start the Backend

```bash
cd backend
source start.sh  # Load environment variables
mvn spring-boot:run
```

Backend will start on `http://localhost:8080/api`

### 4. Start the Frontend

```bash
cd frontend
npm install  # First time only
npm start
```

Frontend will start on `http://localhost:4201`

### 5. Login

Navigate to `http://localhost:4201` and you'll be redirected to the login page.

**Default credentials:**
- Username: `demo`
- Password: `demo123` (or whatever you set in AUTH_PASSWORD)

## 🌐 Railway Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for complete Railway deployment instructions.

### Quick Deploy Checklist

1. **Create Railway project** with two services (backend and frontend)
2. **Connect GitHub repository** to both services
3. **Set root directories:**
   - Backend: `backend`
   - Frontend: `frontend`
4. **Add environment variables to backend:**
   - Database credentials (DB_URL, DB_USERNAME, SUPABASE_DB_PASSWORD)
   - Contentful credentials
   - Claude API key
   - Authentication (AUTH_USERNAME, AUTH_PASSWORD)
   - CORS origins
   - Session cookie configuration (SESSION_COOKIE_SECURE=true, SESSION_COOKIE_SAME_SITE=none)
5. **Generate public domains** for both services
6. **Update CORS_ALLOWED_ORIGINS** with frontend URL

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/login` | Login with username/password | No |
| POST | `/api/auth/logout` | Logout and invalidate session | No |
| GET | `/api/auth/status` | Check authentication status | No |

### Program Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/programs` | List all enrollment programs | Yes |
| GET | `/api/programs/{id}` | Get specific program details | Yes |
| POST | `/api/idp/publish` | Create new program | Yes |
| PUT | `/api/idp/update-program/{id}` | Update program | Yes |
| PUT | `/api/idp/update-program-with-schema/{id}` | Update program with new form | Yes |

### Form Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/forms/{formId}` | Get form schema | Yes |
| POST | `/api/idp/analyze-pdf` | Analyze PDF and generate schema | Yes |

### Submission Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/submissions` | Submit enrollment form | Yes |

### Admin/IDP Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/idp/analyze-colors` | Analyze website colors | Yes |
| POST | `/api/idp/analyze-pdf-colors` | Extract colors from PDF | Yes |
| POST | `/api/idp/fetch-logo` | Fetch company logo | Yes |
| POST | `/api/idp/capture-screenshot` | Capture website screenshot | Yes |

### Health Check Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/health` | Basic health check | No |
| GET | `/api/health/full` | Full system health | No |
| GET | `/api/health/database` | Database connectivity | No |
| GET | `/api/health/contentful` | Contentful connectivity | No |

## 🔐 Security

### Authentication
- Session-based authentication with HTTP-only cookies
- 30-minute session timeout
- Secure cookies for HTTPS (production)
- SameSite=None for cross-origin (Railway)
- BCrypt password hashing

### CORS Configuration
- Configured for cross-origin requests
- Credentials support enabled
- Origins whitelist via environment variable

### Best Practices
- Never commit secrets (start.sh in .gitignore)
- Rotate credentials regularly
- Use strong passwords for AUTH_PASSWORD
- Keep API keys secure and never expose client-side
- Review security settings before production deployment

## 🎨 Customization

### Adding a New Enrollment Program

1. Navigate to `/admin/form-builder`
2. Upload a PDF enrollment form
3. Review the AI-generated schema
4. Configure branding (colors, logo, company info)
5. Optionally analyze website colors or PDF colors
6. Publish to Contentful

### Editing an Existing Program

1. Navigate to program selector
2. Click "Edit" on a program card
3. Modify branding, form schema, or upload new PDF
4. Save changes

### Visual Form Editor

1. In form builder, click "Modify Form"
2. Use visual editor to:
   - Add/remove fields
   - Change field types
   - Update labels and placeholders
   - Configure validation rules
3. Save schema changes

## 🧪 Testing

### Unit Tests

```bash
# Backend tests
cd backend
mvn test

# Frontend tests
cd frontend
npm test
```

### E2E Tests

```bash
cd e2e-tests
npm install
npx playwright test
```

## 📖 Additional Documentation

- [Backend README](backend/README.md) - Detailed backend documentation
- [Frontend README](frontend/README.md) - Frontend architecture and components
- [DEPLOYMENT.md](DEPLOYMENT.md) - Railway deployment guide
- [AUTH_SETUP.md](AUTH_SETUP.md) - Authentication setup and testing

## 🤝 Contributing

1. Create a feature branch from `main`
2. Make your changes with clear commit messages
3. Test locally (both frontend and backend)
4. Push to GitHub (triggers Railway deployment)
5. Verify deployment on Railway
6. Submit a pull request

## 📝 Environment Variables Reference

### Backend Required
- `DB_URL` - PostgreSQL JDBC connection string
- `DB_USERNAME` - Database username
- `SUPABASE_DB_PASSWORD` - Database password
- `CONTENTFUL_SPACE_ID` - Contentful space ID
- `CONTENTFUL_ACCESS_TOKEN` - Contentful delivery token
- `CONTENTFUL_MANAGEMENT_TOKEN` - Contentful management token
- `CLAUDE_API_KEY` - Claude AI API key
- `AUTH_PASSWORD` - Authentication password (required for production)

### Backend Optional
- `AUTH_USERNAME` - Authentication username (default: demo)
- `DDL_AUTO` - Database schema management mode (default: validate)
  - `validate` - Verify schema matches entities, no changes (safest for production)
  - `update` - Add new tables/columns, never drops (safe for development)
  - `create` - Drop and recreate all tables (DESTRUCTIVE - use for fresh start only)
- `LOGO_DEV_API_KEY` - Logo.dev API key
- `SCREENSHOTONE_API_KEY` - ScreenshotOne API key
- `CORS_ALLOWED_ORIGINS` - Allowed CORS origins (default: http://localhost:4201)
- `SESSION_COOKIE_SECURE` - Secure cookie flag (default: false, set true for production)
- `SESSION_COOKIE_SAME_SITE` - SameSite attribute (default: lax, set none for cross-origin)

### Frontend (Railway Only)
- `API_URL` - Backend API URL (optional, auto-detected by default)

## 🗄️ Database Schema Management

The application uses environment-based database schema management to prevent accidental data loss.

### Schema Modes

**Default Mode: `validate`** (Production Safe)
- Verifies that entity classes match database schema
- Never modifies the database
- Application fails to start if schema mismatch detected
- **Use for**: Production, Railway deployment

**Update Mode: `update`**
- Automatically adds new tables and columns
- Never drops existing tables or columns
- Safe for iterative development
- **Use for**: Local development, staging environments

**Create Mode: `create`** ⚠️ **DESTRUCTIVE**
- Drops all tables and recreates from scratch
- **ALL DATA IS LOST**
- **Use for**: Fresh start, initial setup, testing

### Usage Examples

**Normal Development (preserves data):**
```bash
cd backend
source start.sh
mvn spring-boot:run
# Uses default 'validate' mode - safe restart
```

**Fresh Start (clears all data):**
```bash
cd backend
export DDL_AUTO=create
source start.sh
mvn spring-boot:run
# Drops and recreates all tables
```

**Development with Schema Changes:**
```bash
cd backend
export DDL_AUTO=update
source start.sh
mvn spring-boot:run
# Adds new tables/columns automatically
```

### Railway Configuration

For Railway production deployment, add environment variable:
```
DDL_AUTO=validate
```

This ensures the database schema is never modified automatically in production.

### First-Time Setup

On first run with an empty database, you have two options:

1. **Use `create` mode** (recommended for initial setup):
   ```bash
   export DDL_AUTO=create
   mvn spring-boot:run
   ```

2. **Run SQL schema manually** then use `validate`:
   - Create tables using provided SQL schema
   - Set `DDL_AUTO=validate` for subsequent runs

After initial setup, use `validate` (default) to protect your data.

## 🏢 License

Proprietary - CMR Services

## 📧 Support

For questions or issues, please contact the development team or submit an issue on GitHub.

---

**Powered by Claude AI** 🤖
