# FastAPI Backend

This is a FastAPI-based backend service built with Poetry for dependency management.

## Getting Started

Follow these steps to set up and run the backend server locally in the correct order:


### 1. Activate the virtual environment

```bash
# Activate the Poetry environment
eval $(poetry env activate)
```

### 2. Install dependencies

```bash
poetry install
```

This will install all required dependencies in the activated virtual environment.

### 3. Run the server

```bash
# Run the server using Poetry
poetry run uvicorn src.backend.main:app --reload
```

The server will start at http://127.0.0.1:8000/ with auto-reload enabled.

### 5. Access API documentation

- Swagger UI: http://127.0.0.1:8000/docs
- ReDoc: http://127.0.0.1:8000/redoc

