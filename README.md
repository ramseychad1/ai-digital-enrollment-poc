# CMR Services AI Digital Enrollment

A full-stack multi-tenant patient enrollment platform with Spring Boot backend and Angular frontend.

## Project Structure

```
e2e-enrollment-poc/
├── backend/          # Spring Boot REST API
├── frontend/         # Angular application
└── README.md         # This file
```

## Prerequisites

- **Java 17** or higher
- **Maven 3.6+**
- **Node.js 18+** and npm
- **PostgreSQL** (via Supabase)
- **Contentful** account with space configured

## Quick Start

### 1. Setup Environment Variables

```bash
# Copy the example file
cp start.sh.example start.sh

# Edit start.sh with your actual credentials:
# - Database credentials (Supabase PostgreSQL)
# - Contentful CMS credentials
# - Claude API key (for IDP Form Builder)

# Make executable
chmod +x start.sh
```

### 2. Start the Application

You can use the provided start.sh script or run each service manually in separate terminals.

**Option A: Using start.sh (runs both in background)**
```bash
./start.sh
```

**Option B: Manual (recommended for development)**

Terminal 1 (Backend):
```bash
cd backend
source ../start.sh  # Load environment variables
./mvnw spring-boot:run
```

Terminal 2 (Frontend):
```bash
cd frontend
npm install  # First time only
npm start
```

Backend will start on `http://localhost:8080` (or `http://0.0.0.0:8080` for network access)

Frontend will start on `http://localhost:4201` (or `http://0.0.0.0:4201` for network access)

See [backend/README.md](backend/README.md) and [frontend/README.md](frontend/README.md) for detailed documentation.

## Network Access

Both applications are configured to be accessible from other devices on your local network:

- **Frontend**: `http://192.168.86.231:4201`
- **Backend**: `http://192.168.86.231:8080/api`

The frontend automatically detects the hostname and connects to the backend accordingly.

## Technology Stack

### Backend
- Spring Boot 3.2.1
- Java 17
- PostgreSQL (Supabase)
- Contentful CMS
- Claude AI API (Sonnet 4)
- Apache PDFBox 3.0.0
- WebFlux (Reactive HTTP)
- Maven

### Frontend
- Angular 17
- TypeScript
- SCSS
- Standalone Components

## Features

### AI Digital Enrollment
- Multi-tenant program management via Contentful
- Dynamic branding (colors, logos, footer text) per program
- Dynamic form generation from JSON schemas
- Patient enrollment form submissions
- RESTful API with comprehensive error handling
- Responsive UI design
- Network-accessible for testing on multiple devices

### Admin Tools
- **IDP Form Builder**: AI-powered PDF-to-JSON Schema converter
  - Upload PDF enrollment forms
  - Automatic schema generation using Claude AI
  - Side-by-side PDF preview and JSON editor
  - Download and copy-to-clipboard functionality
  - Accessible at `/admin/form-builder`

## Environment Configuration

### Backend Environment Variables

Required environment variables (configure in `start.sh`):

- **Database (Supabase PostgreSQL)**
  - `DB_URL` - JDBC connection URL
  - `DB_USERNAME` - Database username
  - `DB_PASSWORD` - Database password

- **Contentful CMS**
  - `CONTENTFUL_SPACE_ID` - Contentful space identifier
  - `CONTENTFUL_ACCESS_TOKEN` - Contentful API token

- **Claude AI (for IDP Form Builder)**
  - `CLAUDE_API_KEY` - Claude API key (format: `sk-ant-...`)

See `start.sh.example` for setup template.

## API Documentation

The backend provides the following endpoints:

### AI Digital Enrollment
- `GET /api/programs` - List all enrollment programs
- `GET /api/programs/{id}` - Get specific program
- `GET /api/forms/{formId}` - Get form schema
- `POST /api/submissions` - Submit enrollment form
- `GET /api/health/*` - Health check endpoints

### Admin Tools
- `POST /idp/analyze-pdf` - Analyze PDF and generate JSON Schema (multipart/form-data)
  - Request: PDF file upload
  - Response: Generated JSON Schema with form ID and analysis notes

Full API documentation available in [backend/README.md](backend/README.md).

## Development

### CORS Configuration

The backend is configured to accept requests from:
- `http://localhost:4201`
- `http://192.168.86.231:4201`

## Security Notes

- Never commit `start.sh` (contains secrets) - already in .gitignore
- Use `start.sh.example` as a template
- Keep CLAUDE_API_KEY secure and never expose in client-side code
- Rotate credentials regularly
- Review CORS settings before production deployment

## Contributing

1. Create a feature branch
2. Make your changes
3. Test both frontend and backend
4. Submit a pull request

## License

Proprietary - CMR Services

## Support

For questions or issues, please contact the development team.
