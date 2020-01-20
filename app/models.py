from app import graph
import datetime as dt
from py2neo import Node, Relationship
import datetime as dt
import uuid
from py2neo import Graph


class Note:
    """
    Represents a Note
    """

    def __init__(self, content, tags):
        self.content = content
        self.tags = tags

    def add_parent(self):
        note = Node(
            "Note",
            id=str(uuid.uuid4()),
            content=self.content,
            createdAt=dt.datetime.utcnow()
            archived=False,
        )
        tags = [
                x.strip()
                for x in self.tags.lower().split(',')
               ]
        for t in set(tags):
            tag = Node("Tag", tag=t)
            rel = Relationship(tag, "TAGGED", note)
            graph.merge(note, "Note", "id")
            graph.merge(tag, "Tag", "tag")
            graph.merge(rel)