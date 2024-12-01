import requests
from datetime import datetime
import xml.etree.ElementTree as ET
from app.models.paper import Paper
from app import db

class PubMedService:


    db = 'pubmed'
    retmode = 'json'
    retmax = 5

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
    def fetch_articles(params: dict, delete_existing=True):
        """Fetch articles from PubMed API based on query parameters."""
        if delete_existing:
            Paper.query.delete()
            db.session.commit()
        params.setdefault('start', 0)
        start = params.get('start')
        query = PubMedService.build_query(params)
        endpoint = f"https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db={PubMedService.db}&retmode={PubMedService.retmode}&retstart={start}&retmax={PubMedService.retmax}&term={query}"
        if params.get('fromDate') and params.get('toDate'):
            min_date = datetime.strptime(params.get('fromDate'), '%Y-%m')
            max_date = datetime.strptime(params.get('toDate'), '%Y-%m')
            endpoint += "&datetype=pdat"
            endpoint += f"&mindate={min_date.strftime('%Y/%m')}"
            endpoint += f"&maxdate={max_date.strftime('%Y/%m')}"

        response = requests.get(endpoint)
        response = response.json()
        id_list = response['esearchresult']['idlist']
        articles = PubMedService.get_articles(id_list)
        papers = PubMedService.save_articles(articles)
        return papers

    @staticmethod
    def get_articles(id_list: list):
        """Fetch article info from PubMed API."""
        response = requests.get(f"https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db={PubMedService.db}&id={','.join(id_list)}&retmode=xml&rettype=abstract")
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

    @staticmethod
    def save_articles(articles: dict):
        """Save articles to the database."""
        papers = []
        for pmid, article in articles.items():
            paper = Paper(
                doi=article.get('doi'),
                title=article.get('title', 'No Title'),
                author=article.get('authors', 'Unknown Author'),
                publication=article.get('publication', 'No Publication Name'),
                publish_date=datetime.strptime(article.get('publish_date', '1970-01-01'), '%Y-%m-%d').date(),
                abstract=article.get('abstract', 'No Abstract.'),
                url=article.get('url')
            )
            papers.append(paper)
        db.session.add_all(papers)
        db.session.commit()
        return papers

    @staticmethod
    def get_total_count(params: dict) -> int:
        """Fetch total count of articles from PubMed API based on query parameters."""
        params.setdefault('start', 0)
        start = params.get('start')
        query = PubMedService.build_query(params)
        endpoint = f"https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db={PubMedService.db}&retmode={PubMedService.retmode}&retstart={start}&retmax={PubMedService.retmax}&term={query}"
        if params.get('fromDate') and params.get('toDate'):
            min_date = datetime.strptime(params.get('fromDate'), '%Y-%m')
            max_date = datetime.strptime(params.get('toDate'), '%Y-%m')
            endpoint += "&datetype=pdat"
            endpoint += f"&mindate={min_date.strftime('%Y/%m')}"
            endpoint += f"&maxdate={max_date.strftime('%Y/%m')}"
        response = requests.get(endpoint)
        response = response.json()
        return int(response['esearchresult']['count'])
