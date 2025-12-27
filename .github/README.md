# Monorepo GitHub Actions Setup

Dieses Monorepo enthält Frontend und Backend in separaten Ordnern. Die GitHub Actions Workflows befinden sich im Root-Verzeichnis `.github/workflows/`:

## Workflows

### Backend Deployment
- **Datei:** `.github/workflows/deploy-backend.yml`
- **Trigger:** 
  - Push auf `main` Branch + Änderungen in `apps/backend/**`
  - Manuell über Actions Tab
- **Image:** `ghcr.io/YOUR_USERNAME/YOUR_REPO/backend:latest`

### Frontend Deployment
- **Datei:** `.github/workflows/deploy-frontend.yml`
- **Trigger:** 
  - Push auf `main` Branch + Änderungen in `apps/frontend/**`
  - Manuell über Actions Tab
- **Image:** `ghcr.io/YOUR_USERNAME/YOUR_REPO/frontend:latest`

## Warum im Root?

GitHub Actions erkennt **nur** Workflows im Root `.github/workflows/` Verzeichnis. Workflows in Unterordnern (z.B. `apps/backend/.github/`) werden ignoriert.

## Monorepo-spezifische Features

Beide Workflows nutzen `paths` Filter, um nur bei relevanten Änderungen zu triggern:

```yaml
on:
  push:
    paths:
      - 'apps/backend/**'  # Nur bei Backend-Änderungen
```

Das bedeutet:
- ✅ Änderung in `apps/backend/server.js` → Backend-Workflow läuft
- ✅ Änderung in `apps/frontend/src/App.tsx` → Frontend-Workflow läuft
- ❌ Änderung in `README.md` → Keine Workflows laufen
- ✅ Manueller Trigger über Actions Tab → Funktioniert immer

## Weitere Dokumentation

- Backend: `apps/backend/DEPLOYMENT.md`
- Frontend: `apps/frontend/DEPLOYMENT.md`
