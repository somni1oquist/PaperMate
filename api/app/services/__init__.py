from config import Config
from app.services.pubmed import PubMedService
from app.services.elsevier import ElsevierService


def get_source():
    if Config.SOURCE_TYPE == "pubmed":
        return PubMedService
    elif Config.SOURCE_TYPE == "elsevier":
        return ElsevierService
    else:
        raise ValueError(f"Unknown service type: {Config.SOURCE_TYPE}")
