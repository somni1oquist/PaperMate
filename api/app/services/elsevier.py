import json
from flask import current_app as app
from datetime import datetime
import requests
from app.models.paper import Paper
from app import db

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

        if app.config['TESTING']:
            return ElsevierService.load_sample_papers()

        params.setdefault('start', 0)
        params['query'] = params.get('query', None)
        if not params['query']:
            raise ValueError('Missing query parameter for Elsevier.')

        ElsevierService.normalize_dates(params)
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
        'SRCTITLE': params.get('publication'),
        'KEY': params.get('keyword')
        }.items() if value]

        if params.get('fromDate') and params.get('toDate'):
            try:
                from_date = datetime.strptime(params['fromDate'], '%Y-%m')
                to_date = datetime.strptime(params['toDate'], '%Y-%m')
            except ValueError as e:
                print(f"Date parsing error: {e}")
            raise ValueError("Invalid date format. Expected format: yyyy-mm")
        
        # Generate all months in the range
        months = []
        while from_date <= to_date:
            months.append(from_date.strftime('%B %Y'))
            from_date = from_date + relativedelta(months=1)
        
        # Join months with OR operator
        month_query = ' OR '.join(months)
        query_parts.append(f"pubdate({month_query})")
    
        return ' AND '.join(query_parts)



    @staticmethod
    def transform_entries(response, params):
        """Transform Elsevier API response entries into Paper objects."""
        papers = []
        from_date = datetime.strptime(params.get('fromDate', '01-01-1970'), '%d-%m-%Y').date()
        to_date = datetime.strptime(params.get('toDate', '31-12-9999'), '%d-%m-%Y').date()

        for entry in response.get('entry', []):
            paper_publish_date = datetime.strptime(entry.get('prism:coverDate', '1970-01-01'), '%Y-%m-%d').date()
            if from_date and paper_publish_date < from_date:
                continue
            if to_date and paper_publish_date > to_date:
                continue

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
    def normalize_dates(params):
        """Convert date strings in the parameters to date objects."""
        for date_key in ['fromDate', 'toDate']:
            if params.get(date_key) and isinstance(params[date_key], str):
                params[date_key] = datetime.strptime(params[date_key], '%d-%m-%Y').date()

    @staticmethod
    def save_papers(papers):
        """Save papers to the database."""
        db.session.add_all(papers)
        db.session.commit()

    @staticmethod
    def load_sample_papers():
        """Load local sample paper data (for testing only)."""
        with open('sample.json', encoding='utf-8') as f:
            papers_json = json.load(f)
        papers = [
            Paper(**{
                'publication': paper['publication'],
                'doi': paper['doi'],
                'title': paper['title'],
                'author': paper['author'],
                'publish_date': datetime.strptime(paper['publish_date'], '%Y-%m-%d').date(),
                'abstract': paper['abstract'],
                'url': paper['url']
        }) for paper in papers_json
        ]
        ElsevierService.save_papers(papers)
        return papers