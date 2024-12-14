from app.interfaces.source_api import SourceAPI
from flask import current_app as app
from datetime import datetime
import requests
from app.models.paper import Paper
from dateutil.relativedelta import relativedelta


class ElsevierService(SourceAPI):
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
    def build_query(params):
        """Build query string from parameters."""
        query_parts = [f"{field}({value})" for field, value in {
            'TITLE-ABS-KEY': params.get('query'),
            'TITLE': params.get('title'),
            'AUTHOR-NAME': params.get('author')
        }.items() if value]

        # Handle Publication Name
        if params.get('publication'):
            publication_query = ' OR '.join([f'"{pub.strip()}"' for pub in params.get('publication')])
            query_parts.append(f"SRCTITLE({publication_query})")

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
    def fetch_papers(params: dict, delete_existing=True):
        """Fetch papers from Elsevier API based on query parameters."""
        ElsevierService.set_api_key()
        if delete_existing:
            SourceAPI.delete_papers()

        params.setdefault('start', 0)
        params['query'] = params.get('query', None)
        if not params['query']:
            raise ValueError('Missing query parameter for Elsevier.')

        scopus_data = ElsevierService.fetch_scopus_data(params)
        papers = ElsevierService.transform_entries(scopus_data, params)
        SourceAPI.save_papers(papers)
        return papers

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
            # Some entries may not have a DOI and are not digital objects
            if not paper.doi:
                continue
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
    def fetch_scopus_data(params):
        """Fetch data from Scopus API based on the query parameters."""
        batch_size = app.config.get('BATCH_SIZE', 5)
        start = params.get('start', 0)
        scopus_url = f"https://api.elsevier.com/content/search/scopus?query={ElsevierService.build_query(params)}&count={batch_size}&start={start}"
        scopus_res = requests.get(scopus_url, headers=ElsevierService.headers)
        if scopus_res.status_code != 200:
            raise ValueError(f'Error fetching papers from Elsevier (Scopus: {scopus_res.status_code})')
        return scopus_res.json().get('search-results', {})
