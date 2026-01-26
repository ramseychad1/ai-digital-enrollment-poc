# Authentication Setup Instructions

## Local Testing Setup

### 1. Set Environment Variables

You need to set the `AUTH_PASSWORD` environment variable for the backend to start.

**Option A: Export in terminal (temporary)**
```bash
export AUTH_PASSWORD="YourStrongPassword123!"
```

**Option B: Add to backend/start.sh (if you have one)**
```bash
export AUTH_PASSWORD="YourStrongPassword123!"
```

**Option C: Set in your IDE**
- IntelliJ IDEA: Run → Edit Configurations → Environment Variables
- VS Code: Add to launch.json

### 2. Start Backend

```bash
cd backend
mvn spring-boot:run
```

The backend will start on http://localhost:8080/api

### 3. Start Frontend

```bash
cd frontend
npm start
```

The frontend will start on http://localhost:4201

### 4. Test Authentication

1. Navigate to http://localhost:4201
2. You should be able to browse programs without authentication
3. Click "Form Builder" or navigate to http://localhost:4201/admin/form-builder
4. You should be redirected to http://localhost:4201/login
5. Login with:
   - **Username**: `demo` (default, can be changed via AUTH_USERNAME)
   - **Password**: Whatever you set in AUTH_PASSWORD
6. After successful login, you'll be redirected to the Form Builder
7. Session will last 30 minutes
8. Click "Logout" in the header to logout

## Railway Deployment Setup

### Add Environment Variables to Railway Backend:

1. Go to Railway dashboard → Backend service → Variables
2. Add:
   ```
   AUTH_USERNAME=demo
   AUTH_PASSWORD=ChooseAStrongPassword123!
   ```

3. Railway will automatically redeploy

### Update CORS if needed:

The existing `CORS_ALLOWED_ORIGINS` variable should work, but ensure it includes your frontend URL:
```
CORS_ALLOWED_ORIGINS=https://front-end-production-5de9.up.railway.app
```

## Default Credentials

- **Username**: `demo` (configurable via `AUTH_USERNAME`)
- **Password**: Set via `AUTH_PASSWORD` environment variable (required)

## Testing Checklist

- [ ] Visit site → redirects to /login (for admin routes)
- [ ] Programs page is accessible without login
- [ ] Enter wrong credentials → shows error
- [ ] Enter correct credentials → redirects to form builder
- [ ] All API calls work when logged in
- [ ] Logout button works
- [ ] Session expires after 30 min (optional to test)
- [ ] Refresh page maintains session
- [ ] Direct URL access to /admin routes requires login

## Security Notes

- Sessions are stored server-side
- Session cookies are HTTP-only and SameSite=Lax
- CSRF is disabled for API endpoints (session-based auth)
- All admin routes require authentication
- Public endpoints: health checks, login, logout, auth status
- For production on Railway: Set secure cookies (already configured in application.yml)
