# Frontend Deployment Setup

## Environment Variables

### Local Development
1. Kopiere `.env.example` zu `.env`:
   ```bash
   cp .env.example .env
   ```
2. Bearbeite `.env` mit deinen lokalen Werten:
   ```env
   VITE_API_BASE_URL=http://localhost:3000/api
   ```

**Wichtig:** Vite benötigt das Präfix `VITE_` für alle Environment-Variablen, die im Client-Code verfügbar sein sollen!

### Production / Docker Deployment

#### Option 1: Build-time Environment Variables
Da Vite zur Build-Zeit die Variablen in den Code einbettet, müssen sie beim **Build** übergeben werden:

```bash
docker build \
  --build-arg VITE_API_BASE_URL=https://api.your-domain.com/api \
  -t ghcr.io/username/frontend:latest \
  ./apps/frontend
```

Dann:
```bash
docker run -d -p 80:80 ghcr.io/username/frontend:latest
```

#### Option 2: Nginx Runtime Configuration
Für dynamische API-URLs zur Runtime kannst du ein Entrypoint-Script verwenden:

Erstelle `docker-entrypoint.sh`:
```bash
#!/bin/sh
# Replace environment variables in built files
envsubst '${VITE_API_BASE_URL}' < /usr/share/nginx/html/index.html > /tmp/index.html
mv /tmp/index.html /usr/share/nginx/html/index.html

# Start nginx
nginx -g 'daemon off;'
```

Dann im Dockerfile:
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
    # Oder mit env_file:
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

## API Endpoint Konfiguration im Code

Um die Environment-Variable zu nutzen, verwende sie in `api.ts`:

```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
```

## Image auf GHCR pushen

Das Image wird automatisch auf GHCR gepusht wenn:
- Code in `apps/frontend/` geändert wird
- Push auf `main` Branch erfolgt
- Oder manuell über "Actions" → "Build and Push Frontend Image" → "Run workflow"

Image URL: `ghcr.io/YOUR_USERNAME/YOUR_REPO/frontend:latest`

## Production Build lokal testen

```bash
# Build
npm run build

# Preview mit Vite
npm run preview

# Oder mit Docker
docker build -t frontend-test .
docker run -p 80:80 frontend-test
```

## Nginx Features

Das Production-Image nutzt Nginx mit:
- ✅ Gzip Compression
- ✅ Security Headers (X-Frame-Options, etc.)
- ✅ SPA Routing Support (Client-side routing)
- ✅ Static Asset Caching (1 Jahr für JS/CSS/Images)
- ✅ No-cache für index.html

## Verfügbar machen

Nach dem Push ist das Image standardmäßig privat. Um es öffentlich zu machen:
1. Gehe zu: `https://github.com/users/YOUR_USERNAME/packages/container/YOUR_REPO%2Ffrontend/settings`
2. Scrolle zu "Danger Zone"
3. Klicke "Change visibility" → "Public"

## Multi-Stage Build

Das Dockerfile nutzt Multi-Stage Build:
1. **Builder Stage**: Node.js zum Bauen der App
2. **Production Stage**: Leichtes Nginx Alpine Image (~25 MB statt ~1 GB)

Dies reduziert die finale Image-Größe erheblich!
