1. Create a virtual environment (this project uses Python 3.11 exclusively)
```bash
poetry env use python3.11
```

2. Activate the virtual environment
```bash
eval $(poetry env activate)
```

3. Install dependencies
```bash
poetry install
```

4. Run the backend server
```bash
poetry run uvicorn src.backend.main:app --reload
```
