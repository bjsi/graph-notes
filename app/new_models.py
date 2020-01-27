from typing import List
import pytz
import os
import datetime as dt
from neomodel import (StructuredNode, StringProperty, IntegerProperty,
                      UniqueIdProperty, BooleanProperty, RelationshipTo,RelationshipFrom, config, DateTimeProperty)

config.DATABASE_URL = os.environ.get("NEO4J_BOLT_URL")


class Note(StructuredNode):
    """
    Note model with data and relationships
    """
    
    # Data
    uid = UniqueIdProperty()
    content = StringProperty(required=True)
    createdAt = DateTimeProperty(default_now=True)
    archived = BooleanProperty(default=False)

    # Relationships
    child = RelationshipTo("Note", "CHILD_OF")
    parent = RelationshipTo("Note", "PARENT_OF")
    tags = RelationshipFrom("Tag", "TAGGED")

    def parse_tags(self):
        content = []
        tags = []
        for line in self.content.splitlines():
            if line.startswith('@'):
                tags.append(line[1:].strip())
            else:
                content.append(line)
        return '\n'.join(content), tags

    def save_note(self):
        self.content, tags = self.parse_tags()
        self.save()
        for tag in tags:
            newTag = Tag(text=tag)
            newTag.save()
            self.tags.connect(newTag)

    def add_child(self, child):
        self.child.save()
        self.save()
        self.child.connect(child)
        self.archived = True
        self.save()

    def has_child(self):
        self.child.get_or_none(lazy=True)

    def has_parent(self):
        self.parent.get_or_none(lazy=True)
    
    @classmethod
    def public(cls):
        return Note.nodes.filter(archived=False).all()


class Tag(StructuredNode):
    text = StringProperty(unique_index=True)