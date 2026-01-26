Add custom login page authentication to the application.  DO NOT PUSH TO GIT UNTIL WE TEST LOCALLY.  GIT PUSH will trigger a Railway Production build.  

ARCHITECTURE:
Session-based authentication with a branded login page. Single user account for demo. All routes require authentication except login page and health checks.

BACKEND IMPLEMENTATION:

FILE: backend/pom.xml
Add Spring Security dependency if not already present:
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>

FILE: backend/src/main/java/com/cmrservices/enrollment/config/SecurityConfig.java (create new)

Create Spring Security configuration:
- Enable form-based authentication
- Custom authentication endpoints: /api/auth/login and /api/auth/logout
- Session management (stateful sessions)
- Require authentication for all /api/* endpoints except:
  * /api/auth/login
  * /api/auth/logout  
  * /api/health/*
- Configure CORS to allow credentials
- Disable CSRF for API endpoints (or configure properly for session-based auth)
- Use in-memory authentication with credentials from environment variables

FILE: backend/src/main/java/com/cmrservices/enrollment/controller/AuthController.java (create new)

Create authentication endpoints:
POST /api/auth/login
- Accept: { username: string, password: string }
- Validate credentials
- Create session
- Return: { success: boolean, message: string, username: string }

POST /api/auth/logout
- Invalidate session
- Return: { success: boolean }

GET /api/auth/status
- Check if user is authenticated
- Return: { authenticated: boolean, username?: string }

FILE: backend/src/main/resources/application.yml

Add:
security:
  user:
    name: ${AUTH_USERNAME:demo}
    password: ${AUTH_PASSWORD}

server:
  servlet:
    session:
      timeout: 30m
      cookie:
        http-only: true
        secure: true  # for production
        same-site: lax

FRONTEND IMPLEMENTATION:

FILE: frontend/src/app/components/auth/login/login.component.ts (create new)

Create login component:
- Reactive form with username and password fields
- "Remember me" checkbox (optional)
- Submit calls AuthService.login()
- On success: redirect to /admin/form-builder
- On failure: show error message
- Professional styling matching the app theme

FILE: frontend/src/app/components/auth/login/login.component.html (create new)

Create login page HTML:
- Centered card layout
- AI Digital Enrollment branding
- CMR Services logo/name
- Username input field
- Password input field
- Remember me checkbox
- Login button with loading state
- Error message display area
- "Powered by Claude AI" footer

FILE: frontend/src/app/components/auth/login/login.component.scss (create new)

Style the login page:
- Clean, professional design
- Centered on viewport
- Card with shadow
- Brand colors (use existing color scheme)
- Responsive design
- Focus states on inputs

FILE: frontend/src/app/services/auth.service.ts (create new)

Create authentication service:
- login(username, password): Observable<LoginResponse>
- logout(): Observable<void>
- isAuthenticated(): Observable<boolean>
- getAuthStatus(): Observable<AuthStatus>
- Store authentication state
- Handle session management

FILE: frontend/src/app/guards/auth.guard.ts (create new)

Create route guard:
- Implements CanActivate
- Checks authentication status
- Redirects to /login if not authenticated
- Allows access if authenticated

FILE: frontend/src/app/interceptors/auth.interceptor.ts (create new)

Create HTTP interceptor:
- Adds withCredentials: true to all API requests (for session cookies)
- Handles 401 responses → redirect to login
- Handles 403 responses

FILE: frontend/src/app/app.routes.ts (or routing module)

Update routes:
- Add login route (no guard): { path: 'login', component: LoginComponent }
- Add auth guard to all protected routes:
  * /admin/form-builder → canActivate: [AuthGuard]
  * Any other admin routes → canActivate: [AuthGuard]
- Redirect root to /login or /admin/form-builder based on auth status

FILE: frontend/src/app/app.config.ts (or main.ts)

Register:
- AuthGuard provider
- HTTP interceptor for auth
- Ensure HttpClientModule is imported

ENVIRONMENT VARIABLES:

Add to Railway backend:
AUTH_USERNAME=demo
AUTH_PASSWORD=ChooseAStrongPassword123!

REQUIREMENTS:
- Professional branded login page
- Session-based authentication (cookies)
- Sessions expire after 30 minutes of inactivity
- All admin routes protected
- Logout functionality
- Clean error messages
- Responsive design
- Works locally and on Railway

TESTING CHECKLIST:
- Visit site → redirects to /login
- Enter wrong credentials → shows error
- Enter correct credentials → redirects to form builder
- All API calls work when logged in
- Logout button works
- Session expires after 30 min
- Refresh page maintains session
- Direct URL access requires login