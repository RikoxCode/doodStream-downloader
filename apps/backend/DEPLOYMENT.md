# Backend Deployment Setup

## Environment Variables

### Local Development
1. Copy `.env.example` to `.env`:
    ```bash
    cp .env.example .env
    ```
2. Edit `.env` with your local values

### Production / Docker Deployment

For production you should **not commit a .env file**. Instead:

#### Option 1: Docker Environment Variables
Pass the variables directly when starting the container:
```bash
docker run -d \
  -e PORT=3000 \
  -e DOODOZER_IMAGE=ghcr.io/username/doodozer:latest \
  -e DOWNLOADS_PATH=/downloads \
  -e DOCKER_SOCKET=/var/run/docker.sock \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v $(pwd)/downloads:/downloads \
  -p 3000:3000 \
  ghcr.io/username/backend:latest
```

#### Option 2: Docker Compose with .env
Create a `.env` file locally (don't commit!) and use docker-compose:
```yaml
version: '3.8'
services:
  backend:
     image: ghcr.io/username/backend:latest
     env_file:
        - .env
     volumes:
        - /var/run/docker.sock:/var/run/docker.sock
        - ./downloads:/downloads
     ports:
        - "3000:3000"
```

#### Option 3: Kubernetes Secrets
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: backend-secrets
stringData:
  PORT: "3000"
  DOODOZER_IMAGE: "ghcr.io/username/doodozer:latest"
  DOWNLOADS_PATH: "/downloads"
  DOCKER_SOCKET: "/var/run/docker.sock"
```

#### Option 4: GitHub Secrets (for CI/CD)
The variables are already defined in the Dockerfile as ENV variables with default values. For custom values:

1. Go to Repository Settings → Secrets and variables → Actions
2. Add the following secrets:
    - `DOODOZER_IMAGE`
    - Others as needed

3. Use them in the workflow:
```yaml
- name: Build and push
  env:
     DOODOZER_IMAGE: ${{ secrets.DOODOZER_IMAGE }}
```

## Pushing Image to GHCR

The image is automatically pushed to GHCR when:
- Code in `apps/backend/` is changed
- Push to `main` branch occurs
- Or manually via "Actions" → "Build and Push Backend Image" → "Run workflow"

Image URL: `ghcr.io/YOUR_USERNAME/YOUR_REPO/backend:latest`

## Making it Available

After pushing, the image is private by default. To make it public:
1. Go to: `https://github.com/users/YOUR_USERNAME/packages/container/YOUR_REPO%2Fbackend/settings`
2. Scroll to "Danger Zone"
3. Click "Change visibility" → "Public"

