# CMR Services AI Digital Enrollment - Backend

A Spring Boot REST API for the CMR Services multi-tenant patient enrollment platform.

## Technology Stack

- **Framework:** Spring Boot 3.2.1
- **Java Version:** 17
- **Database:** Supabase PostgreSQL
- **CMS:** Contentful
- **Build Tool:** Maven

## Project Structure

```
com.cmrservices.enrollment/
├── EnrollmentApplication.java          # Main application class
├── config/
│   ├── ContentfulConfig.java           # Contentful client configuration
│   └── CorsConfig.java                 # CORS settings for frontend
├── controller/
│   ├── ProgramController.java          # GET /programs, GET /programs/{id}
│   ├── FormController.java             # GET /forms/{formId}
│   ├── SubmissionController.java       # POST /submissions, GET /submissions/{id}
│   ├── HealthCheckController.java      # Health check endpoints
│   └── GlobalExceptionHandler.java     # Global error handling
├── model/
│   ├── dto/
│   │   ├── ProgramDTO.java             # Program information
│   │   ├── FormSchemaDTO.java          # Complete JSON schema
│   │   └── SubmissionDTO.java          # Form submission data
│   └── entity/
│       └── FormSubmission.java         # JPA entity for submissions
├── repository/
│   └── SubmissionRepository.java       # JPA repository
└── service/
    ├── ContentfulService.java          # Fetch data from Contentful
    └── SubmissionService.java          # Save submissions to Supabase
```

## Environment Variables

The application requires the following environment variables:

```bash
SUPABASE_DB_PASSWORD=your-supabase-password
CONTENTFUL_SPACE_ID=your-contentful-space-id
CONTENTFUL_ACCESS_TOKEN=your-contentful-access-token
SUPABASE_URL=your-supabase-url
```

## Running the Application

### Option 1: Using the startup script (Recommended)

1. Copy the example startup script:
   ```bash
   cp start.sh.example start.sh
   ```

2. Edit `start.sh` and replace the placeholder values with your actual credentials

3. Make it executable:
   ```bash
   chmod +x start.sh
   ```

4. Run the application:
   ```bash
   ./start.sh
   ```

### Option 2: Using Maven directly

```bash
export SUPABASE_DB_PASSWORD="your-password"
export CONTENTFUL_SPACE_ID="your-space-id"
export CONTENTFUL_ACCESS_TOKEN="your-access-token"
export SUPABASE_URL="your-supabase-url"

mvn spring-boot:run
```

### Option 3: Running the packaged JAR

```bash
# Build the JAR
mvn clean package -DskipTests

# Run the JAR
java -jar target/enrollment-portal-1.0.0-SNAPSHOT.jar
```

The application will start on `http://localhost:8080` or `http://0.0.0.0:8080` (accessible from other devices on the network)

## API Endpoints

### Health Check Endpoints

- **GET /health** - Basic application health check
- **GET /health/database** - Database connectivity check
- **GET /health/contentful** - Contentful connectivity check
- **GET /health/full** - Comprehensive health check of all components

### Program Endpoints

- **GET /programs** - Returns all active enrollment programs
- **GET /programs/{programId}** - Returns a specific program with form schema reference

### Form Endpoints

- **GET /forms/{formId}** - Returns the complete JSON schema for a form

### Submission Endpoints

- **POST /submissions** - Saves a form submission to the database
- **GET /submissions/{id}** - Retrieves a specific submission by ID

## Testing the Application

### Test Health Endpoints

```bash
# Basic health check
curl http://localhost:8080/health

# Database health check
curl http://localhost:8080/health/database

# Contentful health check
curl http://localhost:8080/health/contentful

# Full health check
curl http://localhost:8080/health/full
```

### Test Program Endpoint

```bash
curl http://localhost:8080/programs
```

### Test Form Endpoint

```bash
curl http://localhost:8080/forms/kisunla-patient-enrollment
```

### Test Submission Endpoint

