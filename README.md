# LifeOS

LifeOS is a warm, editorial personal operating system for daily tasks, atomic habits, and health & strength architecture.

## Run the frontend

```bash
cd frontend
npm install
npm run dev
```

## Run the API

```bash
cd backend
python -m venv .venv
# On Windows: .venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

The API exposes JWT tokens at `/api/token/`, full consolidated workspace dataset at `/api/bootstrap/`, health & strength modules under `/api/health/`, CRUD resources under `/api/`, and computed analytics at `/api/analytics/`.