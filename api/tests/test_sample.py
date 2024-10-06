import unittest


class TestSample(unittest.TestCase):

    def test_placeholder(self):
        self.assertEqual(1 + 1, 2)


if __name__ == '__main__':
    unittest.main()
