# AI Digital Enrollment POC - Claude.md

## Project Overview

AI Digital Enrollment is a proof-of-concept application that uses AI (Claude and Google Gemini) to automatically convert PDF enrollment forms into interactive web forms. The system analyzes PDF documents, extracts form fields, generates JSON schemas, and creates branded enrollment forms stored in Contentful CMS.

**Tech Stack:**
- **Frontend:** Angular 17 (standalone components), TypeScript, SCSS
- **Backend:** Spring Boot 3.2.1, Java 25
- **Database:** PostgreSQL (Supabase)
- **CMS:** Contentful
- **AI Services:** Claude Sonnet 4.5, Google Gemini 2.0 Flash
- **Deployment:** Railway (production)

## Project Structure

```
ai-digital-enrollment-poc/
├── frontend/                    # Angular application
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/
│   │   │   │   ├── auth/      # Login/authentication
│   │   │   │   ├── admin/     # Form builder, program management
│   │   │   │   ├── enrollment/ # Public enrollment forms
│   │   │   │   └── shared/    # Header, footer, reusable components
│   │   │   ├── services/       # API services, auth, branding
│   │   │   ├── models/         # TypeScript interfaces
│   │   │   └── interceptors/   # HTTP interceptors
│   │   └── _variables.scss     # Global SCSS variables
│   └── package.json
│
├── backend/                     # Spring Boot API
│   ├── src/main/
│   │   ├── java/.../enrollment/
│   │   │   ├── controller/     # REST endpoints
│   │   │   ├── service/        # Business logic, AI integration
│   │   │   ├── model/          # Entities and DTOs
│   │   │   ├── repository/     # JPA repositories
│   │   │   └── config/         # Security, Contentful, CORS
│   │   └── resources/
│   │       └── application.yml # Configuration
│   ├── start.sh                # Local startup with env vars
│   └── pom.xml
│
└── pencil/                      # UI/UX designs (.pen files)
```

## Architecture

### Frontend (Angular)
- **Port:** 4201 (local), Railway-assigned (prod)
- **Key Features:**
  - User authentication with session management
  - PDF upload with AI provider selection (Google/Claude)
  - Visual form builder with live preview
  - Dynamic enrollment forms with theming
  - Admin dashboard for program management

### Backend (Spring Boot)
- **Port:** 8080 (local), Railway-assigned (prod)
- **Context Path:** `/api`
- **Key Features:**
  - PDF to image conversion (PDFBox)
  - AI-powered schema generation (Claude & Google)
  - Contentful CMS integration
  - Session-based authentication (30min timeout)
  - Response caching with cache eviction

## Development Setup

### Starting Local Environment

**Backend:**
```bash
cd backend
./start.sh  # Starts with environment variables
```

**Frontend:**
```bash
cd frontend
npm start   # Runs on http://localhost:4201
```

**Important:** Always use `start.sh` for backend to load environment variables (database, API keys, etc.)

### Environment Variables (start.sh)

```bash
# Database
SUPABASE_DB_PASSWORD

# Contentful CMS
CONTENTFUL_SPACE_ID
CONTENTFUL_ACCESS_TOKEN
CONTENTFUL_MANAGEMENT_TOKEN

# AI Services
CLAUDE_API_KEY
GOOGLE_AI_API_KEY

# External APIs
LOGO_DEV_API_KEY
SCREENSHOTONE_API_KEY

# Authentication
AUTH_USERNAME=demo
AUTH_PASSWORD=demo123
```

## Key Services & APIs

### Backend Services

**ClaudeApiService** (`service/ClaudeApiService.java`)
- Analyzes PDFs using Claude Sonnet 4.5
- Converts PDF pages to base64 images
- Sends to Claude Vision API with structured prompt
- Returns JSON schema for form generation

**GoogleAiService** (`service/GoogleAiService.java`)
- Analyzes PDFs using Google Gemini 2.0 Flash
- Uses same prompt as Claude for consistency
- API key sent via `X-goog-api-key` header

**ContentfulService** (`service/ContentfulService.java`)
- Fetches programs and form schemas from Contentful
- Uses `@Cacheable("contentful-programs")` for performance
- Cache automatically evicted on program updates/deletes

**ContentfulManagementService** (`service/ContentfulManagementService.java`)
- Creates, updates, and deletes programs in Contentful
- Publishes form schemas
- Uses `@CacheEvict` to invalidate cache on modifications

**PdfProcessingService** (`service/PdfProcessingService.java`)
- Converts PDF pages to PNG images
- Encodes images as base64 for AI APIs
- Handles multi-page PDFs

### Frontend Services

**IdpService** (`services/idp.service.ts`)
- `analyzePdf(file, provider)` - Send PDF to backend for analysis
- `captureScreenshot(url)` - Get website screenshot for color extraction
- `fetchLogo(url)` - Auto-fetch logo from website
- `publishToContentful(config)` - Create new program
- `updateProgram(id, data)` - Update existing program

**AuthService** (`services/auth.service.ts`)
- `login(username, password)` - Authenticate user
- `logout()` - End session
- `checkAuthStatus()` - Verify session validity

**ProgramService** (`services/program.service.ts`)
- `getAllPrograms()` - Fetch all active programs
- `getProgramById(id)` - Get specific program
- `deleteProgram(id)` - Delete program (triggers cache eviction)

## Important API Endpoints

