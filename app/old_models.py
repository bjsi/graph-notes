from app import graph
from py2neo.ogm import GraphObject, Property, RelatedFrom, RelatedTo
import datetime as dt
import uuid
from flask import url_for


class Note(GraphObject):
    """ Represents a single note in the graph.

    Note class uses py2neo's OGM.
    Can only be used to add Notes and do simple queries.
    More complex queries (those involving relationship) must be done with cypher.
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
        self.content, tags = self.parse_tags()
        tags = self.create_tags(tags)
        for tag in tags:
            self.tags.add(tag)
        graph.push(self)

    def add_child(self, child):
        """
        Creates both sides of the parent <---> child relationship

        TODO Change this to allow "Note merging"
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

    def create_tags(self, tags):
        """
        Create tags
        """
        return [
                Tag(text=tag)
                for tag in tags
               ]

    def pull_latest_info(self):
        """
        Updates the Note object with latest info
        """
        graph.pull(self)
    
    def parse_tags(self):
        """
        Parse tags out of the content
        """
        content = []
        tags = []
        for line in self.content.splitlines():
            if line.startswith('@'):
                tags.append(line[1:].strip())
            else:
                content.append(line)
        return '\n'.join(content), tags

    @staticmethod
    def has_parent(id: str):
        """
        Check if the note has a parent
        """
        query = f"""
                 MATCH (n: Note)-[:CHILD_OF]->(p: Note)
                 WHERE n.id = \'{id}\'
                 RETURN p.id
                 """
        return graph.evaluate(query)

    @staticmethod
    def has_child(id: str):
        """
        Check if the note has a child
        """
        query = f"""
                 MATCH (n: Note)-[:PARENT_OF]->(c: Note)
                 WHERE n.id = \'{id}\'
                 RETURN c.id
                 """
        return graph.evaluate(query)

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
    def get_tags(id):
        """
        Get tags by id
        """
        query = f"""
                 MATCH (n: Note)<-[:TAGGED]-(t: Tag) 
                 WHERE n.id = \'{id}\'
                 RETURN collect(t.text) AS tags
                 """
        tags = graph.evaluate(query)
        return tags if tags else []
        
    @staticmethod
    def to_dict(note):
        """
        Cypher Note record as a dictionary object
        """
        data = {
            'id': note.get("id"),
            'content': note.get("content"),
            'createdAt': note.get("createdAt"),
            'archived': note.get("archived"),
            'tags': Note.get_tags(note.get("id")),
            '_links': {
                'parentNoteEndpoint': url_for('api.notes_notes_note',
                                              id=note.get("id")) if Note.has_parent(note.get("id")) else "",
                'childNoteEndpoint': url_for('api.notes_notes_note',
                                             id=note.get("id")) if Note.has_child(note.get("id")) else "",
                'currentNoteEndpoint': url_for('api.notes_notes_note',
                                               id=note.get("id"))
            }
        }
        return data

    @staticmethod
    def to_collection_dict(query: str,
                           query_key: str,
                           page: int,
                           per_page: int,
                           endpoint: str,
                           **kwargs):
        """ Paginate a collection of notes.

        Uses Cypher as opposed to the limited py2neo ogm.
        Therefore you can't use it as a method of a Note GraphObject

        :query: The base query.
        :page: The page number to get.
        :per_page: Number of Notes per page.
        :endpoint: The API endpoint.
        """

        # Pagination variables
        # Query one more than the query asks for to see if there is a next page
        # If the number of resources returned < per_page, it is the last page
        skip = (page * per_page) - per_page
        limit = per_page + 1

        # Add pagination clauses to the base query
        query = (query +
                 " SKIP " + str(skip) +
                 " LIMIT " + str(limit))
       
        resources = graph.run(query).data()
        has_next = len(resources) >= limit
        if has_next:
            resources = resources[:-1]

        data = {
            'data': [
                Note.to_dict(item[query_key])
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
