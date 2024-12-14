import requests
from datetime import datetime
import xml.etree.ElementTree as ET
from app.interfaces.source_api import SourceAPI
from app.models.paper import Paper


class PubMedService(SourceAPI):
    db = 'pubmed'
    retmode = 'json'
    retmax = 5
    e_search = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi'
    e_fetch = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi'

    @staticmethod
    def get_total_count(params: dict) -> int:
        """Fetch total count of articles from PubMed API based on query parameters."""
        params.setdefault('start', 0)
        start = params.get('start')
        query = PubMedService.build_query(params)
        endpoint = f"{PubMedService.e_search}?db={PubMedService.db}&retmode={PubMedService.retmode}&retstart={start}&retmax={PubMedService.retmax}&term={query}"
        if params.get('fromDate') and params.get('toDate'):
            min_date = datetime.strptime(params.get('fromDate'), '%Y-%m')
            max_date = datetime.strptime(params.get('toDate'), '%Y-%m')
            endpoint += "&datetype=pdat"
            endpoint += f"&mindate={min_date.strftime('%Y/%m')}"
            endpoint += f"&maxdate={max_date.strftime('%Y/%m')}"
        response = requests.get(endpoint)
        response = response.json()
        return int(response['esearchresult']['count'])

    @staticmethod
    def build_query(params: dict):
        """Build a query string based on the parameters."""
        terms = [
            f"{value}[{field}]" for field, value in {
                'tiab': params.get('query'),
                'ti': params.get('title'),
                'au': params.get('author')
            }.items() if value
        ]
        if params.get('publication'):
            publication_query = ' OR '.join([f'"{pub}"[ta]' for pub in params.get('publication')])
            terms.append(publication_query)

        return ' AND '.join(terms)

    @staticmethod
    def fetch_papers(params: dict, delete_existing=True):
        if delete_existing:
            SourceAPI.delete_papers()

        params.setdefault('start', 0)
        start = params.get('start')
        query = PubMedService.build_query(params)
        endpoint = f"{PubMedService.e_search}?db={PubMedService.db}&retmode={PubMedService.retmode}&retstart={start}&retmax={PubMedService.retmax}&term={query}"
        if params.get('fromDate') and params.get('toDate'):
            min_date = datetime.strptime(params.get('fromDate'), '%Y-%m')
            max_date = datetime.strptime(params.get('toDate'), '%Y-%m')
            endpoint += "&datetype=pdat"
            endpoint += f"&mindate={min_date.strftime('%Y/%m')}"
            endpoint += f"&maxdate={max_date.strftime('%Y/%m')}"

        response = requests.get(endpoint)
        response = response.json()
        id_list = response['esearchresult']['idlist']
        entries = PubMedService.get_paper_info(id_list)
        papers = PubMedService.transform_entries(entries)
        SourceAPI.save_papers(papers)
        return papers

    @staticmethod
    def transform_entries(entries: dict):
        """Save articles to the database."""
        papers = []
        for pmid, entry in entries.items():
            paper = Paper(
                doi=entry.get('doi'),
                title=entry.get('title', 'No Title'),
                author=entry.get('authors', 'Unknown Author'),
                publication=entry.get('publication', 'No Publication Name'),
                publish_date=datetime.strptime(entry.get('publish_date', '1970-01-01'), '%Y-%m-%d').date(),
                abstract=entry.get('abstract', 'No Abstract.'),
                url=entry.get('url')
            )
            papers.append(paper)
        return papers

    @staticmethod
    def get_paper_info(id_list: list):
        """Fetch paper info from PubMed API."""
        response = requests.get(f"{PubMedService.e_fetch}?db={PubMedService.db}&id={','.join(id_list)}&retmode=xml&rettype=abstract")
        root = ET.fromstring(response.content)
        articles = {}
        for article in root.findall('.//PubmedArticle'):
            pmid = article.find('.//PMID').text
            doi = article.find('.//ArticleId[@IdType="doi"]')
            if doi is not None:
                doi = doi.text
            else:
                continue
            url = f"https://doi.org/{doi}" if doi else None
            title = article.find('.//ArticleTitle').text
            authorList = article.findall('.//Author')
            authorList = [f"{author.find('LastName').text} {author.find('Initials').text}" for author in authorList]
            authors = ', '.join(authorList)
            journal = article.find('.//Title').text
            pub_date = article.find('.//DateRevised')
            pub_date_str = f"{pub_date.find('Year').text}-{pub_date.find('Month').text}"
            if (pub_date.find('Day')):
                pub_date_str += f"-{pub_date.find('Day').text}"
            else:
                pub_date_str += "-01"
            abstract = article.find('.//AbstractText')
            abstract = ' '.join(abstract.itertext()) if abstract is not None else 'No Abstract.'
            articles[pmid] = {
                'title': title,
                'doi': doi,
                'authors': authors,
                'publication': journal,
                'publish_date': pub_date_str,
                'abstract': abstract,
                'url': url
            }
        return articles
