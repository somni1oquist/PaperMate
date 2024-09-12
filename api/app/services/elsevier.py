import json
from flask import current_app as app
from datetime import datetime
import requests
from app.models.paper import Paper
from app import db
from dateutil.relativedelta import relativedelta


class ElsevierService:
    api_key = None
    inst_token = None
    headers = None

    @classmethod
    def set_api_key(cls):
        cls.api_key = app.config.get('ELS_API_KEY')
        cls.inst_token = app.config.get('ELS_TOKEN')
        if not cls.api_key:
            raise ValueError('Missing API key for Elsevier.')
        cls.headers = {
            'X-ELS-APIKey': cls.api_key,
            'X-ELS-Insttoken': cls.inst_token,
            'Accept': 'application/json'
        }

    @staticmethod
    def convert_date_format(date_str):
        """Convert date from yyyy-mm to 'Month Year' format."""
        try:
            date_obj = datetime.strptime(date_str, '%Y-%m')
            return date_obj.strftime('%B %Y')  # Convert to "Month Year" format
        except ValueError:
            return None 
    @staticmethod
    def update_papers(papers: dict):
        """Update papers in the database with mutated data."""
        for doi, mutation in papers.items():
            paper = Paper.query.filter_by(doi=doi).first()
            if paper:
                paper.mutation = json.dumps(mutation)
                db.session.commit()

    @staticmethod
    def get_papers_by_dois(doi_list: list):
        """Retrieve papers from the database by DOI list."""
        return [Paper.query.filter_by(doi=doi).first() for doi in doi_list if Paper.query.filter_by(doi=doi).first()]

    @staticmethod
    def fetch_papers(params: dict):
        """Fetch papers from Elsevier API based on query parameters."""
        ElsevierService.set_api_key()
        ElsevierService.delete_papers()

        params.setdefault('start', 0)
        params['query'] = params.get('query', None)
        if not params['query']:
            raise ValueError('Missing query parameter for Elsevier.')

        scopus_data = ElsevierService.fetch_scopus_data(params)
        papers = ElsevierService.transform_entries(scopus_data, params)
        ElsevierService.save_papers(papers)
        return papers

    @staticmethod
    def build_query(params):
        """Build query string from parameters."""
        query_parts = [f"{field}({value})" for field, value in {
            'TITLE-ABS-KEY': params.get('query'),
            'TITLE': params.get('title'),
            'AUTHOR-NAME': params.get('author'),
            'SRCTITLE': params.get('publication')
        }.items() if value]

        # Handle date range
        from_date_str = params.get('fromDate')
        to_date_str = params.get('toDate')

        if from_date_str and to_date_str:
            try:
                from_date = datetime.strptime(from_date_str, '%Y-%m')
                to_date = datetime.strptime(to_date_str, '%Y-%m')
            except ValueError as e:
                raise ValueError(f"Invalid date format. Expected format: yyyy-mm. Error: {e}")

            # Generate all months in the range
            months = []
            current_date = from_date
            while current_date <= to_date:
                month_str = '"' + current_date.strftime('%B %Y') + '"'
                months.append(month_str)
                current_date = current_date + relativedelta(months=1)
        
            # Join months with OR operator
            month_query = ' OR '.join(months)
            query_parts.append(f"PUBDATETXT({month_query})")
    
        return ' AND '.join(query_parts)




    @staticmethod
    def transform_entries(response, params):
        """Transform Elsevier API response entries into Paper objects."""
        papers = []

        for entry in response.get('entry', []):
            paper_publish_date = datetime.strptime(entry.get('prism:coverDate', '1970-01-01'), '%Y-%m-%d').date()

            paper = Paper(
                title=entry.get('dc:title', 'No Title'),
                author=entry.get('dc:creator', 'Unknown Author'),
                publication=entry.get('prism:publicationName', 'No Publication Name'),
                publish_date=paper_publish_date,
                doi=entry.get('prism:doi'),
                abstract=ElsevierService.get_abstract(entry.get('prism:doi')) if entry.get('prism:doi') else "No Abstract.",
                url=f"https://doi.org/{entry.get('prism:doi')}" if entry.get('prism:doi') else None
            )
            papers.append(paper)
        return papers


    @staticmethod
    def get_abstract(doi: str):
        """Fetch abstract for a paper from Elsevier API by DOI."""
        ElsevierService.set_api_key()
        url = f"https://api.elsevier.com/content/abstract/doi/{doi}"
        res = requests.get(url, headers=ElsevierService.headers)
        if res.status_code != 200:
            raise ValueError(f'Error fetching paper abstract from Elsevier ({res.status_code})')
        return res.json().get('abstracts-retrieval-response', {}).get('coredata', {}).get('dc:description', 'No Abstract')

    @staticmethod
    def delete_papers():
        """Delete all papers from the database."""
        db.session.query(Paper).delete()
        db.session.commit()

    @staticmethod
    def get_total_count(params: dict) -> int:
        """Fetch total count of papers from Elsevier API based on query parameters."""
        ElsevierService.set_api_key()
        params.setdefault('start', 0)
        params['query'] = params.get('query', None)
        if not params['query']:
            raise ValueError('Missing query parameter for Elsevier.')
        scopus_data = ElsevierService.fetch_scopus_data(params)
        return int(scopus_data.get('opensearch:totalResults', 0))

    @staticmethod
    def fetch_scopus_data(params):
        """Fetch data from Scopus API based on the query parameters."""
        scopus_url = f"https://api.elsevier.com/content/search/scopus?query={ElsevierService.build_query(params)}&count=5&start={params['start']}"
        scopus_res = requests.get(scopus_url, headers=ElsevierService.headers)
        if scopus_res.status_code != 200:
            raise ValueError(f'Error fetching papers from Elsevier (Scopus: {scopus_res.status_code})')
        return scopus_res.json().get('search-results', {})

    @staticmethod
    def save_papers(papers):
        """Save papers to the database."""
        db.session.add_all(papers)
        db.session.commit()