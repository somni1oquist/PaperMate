class Paper:
    papers = []
    id_counter = 1

    def __init__(self, title, author, year):
        self.id = Paper.id_counter
        self.title = title
        self.author = author
        self.year = year
        Paper.id_counter += 1
        Paper.papers.append(self)

    @classmethod
    def get_all(cls):
        return cls.papers

    @classmethod
    def create(cls, data):
        return cls(data['title'], data['author'], data['year'])
