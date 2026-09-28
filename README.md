# Marksafe — Evaluation layer

This repository contains the codebase for Marksafe, an AI safety and quality layer for On-Screen Marking (OSM).

## Project Structure
- `marksafe-plan.md`: The complete production implementation plan.
- `marksafe-frontend/`: Next.js 15 app built with Tailwind CSS, TypeScript, and Radix primitives.
- `marksafe-backend/`: Python 3.12, FastAPI, and SQLAlchemy 2 backend architecture.

## Getting Started

### Frontend
1. Navigate to `marksafe-frontend`.
2. Run `npm install` to install all dependencies (Radix UI, Framer Motion, Tanstack Query, Dexie, etc.).
3. Run `npm run dev` to start the frontend.
4. Visit `http://localhost:3000` to view the BDEA Landing Page.

**Available Routes (Demo):**
- `/` - Landing Page
- `/dashboard` - Examiner Control Center
- `/evaluation` - 3-Pane Examiner Workspace
- `/intake` - Scan QC & Intake Dashboard
- `/moderation` - Smart Moderation Queue
- `/rubric-builder` - Authoring UI for JSON rubrics
- `/audit` - Cryptographic Timeline/History Viewer

### Backend
### Backend
*Note: Python 3.12+ is required. Ensure `python` or `python3` is available in your PATH.*

1. Navigate to `marksafe-backend`.
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # Windows:
   .\venv\Scripts\activate
   # Mac/Linux:
   source venv/bin/activate
   ```
3. Install dependencies: `pip install -r requirements.txt`
4. Ensure a PostgreSQL database is running (defaults to `postgres` user/pass on localhost DB `marksafe`).
5. Run Database Migrations:
   ```bash
   alembic revision --autogenerate -m "Initial schema"
   alembic upgrade head
   ```
6. Seed Database (Optional):
   ```bash
   python seed.py
   ```
7. Start the FastAPI server: 
   ```bash
   uvicorn src.main:app --reload --port 8000
   ```
8. Visit `http://localhost:8000/api/v1/docs` for the interactive API documentation.

## Architecture Highlights
- **PostgreSQL Source of Truth**: Append-only mark events with hash chaining.
- **Transactional Outbox**: Guaranteed message delivery and offline sync support.
- **Evidence-First UI**: "Institutional" design language without generic AI stylings.