### Authentication
- `POST /api/auth/login` - Login with username/password
- `POST /api/auth/logout` - End session
- `GET /api/auth/status` - Check auth status

### PDF Analysis
- `POST /api/idp/analyze-pdf` - Analyze PDF with AI
  - Form params: `file` (MultipartFile), `provider` (string: "google"|"claude")
  - Returns: JSON schema + form ID

### Programs
- `GET /api/programs` - List all active programs
- `GET /api/programs/{id}` - Get program by ID
- `DELETE /api/programs/{id}` - Delete program

### Contentful Publishing
- `POST /api/idp/publish-to-contentful` - Create new program
- `PUT /api/idp/update-program/{id}` - Update program (config only)
- `PUT /api/idp/update-program-with-schema/{id}` - Update program + schema

### Color Analysis
- `POST /api/idp/analyze-colors` - Extract colors from website
- `POST /api/idp/analyze-pdf-colors` - Extract colors from PDF

## Common Tasks

### Testing PDF Analysis
1. Login at http://localhost:4201/login (demo/demo123)
2. Navigate to Form Builder
3. Upload a PDF enrollment form
4. Click "Analyze with Google" or "Analyze with Claude"
5. Review generated schema in Step 2
6. Configure branding in Step 3
7. Publish to Contentful in Step 4

### Debugging Backend
```bash
# Tail backend logs (if started via Claude Code)
tail -f /private/tmp/claude-501/.../tasks/[task_id].output

# Check for errors
grep -i error backend_logs.txt

# Restart backend
pkill -f spring-boot:run
cd backend && ./start.sh
```

### Git Workflow
```bash
# Check status
git status

# Stage and commit
git add <files>
git commit -m "Description

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

# Push to trigger Railway deployment
git push origin main
```

## Deployment (Railway)

- **Repository:** https://github.com/ramseychad1/ai-digital-enrollment-poc
- **Platform:** Railway
- **Build Trigger:** Push to `main` branch
- **Required Environment Variables:**
  - All variables from `start.sh` must be set in Railway dashboard
  - `GOOGLE_AI_API_KEY` must be added for Gemini support

### Railway Configuration
- Backend: Detects Spring Boot, builds with Maven
- Frontend: Detects Angular, builds with npm
- Both services auto-restart on deployment

## Known Issues & Solutions

### Issue: Program card not disappearing after delete
**Solution:** Added `@CacheEvict` annotations to clear cache on delete/update operations.

### Issue: Session expired but no redirect to login
**Solution:**
- Auth interceptor catches 401 responses and redirects to login
- Proactive session checking every 5 minutes in program-selector component
- Session expired message shown on login page

### Issue: Base64 data URLs in logo field cause Contentful error
**Solution:**
- Frontend validation blocks data URLs (max 255 chars)
- Backend validation returns 400 Bad Request for data URLs
- Help text guides users to use HTTP/HTTPS URLs

### Issue: Long-running tabs show stale data
**Solution:**
- Added session checking interval in program-selector component
- Auth interceptor handles 401/403 responses globally
- SessionStorage used to pass messages between pages

## AI Integration Details

### Prompt Structure
Both Claude and Google use identical prompts for consistency:
- Analyze PDF enrollment forms
- Extract PATIENT fields only (skip provider sections)
- Generate JSON schema matching specific format
- Preserve visual layout (side-by-side fields, groupings)
- Include field types, validation, and required fields

### API Differences
- **Claude:** API key in header `x-api-key`, endpoint: `anthropic.com/v1/messages`
- **Google:** API key in header `X-goog-api-key`, endpoint: `generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`

### Response Parsing
Both services return JSON with markdown code fences that need stripping:
```java
stripMarkdownCodeFence(content)  // Removes ```json and ```
validateAndFixJson(json)          // Fixes common issues
```

## Security Notes

- **CORS:** Configured for `http://localhost:4201` in development
- **Session:** 30-minute timeout, HTTP-only cookies
- **Auth:** Basic in-memory authentication (demo/demo123)
- **API Keys:** Never commit to git, stored in environment variables
- **Validation:** Dual-layer (frontend + backend) for defense in depth

## File Conventions

- **Components:** Standalone Angular components with separate .ts, .html, .scss
- **Services:** Injectable services with `@Injectable({ providedIn: 'root' })`
- **DTOs:** Separate from entities, used for API responses
- **Configs:** Centralized in `application.yml` with `${ENV_VAR}` syntax

## Useful Commands

```bash
# Kill all servers
pkill -f "ng serve" && pkill -f "spring-boot:run"

# Check what's running on port
lsof -ti:8080
lsof -ti:4201

# View backend logs
tail -f backend/logs/spring-boot-logger.log

# Clear Maven cache
cd backend && mvn clean install

# Rebuild frontend
cd frontend && rm -rf node_modules && npm install
```

## Testing Credentials

- **Username:** demo
- **Password:** demo123
- **Session Duration:** 30 minutes

## Support & Resources

- **Claude API Docs:** https://docs.anthropic.com/
- **Google AI Docs:** https://ai.google.dev/gemini-api/docs
- **Contentful Docs:** https://www.contentful.com/developers/docs/
- **Angular Docs:** https://angular.dev/
- **Spring Boot Docs:** https://docs.spring.io/spring-boot/

---

*Last Updated: February 8, 2026*
*This file is used by Claude Code to maintain context across sessions.*
