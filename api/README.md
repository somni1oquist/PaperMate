# PaperMate API

## Archetecture

```
api/
├── app/
│   ├── __init__.py
│   ├── controllers/
│   │   ├── __init__.py
│   │   └── papers_controller.py
│   ├── models/
│   │   ├── __init__.py
│   │   └── paper.py
│   ├── services/
│   │   ├── __init__.py
│   │   ├── elsevier.py
│   │   └── gemini.py
│   └── utils/
│       └── __init__.py
├── migrations/
│   ├── versions/
│   ├── alembic.ini
│   └── ...
├── config.py
├── requirements.txt
└── tests/
```

## Steps to launch the API app

### 1. Change directory to api folder
```
cd api
```
### 2. Create virtual environment and activate it
```
python -m venv .venv

source .venv/bin/activate (Linux/Mac)
.venv\Scripts\activate (Windows)
```
### 3. Install libraries
```
pip install -r requirements
```
### 4. Set environment variables
- `export` for Linux/Mac
```
export SECRET_KEY=<KEY> 
export LLM_API_KEY=<KEY>
```
- `$env:` for Windows PowerShell
```
$env:SECRET_KEY = "<KEY>"
$env:LLM_API_KEY = "<KEY>"
echo $env:SECRET_KEY (Check if the environment variable is set; the value of <KEY> should appear in the terminal.)
```
### 5. Launch the API
```
flask run
or
flask run --debug
```
