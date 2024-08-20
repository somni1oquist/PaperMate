from flask import current_app as app
from datetime import datetime
import requests
from app.models.paper import Paper
from app import db

class ElsevierService:
    api_key = None

    @classmethod
    def set_api_key(cls):
        cls.api_key = app.config['ELS_API_KEY']
        if cls.api_key is None:
            raise ValueError('Missing API key for Elsevier.')

    @staticmethod
    def fetch_papers(params:dict):
        '''
        Fetch papers from Elsevier.\n
        `params` is a dictionary containing query parameters.
        - `start`: Index of the first paper to fetch, default is 0
        - `query`: **Required.** String describing the search criteria. If empty, use default query in `config.py`
        - `title`: String describing the title of the paper
        - `author`: String describing the author of the paper
        - `publication`: String describing the publication of the paper
        - `fromDate`: String describing the start date of the search range
        - `toDate`: String describing the end date of the search range
        - `keyword`: String describing the keyword of the paper
        '''
        # Set API key
        ElsevierService.set_api_key()
        # Clear existing papers to start new search
        ElsevierService.delete_papers()

        # If testing, return sample papers
        if app.config['TESTING']:
            import json
            from app.models.paper import Paper
            papers_json = json.load(open('sample.json'))
            papers = [Paper(**paper) for paper in papers_json]
            return papers
        
        # Check for start index
        params['start'] = params.get('start', 0)
        # Check for query parameter
        params['query'] = params.get('query', app.config['DEFAULT_QUERY'])
        if 'query' not in params or not params['query']:
            raise ValueError('Missing query parameter for Elsevier.')
        # Check for date range
        if (params['fromDate'] and type(params['fromDate']) != datetime):
            params['fromDate'] = datetime.strptime(params['fromDate'], '%Y-%m-%d').date()
        if (params['toDate'] and type(params['toDate']) != datetime):
            params['toDate'] = datetime.strptime(params['toDate'], '%Y-%m-%d').date()

        # Search URL for and Scopus
        scopus_url = f'https://api.elsevier.com/content/search/scopus?apiKey={ElsevierService.api_key}'
        
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
        scopus_url += f'&query={query}&count=25&start={params["start"]}'

        # Make request to ScienceDirect and Scopus
        scopus_res = requests.get(scopus_url)
        if scopus_res.status_code != 200:
            raise ValueError(f'Error fetching papers from Elsevier(Scopus: {scopus_res.status_code})')

        # Extract papers from response
        scopus_data = scopus_res.json().get('search-results', {})
        total_results = scopus_data.get('opensearch:totalResults', 0)
        items_per_page = scopus_data.get('opensearch:itemsPerPage', 25)
        papers = ElsevierService.transform_entries(scopus_data, params)
        # Iterate over all pages
        # for i in range(params['start'] + items_per_page, total_results, items_per_page):
        #     scopus_res = requests.get(scopus_url + f'&start={i}')
        #     if scopus_res.status_code != 200:
        #         raise ValueError(f'Error fetching papers from Elsevier(Scopus: {scopus_res.status_code})')
        #     scopus_data = scopus_res.json().get('results', [])
        #     papers.extend(ElsevierService.transform_entries(scopus_data, params))
        db.session.bulk_save_objects(papers)
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
                url=url,
                synopsis=None,
                relevance=None
            )
            # Apply date range filter
            if (params['fromDate'] and paper.publish_date > params['fromDate']) or\
                (params['toDate'] and paper.publish_date < params['toDate']):
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
        url = f"https://api.elsevier.com/content/abstract/doi/{doi}?apiKey={ElsevierService.api_key}"
        header = {'Accept': 'application/json'}
        res = requests.get(url, headers=header)
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