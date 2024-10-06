import json
import os
import unittest
from datetime import datetime
from app.models.paper import db, Paper  # 确保这里的导入路径正确
from app import create_app

class TestGeminiService(unittest.TestCase):

    def setUp(self):
        # Create an application and push the context
        self.app = create_app()
        self.app_context = self.app.app_context()
        self.app_context.push()

        # Create database tables
        db.create_all()

        # Read the sample.json file
        with open(os.path.join(os.path.dirname(__file__), '../sample.json')) as f:
            sample_data = json.load(f)

        # Insert the first data in sample_data into the database
        paper_data = sample_data[0]  # Use the first data

        # Convert a string date to a datetime.date object
        publish_date = datetime.strptime(paper_data['publish_date'], '%Y-%m-%d').date()

        paper = Paper(
            doi=paper_data['doi'],
            title=paper_data['title'],
            author=paper_data['author'],
            publication=paper_data['publication'],
            publish_date=publish_date,  # Use the converted date
            abstract=paper_data['abstract'],
            synopsis=paper_data['synopsis'],
            relevance=paper_data['relevance'],
            url=paper_data['url']
        )

        db.session.add(paper)
        db.session.commit()

    def tearDown(self):
        db.session.remove()
        db.drop_all()
        self.app_context.pop()

    def test_sample_data_inserted(self):
        # Verify that data has been inserted into the database
        paper = Paper.query.first()
        self.assertIsNotNone(paper)
        self.assertEqual(paper.doi, "10.37934/araset.48.1.137151")  # Make sure the inserted data is as expected
