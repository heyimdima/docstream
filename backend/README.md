1. Install Poetry

2. Create a virtual environment
```bash
poetry env use python3.11
```

3. Activate the virtual environment
```
eval $(poetry env activate)
```

4. Install dependencies
```
poetry install
```

5. Run the backend server (inside the backend directory)
```
poetry run uvicorn src.backend.main:app --reload
```
