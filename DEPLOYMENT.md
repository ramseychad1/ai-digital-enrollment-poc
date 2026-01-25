# Railway Deployment Guide

This guide provides step-by-step instructions for deploying the CMR Services AI Digital Enrollment application to Railway.

## Overview

The application consists of two services:
- **Backend**: Spring Boot REST API (Java 17 + Maven)
- **Frontend**: Angular 17 application

Both services are configured to deploy as separate Railway services using the monorepo structure.

---

## Prerequisites

- Railway account (sign up at [railway.app](https://railway.app))
- GitHub repository with this codebase
- Contentful account with configured space
- Supabase PostgreSQL database
- Claude API key (Anthropic)
- (Optional) Logo.dev API key
- (Optional) ScreenshotOne API key

---

## Step 1: Create Railway Project

1. Log in to [Railway](https://railway.app)
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Authorize Railway to access your GitHub account
5. Select this repository
6. Railway will automatically detect the monorepo structure via `railway.toml`

---

## Step 2: Deploy Backend Service

### 2.1 Configure Backend Service

Railway should automatically create a service for the backend based on `railway.toml`.

1. Go to your Railway project
2. Select the **backend** service
3. Go to **Settings** tab
4. Under **Source**, verify the **Root Directory** is set to `backend`

### 2.2 Set Backend Environment Variables

Go to the **Variables** tab and add the following environment variables:

#### Required Database Variables
```
SUPABASE_DB_PASSWORD=your-supabase-password
DB_URL=jdbc:postgresql://your-supabase-host:6543/postgres
DB_USERNAME=postgres.your-project-id
```

#### Required Contentful Variables
```
CONTENTFUL_SPACE_ID=your-contentful-space-id
CONTENTFUL_ACCESS_TOKEN=your-contentful-delivery-token
CONTENTFUL_MANAGEMENT_TOKEN=your-contentful-management-token
```

#### Required AI/API Variables
```
CLAUDE_API_KEY=sk-ant-your-claude-api-key
```

#### Optional API Variables
```
LOGO_DEV_API_KEY=your-logo-dev-api-key
SCREENSHOTONE_API_KEY=your-screenshotone-api-key
```

#### CORS Configuration (Important!)
```
CORS_ALLOWED_ORIGINS=https://your-frontend-name.up.railway.app
```

**Note**: You'll need to update `CORS_ALLOWED_ORIGINS` after the frontend is deployed (Step 3).

### 2.3 Deploy Backend

1. Railway will automatically deploy after setting environment variables
2. Wait for deployment to complete (check **Deployments** tab)
3. Once deployed, note the **public domain** (e.g., `https://backend-production-xxxx.up.railway.app`)
4. Test the health endpoint: `https://your-backend-domain/api/health`

---

## Step 3: Deploy Frontend Service

### 3.1 Configure Frontend Service

1. Go to your Railway project
2. Select the **frontend** service
3. Go to **Settings** tab
4. Under **Source**, verify the **Root Directory** is set to `frontend`

### 3.2 Update Frontend Environment Configuration

Before deploying the frontend, you need to update the environment configuration with your Railway backend URL.

**Edit**: `frontend/src/environments/environment.prod.ts`

Replace:
```typescript
return 'https://your-backend-name.up.railway.app/api';
```

With your actual Railway backend URL from Step 2.3.

**Commit and push this change to GitHub.**

### 3.3 Set Frontend Environment Variables (Optional)

If you want to use runtime configuration instead of build-time:

Go to the **Variables** tab and add:
```
API_URL=https://your-backend-domain.up.railway.app/api
```

Then update `frontend/src/index.html` to inject this at runtime:
```html
<script>
  window.__API_URL__ = '${API_URL}';
</script>
```

### 3.4 Deploy Frontend

1. Railway will automatically deploy after configuration
2. Wait for deployment to complete
3. Once deployed, note the **public domain** (e.g., `https://frontend-production-xxxx.up.railway.app`)
4. Open the URL in your browser to verify the application loads

---

## Step 4: Update CORS Configuration

Now that both services are deployed, update the backend CORS configuration:

1. Go to the **backend** service in Railway
2. Go to **Variables** tab
3. Update the `CORS_ALLOWED_ORIGINS` variable with your frontend URL:
   ```
   CORS_ALLOWED_ORIGINS=https://your-frontend-name.up.railway.app
   ```
4. Railway will automatically redeploy the backend
5. Wait for redeployment to complete

---

## Step 5: Configure Custom Domains (Optional)

### Backend Custom Domain
1. Go to backend service → **Settings** → **Domains**
2. Click **Generate Domain** or **Custom Domain**
3. Follow Railway's instructions to set up DNS

### Frontend Custom Domain
1. Go to frontend service → **Settings** → **Domains**
2. Click **Generate Domain** or **Custom Domain**
3. Follow Railway's instructions to set up DNS
4. **Important**: After setting custom domain, update backend `CORS_ALLOWED_ORIGINS` again

---

## Step 6: Verify Deployment

### Backend Health Check
Test these endpoints:
```bash
# Basic health
curl https://your-backend-domain/api/health

# Database health
curl https://your-backend-domain/api/health/database

# Contentful health
curl https://your-backend-domain/api/health/contentful

# Full health check
curl https://your-backend-domain/api/health/full
```

### Frontend Access
1. Open your frontend URL in a browser
2. Verify the page loads with "AI Digital Enrollment" title
3. Test program selector functionality
4. Test form builder admin tools at `/admin/form-builder`

### End-to-End Test
1. Create a test program via Form Builder
2. Submit a test enrollment form
3. Verify submission is saved in Supabase
4. Check backend logs in Railway for any errors

---

## Environment Variables Reference

### Backend Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DB_URL` | PostgreSQL JDBC connection URL | `jdbc:postgresql://aws-0-us-west-2.pooler.supabase.com:6543/postgres` |
| `DB_USERNAME` | Database username | `postgres.cjpgpzrmnljcwnfjfvfu` |
| `SUPABASE_DB_PASSWORD` | Database password | `your-secure-password` |
| `CONTENTFUL_SPACE_ID` | Contentful space identifier | `abc123def456` |
| `CONTENTFUL_ACCESS_TOKEN` | Contentful delivery API token | `your-delivery-token` |
| `CONTENTFUL_MANAGEMENT_TOKEN` | Contentful management API token | `CFPAT-xxx` |
| `CLAUDE_API_KEY` | Anthropic Claude API key | `sk-ant-api03-xxx` |
| `CORS_ALLOWED_ORIGINS` | Allowed frontend origins (comma-separated) | `https://frontend.up.railway.app` |

### Backend Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `LOGO_DEV_API_KEY` | Logo.dev API key for logo fetching | None |
| `SCREENSHOTONE_API_KEY` | ScreenshotOne API key for screenshots | None |

### Frontend Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `API_URL` | Backend API URL (runtime config) | Optional |

---

## Troubleshooting

### Backend Won't Start
- Check **Logs** tab in Railway backend service
- Verify all required environment variables are set
- Check database connectivity (test with health endpoint)
- Verify Contentful credentials are correct

### Frontend Can't Connect to Backend
- Verify `environment.prod.ts` has correct backend URL
- Check browser console for CORS errors
- Verify backend `CORS_ALLOWED_ORIGINS` includes frontend URL
- Check backend logs for rejected requests

### CORS Errors
- Ensure backend `CORS_ALLOWED_ORIGINS` includes your frontend URL
- Include both custom domain and Railway domain if using both
- Format: `https://custom-domain.com,https://frontend.up.railway.app`

### Database Connection Errors
- Verify Supabase credentials are correct
- Check if Supabase project is active
- Use the **pooler** connection (port 6543) not direct connection
- Verify connection string format in `DB_URL`

### Contentful Errors
- Verify space ID is correct
- Check both delivery and management tokens are valid
- Ensure Contentful space has required content types:
  - `enrollmentProgram`
  - `formConfiguration`

### Build Failures
- Check **Build Logs** in Railway
- Verify `railway.json` configuration is correct
- For backend: Ensure Java 17 is being used
- For frontend: Ensure Node.js 18+ is being used

---

## Post-Deployment Configuration

### Database Schema
The application uses `ddl-auto: create` by default, which recreates tables on startup. For production:

1. Update `backend/src/main/resources/application.yml`
2. Change `spring.jpa.hibernate.ddl-auto: create` to `validate`
3. Implement proper database migrations (Flyway or Liquibase)

### Monitoring
- Use Railway's built-in **Metrics** tab to monitor CPU/memory usage
- Set up **Alerts** in Railway for service downtime
- Monitor **Logs** regularly for errors

### Scaling
- Railway auto-scales based on your plan
- For higher traffic, consider upgrading Railway plan
- Monitor database connection pool usage

---

## Updating the Application

### Backend Updates
1. Push changes to GitHub
2. Railway automatically detects changes and redeploys
3. Monitor deployment in Railway dashboard

### Frontend Updates
1. Update code and push to GitHub
2. Railway automatically builds and deploys
3. Clear browser cache to see changes

### Environment Variable Changes
1. Update variables in Railway dashboard
2. Service automatically redeploys with new variables

---

## Security Considerations

- Never commit API keys or credentials to GitHub
- Use Railway's **Secret Variables** for sensitive data
- Rotate credentials regularly
- Review CORS configuration for production
- Enable HTTPS for custom domains
- Set `spring.jpa.hibernate.ddl-auto: validate` in production
- Implement rate limiting for public endpoints

---

## Cost Optimization

- Railway offers free tier with limitations
- Monitor usage in Railway dashboard
- Consider reserved instances for production
- Optimize database queries to reduce load
- Implement caching for Contentful responses
- Use CDN for frontend static assets

---

## Support

For Railway-specific issues:
- [Railway Documentation](https://docs.railway.app)
- [Railway Discord Community](https://discord.gg/railway)
- [Railway Support](https://railway.app/support)

For application issues:
- Check application logs in Railway
- Review backend health endpoints
- Contact the development team

---

## Quick Deployment Checklist

- [ ] Railway project created
- [ ] Backend service configured with correct root directory
- [ ] All backend environment variables set
- [ ] Backend deployed successfully
- [ ] Backend health endpoint responding
- [ ] Frontend environment.prod.ts updated with backend URL
- [ ] Frontend service configured
- [ ] Frontend deployed successfully
- [ ] Backend CORS updated with frontend URL
- [ ] End-to-end test completed
- [ ] Custom domains configured (if applicable)
- [ ] Monitoring and alerts set up

---

**Deployment Date**: _[Record deployment date here]_
**Backend URL**: _[Record backend URL here]_
**Frontend URL**: _[Record frontend URL here]_
