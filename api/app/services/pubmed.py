import requests
from datetime import datetime
from dateutil.relativedelta import relativedelta
import xml.etree.ElementTree as ET
from app.models.paper import Paper
from app import db

class PubMedService:

    db = 'pubmed'
    retmode = 'json'
    
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
        if params.get('fromDate') and params.get('toDate'):
            min_date = datetime.strptime(params.get('fromDate'), '%Y/%m')
            max_date = datetime.strptime(params.get('toDate'), '%Y/%m')
            terms.append("datetype=pdat")
            terms.append(f"mindate={min_date.strftime('%Y/%m')}")
            terms.append(f"maxdate={max_date.strftime('%Y/%m')}")

        return ' AND '.join(terms)
    
    @staticmethod
    def fetch_articles(params: dict):
        """Fetch articles from PubMed API based on query parameters."""
        query = PubMedService.build_query(params)
        response = requests.get(f"https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db={PubMedService.db}&retmode={PubMedService.retmode}&term={query}")
        response = response.json()
        id_list = response['esearchresult']['idlist']
        articles = PubMedService.get_articles(id_list)
        return 
    
    @staticmethod
    def get_articles(id_list: list):
        """Fetch article info from PubMed API."""
        response = requests.get(f"https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db={PubMedService.db}&id={','.join(id_list)}&retmode=xml&rettype=abstract")
        root = ET.fromstring(response.content)
        articles = {}
        for article in root.findall('.//PubmedArticle'):
            pmid = article.find('.//PMID').text
            doi = article.find('.//ArticleId[@IdType="doi"]').text
            url = f"https://doi.org/{doi.text}" if doi else None
            title = article.find('.//ArticleTitle').text
            authorList = article.findall('.//Author')
            authorList = [f"{author.find('LastName').text} {author.find('Initials').text}" for author in authorList]
            authors = ', '.join(authorList)
            journal = article.find('.//Title').text
            pub_date = article.find('.//PubDate')
            pub_date = f"{pub_date.find('Year').text}-{pub_date.find('Month').text}{f"-{pub_date.find('Day').text}" if pub_date.find('Day') else ''}"
            abstract_sections = article.findall('.//AbstractText')
            abstract = ' '.join([section.text for section in abstract_sections])
            articles[pmid] = {
                'title': title,
                'doi': doi,
                'authors': authors,
                'publication': journal,
                'publish_date': pub_date,
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
                publish_date=datetime.strptime(article.get('publish_date', '1970-01-01'), '%Y-%B-%d').date(),
                abstract=article.get('abstract', 'No Abstract.'),
                url=article.get('url')
            )
            papers.append(paper)
        db.session.add_all(papers)

    @staticmethod
    def delete_articles():
        """Delete all articles from the database."""
        db.session.query(Paper).delete()
        db.session.commit()

    @staticmethod
    def get_total_count(params: dict) -> int:
        """Fetch total count of articles from PubMed API based on query parameters."""
        query = PubMedService.build_query(params)
        response = requests.get(f"https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db={PubMedService.db}&retmode={PubMedService.retmode}&term={query}")
        response = response.json()
        return int(response['esearchresult']['count'])