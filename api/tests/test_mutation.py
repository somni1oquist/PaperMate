import json
import os
import unittest
from datetime import datetime

from app.models.paper import db, Paper
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
            self.sample_data = json.load(f)

        # Insert the first data in sample_data into the database
        self.paper_data = self.sample_data[0]  # Use the first data

        # Convert a string date to a datetime.date object
        publish_date = datetime.strptime(self.paper_data['publish_date'], '%Y-%m-%d').date()

        paper = Paper(
            doi=self.paper_data['doi'],
            title=self.paper_data['title'],
            author=self.paper_data['author'],
            publication=self.paper_data['publication'],
            publish_date=publish_date,  # Use the converted date
            abstract=self.paper_data['abstract'],
            synopsis=self.paper_data['synopsis'],
            relevance=self.paper_data['relevance'],
            url=self.paper_data['url']
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
        self.assertEqual(paper.doi, "10.37934/araset.48.1.137151")  # Ensure the inserted data is as expected

        # @TODO: Make a request that modifies the paper and asserts mutation
        response = self.app.test_client().post('/api/your_endpoint', json={'mutation_data': 'some_value'})

        # After making the request, check if the mutation column is filled
        paper_after_mutation = Paper.query.first()
        self.assertIsNotNone(paper_after_mutation.mutation)  # Ensure mutation column is not None
        self.assertEqual(paper_after_mutation.mutation, 'expected_value')  # Assert the expected value

if __name__ == '__main__':
    unittest.main()
