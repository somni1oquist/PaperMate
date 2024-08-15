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
├── config.py
├── requirements.txt
└── tests/
```

## Steps to launch the API app

```
python -m venv .venv

source .venv/bin/activate (Linux/Mac)
.venv\Scripts\activate (Windows)

pip install -r requirements
export SECRET_KEY=<KEY>
flask run
```