# Frontend Deployment Setup

## Environment Variables

### Local Development
1. Copy `.env.example` to `.env`:
    ```bash
    cp .env.example .env
    ```
2. Edit `.env` with your local values:
    ```env
    VITE_API_BASE_URL=http://localhost:3000/api
    ```

**Important:** Vite requires the `VITE_` prefix for all environment variables that should be available in client code!

### Production / Docker Deployment

#### Option 1: Build-time Environment Variables
Since Vite embeds variables into the code at build time, they must be passed during **build**:

```bash
docker build \
  --build-arg VITE_API_BASE_URL=https://api.your-domain.com/api \
  -t ghcr.io/username/frontend:latest \
  ./apps/frontend
```

Then:
```bash
docker run -d -p 80:80 ghcr.io/username/frontend:latest
```

#### Option 2: Nginx Runtime Configuration
For dynamic API URLs at runtime, you can use an entrypoint script:

Create `docker-entrypoint.sh`:
```bash
#!/bin/sh
# Replace environment variables in built files
envsubst '${VITE_API_BASE_URL}' < /usr/share/nginx/html/index.html > /tmp/index.html
mv /tmp/index.html /usr/share/nginx/html/index.html

# Start nginx
nginx -g 'daemon off;'
```

Then in the Dockerfile:
```dockerfile
COPY docker-entrypoint.sh /
RUN chmod +x /docker-entrypoint.sh
ENTRYPOINT ["/docker-entrypoint.sh"]
```

#### Option 3: Docker Compose
```yaml
version: '3.8'
services:
  frontend:
     image: ghcr.io/username/frontend:latest
     ports:
        - "80:80"
     environment:
        - VITE_API_BASE_URL=${VITE_API_BASE_URL}
     # Or with env_file:
     # env_file:
     #   - .env
```

#### Option 4: Kubernetes ConfigMap
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: frontend-config
data:
  VITE_API_BASE_URL: "https://api.your-domain.com/api"
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
spec:
  template:
     spec:
        containers:
        - name: frontend
          image: ghcr.io/username/frontend:latest
          ports:
          - containerPort: 80
          env:
          - name: VITE_API_BASE_URL
             valueFrom:
                configMapKeyRef:
                  name: frontend-config
                  key: VITE_API_BASE_URL
```

## API Endpoint Configuration in Code

To use the environment variable, reference it in `api.ts`:

```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
```

## Push Image to GHCR

The image is automatically pushed to GHCR when:
- Code in `apps/frontend/` is changed
- Push to `main` branch occurs
- Or manually via "Actions" → "Build and Push Frontend Image" → "Run workflow"

**Workflow:** `.github/workflows/deploy-frontend.yml` (in repository root)

Image URL: `ghcr.io/YOUR_USERNAME/YOUR_REPO/frontend:latest`

## Test Production Build Locally

```bash
# Build
npm run build

# Preview with Vite
npm run preview

# Or with Docker
docker build -t frontend-test .
docker run -p 80:80 frontend-test
```

## Nginx Features

The production image uses Nginx with:
- ✅ Gzip Compression
- ✅ Security Headers (X-Frame-Options, etc.)
- ✅ SPA Routing Support (Client-side routing)
- ✅ Static Asset Caching (1 year for JS/CSS/Images)
- ✅ No-cache for index.html

## Make Public

After push, the image is private by default. To make it public:
1. Go to: `https://github.com/users/YOUR_USERNAME/packages/container/YOUR_REPO%2Ffrontend/settings`
2. Scroll to "Danger Zone"
3. Click "Change visibility" → "Public"

## Multi-Stage Build

The Dockerfile uses multi-stage build:
1. **Builder Stage**: Node.js to build the app
2. **Production Stage**: Lightweight Nginx Alpine image (~25 MB instead of ~1 GB)

This significantly reduces the final image size!

