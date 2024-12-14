from abc import ABC, abstractmethod
import json
from app import db
from app.models.paper import Paper


class SourceAPI(ABC):

    @staticmethod
    def get_papers_by_dois(doi_list: list):
        """Retrieve papers from the database by DOI list."""
        return [Paper.query.filter_by(doi=doi).first() for doi in doi_list if Paper.query.filter_by(doi=doi).first()]

    @staticmethod
    def update_papers(papers: dict):
        """Update papers in the database with mutated data."""
        for doi, mutation in papers.items():
            paper = Paper.query.filter_by(doi=doi).first()
            if paper:
                paper.mutation = json.dumps(mutation)
                db.session.commit()

    @staticmethod
    def delete_papers():
        db.session.query(Paper).delete()
        db.session.commit()

    @staticmethod
    def save_papers(papers: dict):
        db.session.add_all(papers)
        db.session.commit()

    @staticmethod
    @abstractmethod
    def get_total_count(params: dict):
        """Get the total count of papers based on query parameters."""
        raise NotImplementedError("This method should be implemented by subclasses.")

    @staticmethod
    @abstractmethod
    def build_query(params: dict):
        """Build query based on parameters."""
        raise NotImplementedError("This method should be implemented by subclasses.")

    @staticmethod
    @abstractmethod
    def fetch_papers(params: dict, delete_existing=True):
        """Fetch papers from the API based on query parameters."""
        raise NotImplementedError("This method should be implemented by subclasses.")

    @staticmethod
    @abstractmethod
    def transform_papers(papers: list):
        """Transform papers dictionary into a Paper model."""
        raise NotImplementedError("This method should be implemented by subclasses.")
    