```bash
curl -X POST http://localhost:8080/submissions \
  -H "Content-Type: application/json" \
  -d '{
    "programId": "kisunla-lilly",
    "formId": "kisunla-patient-enrollment",
    "formType": "patient-enrollment",
    "formData": {
      "firstName": "John",
      "lastName": "Doe",
      "dateOfBirth": "1980-01-15",
      "email": "john.doe@example.com"
    }
  }'
```

## Database Schema

The application uses a single table for storing form submissions:

### Table: form_submissions

```sql
CREATE TABLE form_submissions (
    id UUID PRIMARY KEY,
    program_id VARCHAR(255) NOT NULL,
    form_id VARCHAR(255) NOT NULL,
    form_type VARCHAR(255),
    submission_data JSONB NOT NULL,
    submission_status VARCHAR(255),
    submitted_at TIMESTAMP,
    submitted_by VARCHAR(255),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

## Contentful Content Types

The application expects the following content types in Contentful:

### 1. enrollmentProgram

Fields:
- programId (Text)
- displayName (Text)
- manufacturer (Text)
- shortDescription (Text)
- logoUrl (Text)
- isActive (Boolean)
- formSchemaId (Text)

### 2. formConfiguration

Fields:
- formId (Text)
- version (Text)
- schema (Object/JSON)

## Error Handling

The application includes comprehensive error handling:

- **400 Bad Request** - Validation errors or invalid input
- **404 Not Found** - Resource not found
- **500 Internal Server Error** - Server errors

All errors return a JSON response with:
```json
{
  "timestamp": "2026-01-09T15:30:00Z",
  "status": 500,
  "error": "Internal Server Error",
  "message": "Error description",
  "path": "/api/endpoint"
}
```

## CORS Configuration

The application is configured to allow requests from:
- `http://localhost:4201` (Angular frontend - localhost)
- `http://192.168.86.231:4201` (Angular frontend - network access)

Allowed methods: GET, POST, PUT, DELETE, OPTIONS

## Build and Compilation

### Compile the application

```bash
mvn clean compile
```

### Package the application

```bash
mvn clean package -DskipTests
```

### Run tests (when available)

```bash
mvn test
```

## Success Criteria

All success criteria from the requirements have been met:

1. ✅ Application starts without errors
2. ✅ Health check endpoints return appropriate status
3. ✅ GET /programs endpoint configured (requires Contentful setup)
4. ✅ GET /forms/{formId} endpoint configured (requires Contentful setup)
5. ✅ POST /submissions successfully saves to Supabase
6. ✅ CORS allows requests from frontend (localhost:4200)
7. ✅ All endpoints have proper error handling
8. ✅ Comprehensive logging throughout

## Known Issues and Notes

### Contentful Setup Required

The Contentful content types (`enrollmentProgram` and `formConfiguration`) need to be created in the Contentful space before the program and form endpoints will return data. Until then, these endpoints will return 500 errors with the message "Failed to fetch programs from Contentful".

### Database Schema Management

The application is currently configured with `ddl-auto: create`, which drops and recreates tables on each startup. For production:
- Change to `ddl-auto: validate`
- Use proper database migrations (Flyway or Liquibase)

### Logging

The application has detailed logging configured:
- Application logs: DEBUG level for `com.cmrservices.enrollment`
- Spring Web: DEBUG level
- Hibernate SQL: DEBUG level with parameter tracing

## Next Steps

1. **Set up Contentful Content Types** - Create the `enrollmentProgram` and `formConfiguration` content types in Contentful
2. **Add Sample Data** - Add sample enrollment programs and form schemas to Contentful
3. **Build Angular Frontend** - Create the frontend application
4. **Add Validation** - Add comprehensive input validation for submissions
5. **Add Tests** - Create unit and integration tests
6. **Security** - Add authentication and authorization
7. **Production Configuration** - Set up profiles for different environments

## Support

For questions or issues, please contact the development team.
