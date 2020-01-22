from app import graph
from py2neo.ogm import GraphObject, Property, RelatedFrom, RelatedTo
import datetime as dt
import uuid
from flask import url_for


class Note(GraphObject):
    """
    A note
    """
    __primarykey__ = "id"

    # Data
    id = Property()
    content = Property()
    createdAt = Property()
    archived = Property()

    # Relationships
    tags = RelatedFrom("Tag", "TAGGED")
    child = RelatedFrom("Note", "CHILD_OF")
    parent = RelatedFrom("Note", "PARENT_OF")

    def __init__(self, content):
        self.content = content
        self.createdAt = dt.datetime.utcnow().isoformat()
        self.id = str(uuid.uuid4())
        self.archived = False

    def save(self):
        """
        Push the Note instance to the graph
        """
        graph.push(self)

    def add_child(self, child):
        """
        Creates both sides of the parent <---> child relationship
        Only one child permitted.
        """
        if self.archived is True:
            print("Already archived.")
            return
        if list(self.child):
            print("Already has a child.")
            return
        self.child.add(child)
        child.parent.add(self)
        self.archived = True
        self.save()

    def add_tag(self, tag):
        """
        Add a tag to the Note
        """
        self.tags.add(tag)
        self.save()

    def pull_latest_info(self):
        """
        Updates the Note object with latest info
        """
        graph.pull(self)

    def to_dict(self):
        """
        Return Note as a dictionary object
        """
        data = {
            'id': self.id,
            'content': self.content,
            'createdAt': self.createdAt,
            'archived': self.archived,
            'tags': [
                x.text for x in list(self.tags)
            ]
        }

        return data

    @classmethod
    def public(cls):
        """
        Get outstanding notes
        """
        notes = (Note
                 .match(graph)
                 .where("_.archived = false"))
        return notes
    
    @staticmethod
    def to_collection_dict(query: str, page: int, per_page: int, endpoint: str, **kwargs):
        """ Paginate a collection of notes.

        :query: The base query.
        :page: The page number to get.
        :per_page: Number of Notes per page.
        :endpoint: The API endpoint.
        """

        # Pagination variables
        skip = (page * per_page) - per_page
        limit = per_page + 1

        # Build up from the base query
        query = query.limit(limit).skip(skip)

        resources = list(query)
        has_next = len(resources) >= limit

        # Query one more than the query asks for to see if there is a next page
        # If the number of resources returned < per_page, it is the last page

        data = {
            'data': [
                item.to_dict()
                for item in resources
            ],
            "_meta": {
                "currentPage": (skip / per_page) + 1,
                "itemsPerPage": per_page,
            },
            "_links": {
                "currentPageEndpoint": url_for(endpoint,
                                               page=page,
                                               per_page=per_page,
                                               **kwargs),
                "nextPageEndpoint": url_for(endpoint,
                                            page=page + 1,
                                            per_page=per_page,
                                            **kwargs) if has_next else "",
                "prevPageEndpoint": url_for(endpoint,
                                            page=page - 1,
                                            per_page=per_page,
                                            **kwargs) if page != 1 else ""
            }
        }
        return data

    def __repr__(self):
        return f"<Note: id={self.id} content={self.content[:10]}>"


class Tag(GraphObject):
    """
    A Tag
    """
    __primarykey__ = "text"

    # Data
    text = Property()

    # Relationships
    tagged = RelatedTo(Note, "TAGGED")
    subtag = RelatedFrom("Tag", "SUBTAG_OF")
    supertag = RelatedFrom("Tag", "SUPERTAG_OF")

    def __init__(self, text):
        self.text = text

    @classmethod
    def chain_tags(cls, tags):
        # TODO Tag factory
        tags = tags.split(':')
        for idx, tag in enumerate(tags):
            if idx == (len(tags) - 1):
                break
            supertag = Tag(text=tag)
            subtag = Tag(text=tags[idx+1])
            supertag.subtag.add(subtag)
            subtag.supertag.add(supertag)
            supertag.save()

    def save(self):
        """
        Save the current tag plus relationships.
        """
        graph.push(self)

    def __repr__(self):
        return f"<Tag: text={self.text}>"
