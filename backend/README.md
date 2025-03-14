## Local Development
1. Create a virtual environment (this project uses Python 3.11 exclusively)
```bash
poetry env use python3.11
```

2. Activate the virtual environment
```bash
eval $(poetry env activate)
```

3. Install all dependencies (includes --group dev dependencies)
```bash
poetry install
```

4. Run Crawl4AI Setup
```bash
crawl4ai-setup
```

5. Run Crawl4AI Doctor (Optional)
```bash
crawl4ai-doctor
```

6. Run the backend server
```bash
poetry run uvicorn src.backend.main:app --reload
```


## Production Deployment (needs to be adjusted later)
1. Install (for production deployment)
```bash
poetry install --without dev
```

2. Run Crawl4AI Setup
```bash
crawl4ai-setup
```

3. Run Crawl4AI Doctor
```bash
crawl4ai-doctor
```

4. Run the backend server
```bash
poetry run uvicorn src.backend.main:app --reload
```
