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
        cls.api_key = app.config['ELS_API_KEY']
        cls.inst_token = app.config['ELS_TOKEN']
        if cls.api_key is None:
            raise ValueError('Missing API key for Elsevier.')
        cls.headers = {
            'X-ELS-APIKey': cls.api_key,
            'X-ELS-Insttoken': cls.inst_token,
            'Accept': 'application/json'
        }

    @staticmethod
    def update_papers(papers:dict):
        '''
        Update papers in the database with mutated data.

        Args:
            papers: A dictionary containing DOIs as keys and mutated data as values.

        Returns:
            None
        '''
        for doi, mutation in papers.items():
            paper = Paper.query.filter_by(doi=doi).first()
            if paper:
                paper.mutation = json.dumps(mutation)
                db.session.commit()
    
    @staticmethod
    def get_papers_by_dois(doi_list:list):
        """
        Get papers from the database

        Args:
            doi_list: A list of DOIs to search for.

        Returns:
            A list of papers.
        """
        papers = []
        for doi in doi_list:
            paper = Paper.query.filter_by(doi=doi).first()
            if paper:
                papers.append(paper)
        return papers

    @staticmethod
    def fetch_papers(params:dict):
        # @TODO: Check publish date correctness
        """
        Fetches papers from the Elsevier API based on the provided query parameters.

        Args:
            params (dict): A dictionary of query parameters, which may include:
                - `start` (int): Optional. The index of the first paper to fetch. Defaults to 0.
                - `query` (str): Required. The search criteria for finding papers. If not provided, a default query from `config.py` will be used.
                - `title` (str): Optional.
                - `author` (str): Optional.
                - `publication` (str): Optional.
                - `fromDate` (str): Optional. The start date of the search range (format: YYYY-MM-DD).
                - `toDate` (str): Optional. The end date of the search range (format: YYYY-MM-DD).

        Returns:
            list: A list of papers that match the search criteria.
        """

        # Set API key
        ElsevierService.set_api_key()
        # Clear existing papers to start new search
        ElsevierService.delete_papers()

        # If testing, return sample papers
        if app.config['TESTING']:
            import json
            from app.models.paper import Paper
            with open('sample.json', encoding='utf-8') as f:
                papers_json = json.load(f)
            papers = [Paper(
                publication=paper['publication'],
                doi=paper['doi'],
                title=paper['title'],
                author=paper['author'],
                publish_date=datetime.strptime(paper['publish_date'], '%Y-%m-%d').date(),
                abstract=paper['abstract'],
                url=paper['url']
            ) for paper in papers_json]

            db.session.add_all(papers)
            db.session.commit()
            return papers
        
        # Check for start index
        params['start'] = params.get('start', 0)
        # Check for query parameter
        params['query'] = params.get('query', app.config['DEFAULT_QUERY'])
        if 'query' not in params or not params['query']:
            raise ValueError('Missing query parameter for Elsevier.')
        # Check for date range
        if (params.get('fromDate', None) and type(params['fromDate']) != datetime):
            params['fromDate'] = datetime.strptime(params['fromDate'], '%d-%m-%Y').date()
        if (params.get('toDate', None) and type(params['toDate']) != datetime):
            params['toDate'] = datetime.strptime(params['toDate'], '%d-%m-%Y').date()

        # Search URL for and Scopus
        scopus_url = f'https://api.elsevier.com/content/search/scopus'
        
        # Extract query parameters
        query_parts = []
        for key, value in params.items():
            switcher = {
                'query': f'TITLE-ABS-KEY({value})',
                'title': f'TITLE({value})',
                'author': f'AUTHOR-NAME({value})',
                'publication': f'SRCTITLE({value})',
                'keyword': f'KEY({value})'
            }
            if key in switcher and value:
                query_parts.append(switcher[key])
        query = ' AND '.join(query_parts)
        scopus_url += f'?query={query}&count=5&start={params["start"]}'

        # Make request to ScienceDirect and Scopus
        scopus_res = requests.get(scopus_url, headers=ElsevierService.headers)
        if scopus_res.status_code != 200:
            raise ValueError(f'Error fetching papers from Elsevier(Scopus: {scopus_res.status_code})')

        # Extract papers from response
        scopus_data = scopus_res.json().get('search-results', {})
        total_results = scopus_data.get('opensearch:totalResults', 0)
        items_per_page = scopus_data.get('opensearch:itemsPerPage', 5)
        papers = ElsevierService.transform_entries(scopus_data, params)
        # Iterate over all pages
        # for i in range(params['start'] + items_per_page, total_results, items_per_page):
        #     scopus_res = requests.get(scopus_url + f'&start={i}')
        #     if scopus_res.status_code != 200:
        #         raise ValueError(f'Error fetching papers from Elsevier(Scopus: {scopus_res.status_code})')
        #     scopus_data = scopus_res.json().get('results', [])
        #     papers.extend(ElsevierService.transform_entries(scopus_data, params))
        db.session.add_all(papers)
        db.session.commit()
        return papers
    
    @staticmethod
    def transform_entries(response, params):
        '''
        Transform entries from Elsevier API response to a list of Paper objects
        '''
        papers = []
        for entry in response.get('entry', []):
            title = entry.get('dc:title', 'No Title')
            author = entry.get('dc:creator', 'Unknown Author')
            publication_name = entry.get('prism:publicationName', 'No Publication Name')
            publish_date_str = entry.get('prism:coverDate', '1970-01-01')
            publish_date = datetime.strptime(publish_date_str, '%Y-%m-%d').date()
            doi = entry.get('prism:doi', None)
            abstract = abstract = ElsevierService.get_abstract(doi) if doi else "No Abstract."
            url = f"https://doi.org/{doi}" if doi else None

            # Create a Paper object
            paper = Paper(
                publication=publication_name,
                doi=doi,
                title=title,
                author=author,
                publish_date=publish_date,
                abstract=abstract,
                url=url
            )
            # Apply date range filter
            if (params.get('fromDate', None) and paper.publish_date < params['fromDate']) or\
            (params.get('toDate', None) and paper.publish_date > params['toDate']):
                continue
            papers.append(paper)
        return papers
    
    @staticmethod
    def get_abstract(doi:str):
        '''
        Get abstract of a paper from Elsevier API by DOI
        '''
        # Check if API key is set properly
        ElsevierService.set_api_key()
        # Fetch paper abstract
        url = f"https://api.elsevier.com/content/abstract/doi/{doi}"
        res = requests.get(url, headers=ElsevierService.headers)
        if res.status_code != 200:
            raise ValueError(f'Error fetching paper abstract from Elsevier({res.status_code})')
        abs_res = res.json().get('abstracts-retrieval-response', {})
        coredata = abs_res.get('coredata', {})
        return coredata.get('dc:description', 'No Abstract')
    
    @staticmethod
    def delete_papers():
        '''
        Delete all papers in database
        '''
        db.session.query(Paper).delete()
        db.session.commit()