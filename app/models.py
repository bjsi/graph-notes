from typing import List, Dict, Any
from flask import url_for
import os
from neomodel import (StructuredNode,
                      StringProperty,
                      UniqueIdProperty,
                      BooleanProperty,
                      RelationshipTo,
                      RelationshipFrom,
                      config,
                      DateTimeProperty)
from neomodel import db


config.DATABASE_URL = os.environ.get("NEO4J_BOLT_URL")


class PaginatedAPIMixin(object):
    """
    Mixin for returning paginated Notes.
    """

    @staticmethod
    def to_collection_dict(query: str, params: Dict[str, Any], endpoint: str, **kwargs) -> Dict:
        """
        Runs the Cypher query, returns a dict with pagination information.
        """
        
        results, meta = db.cypher_query(query, params)
        resources = [Note.inflate(row[0]) for row in results]

        has_next = len(resources) >= params['limit']
        if has_next:
            resources = resources[:-1]

        data = {
            'data': [
                item.to_dict()
                for item in resources
            ],
            '_meta': {
                "currentPage": (params['skip']/params['per_page']) + 1,
                "itemsPerPage": params['per_page'],
            },
            '_links': {
                "currentPageEndpoint": url_for(endpoint,
                                               page=params['page'],
                                               **kwargs),
                "nextPageEndpoint": url_for(endpoint,
                                            page=params['page'] + 1,
                                            **kwargs) if has_next else "",
                "prevPageEndpoint": url_for(endpoint,
                                            page=params['page'] - 1,
                                            **kwargs) if params['page'] != 1 else "",
            }
        }
        return data


class Note(PaginatedAPIMixin, StructuredNode):
    """
    Note model with data and relationships
    """
    
    # Data
    uid = UniqueIdProperty()
    content = StringProperty(required=True)
    createdAt = DateTimeProperty(default_now=True)
    archived = BooleanProperty(default=False)

    # Relationships
    child = RelationshipFrom("Note", "CHILD_OF")
    parent = RelationshipFrom("Note", "PARENT_OF")
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
        for tag_text in tags:
            tag = Tag.get_or_create({'text': tag_text})[0]
            tag.save()
            self.tags.connect(tag)

    def has_child(self):
        return self.child.get_or_none(lazy=True)

    def has_parent(self):
        return self.parent.get_or_none(lazy=True)

    def get_edit_history(self):
        """
        TODO
        """
        pass

    def to_dict(self):
        return {
            'uid': self.uid,
            'id': self.id,
            'createdAt': self.createdAt,
            'archived': self.archived,
            'content': self.content,
            'tags': [
                tag.text
                for tag in self.tags.all()
            ],
            '_links': {
                'currentNoteEndpoint': url_for('api.notes_notes_note', uid=self.uid),

                'parentNoteEndpoint': url_for('api.notes_notes_note', uid=self.parent.get().uid) \
                                      if self.has_parent() else "",

                'childNoteEndpoint': url_for('api.notes_notes_note', uid=self.child.get().uid) \
                                     if self.has_child() else ""
            }
        }

# TODO Create a merged Note

class Tag(StructuredNode):
    text = StringProperty(unique_index=True)