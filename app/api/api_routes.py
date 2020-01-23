from flask import request, url_for
from flask_restplus import Resource
from app import graph
from ..models import Note, Tag
from api_models import (api,
                        note_ns,
                        note_model,
                        note_content,
                        paginated_notes_model)


# Routes
@note_ns.route('/')
class Notes(Resource):
    """ Main Note routes.
    """
    @api.marshal_with(paginated_notes_model)
    @api.response(200, 'Successfully read notes')
    @api.param('page', 'Number of the page to get')
    @api.param('per_page', 'Number of notes per page')
    def get(self):

        """ Get outstanding notes

        Returns a paginated collection of
        non-archived notes.
        """

        query_key = 'n'

        # Base Query
        query = f"""
                 MATCH ({query_key}: Note)
                 WHERE {query_key}.archived = False
                 ORDER BY {query_key}.createdAt
                 RETURN {query_key}
                 """

        # Parse query string for filters
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 5, type=int)

        # Get paginated Note collection
        data = Note.to_collection_dict(query,
                                       query_key,
                                       page,
                                       per_page,
                                       'api.notes_notes')

        return data

    @api.marshal_with(note_model)
    @api.response(201, 'Successfully created new note')
    @api.expect(note_content)
    def post(self):
        """ Create a new parent note

        Returns the newly created parent note.
        """

        # Parse request body for content
        data = request.get_json()
        content = data["content"]

        if content:
            note = Note(content=content)
            note.save()
            return note.to_dict()
        else:
            # TODO return error message
            pass


@note_ns.route('/<int:id>')
class NotesNote(Resource):

    """ Individual Notes
    """

    @api.marshal_with(note_model)
    @api.response(200, 'Successfully read note')
    def get(self, id):

        """ Get a single note

        Allows the user to get a single note from
        the database according to the id.
        """

        query_key = 'n'

        query = f"""
                 MATCH ({query_key}: Note)
                 WHERE {query_key}.id = {id}
                 RETURN {query_key}
                 """
        note = graph.evaluate(query)
        if note:
            return Note.to_dict(note)
        # else...

@note_ns.route('/<int:id>/parent')
class NoteParent(Resource):

    """ For finding parent Notes.
    """

    @api.marshal_with(note_model)
    @api.response(200, 'Successfully read note')
    def get(self, id):

        """ Get parent of note by id
        Get a parent note from the database
        according to the child's id"""

        # Find the note
        query_key = 'n'

        query = f"""
                 MATCH ({query_key}: Note)-[:PARENT_OF]->(child: Note)
                 WHERE {query_key}.id = {id}
                 RETURN {query_key}
                 """
        note = graph.evaluate(query)
        if note:
            return Note.to_dict(note)
        # else ...


@note_ns.route('/<int:id>/child')
class NoteChild(Resource):

    """ Finding Child Notes.
    """

    @api.marshal_with(note_model)
    @api.response(200, 'Successfully read note')
    def get(self, id):

        """ Get child of note by id

        Get a child note from the database
        according to the parent's id"""

        query_key = 'n'

        query = f"""
                 MATCH ({query_key}: Note)-[:CHILD_OF]->(parent: Note)
                 WHERE parent.id = {id}
                 RETURN {query_key}
                 """
        note = (graph.run(query, parameters={"id": id}).data()[0])

        if note:
            return note.to_dict()

        # TODO else

    @api.marshal_with(note_model)
    @api.response(201, 'Successfully created child note')
    @api.expect(note_content)
    def post(self, id):

        """ Create a child of note by id

        Create a child note of the note according
        to id and archive the parent note """

        # Build the query
        query = f"""MATCH (n: Note)
                    WHERE n.id = {id}
                    RETURN n"""

        parent = graph.run(query).data()[0]

        if parent:
            data = request.get_json()
            content = data.get("content")
            child = Note(content=content)
            parent.add_child(child)
            return child.to_dict()

        # TODO error handling

@note_ns.route('/tags/<tag>')
class NotesTagsTag(Resource):

    """ Query by tag.
    """

    @api.marshal_with(paginated_notes_model)
    @api.response(200, 'Successfully read notes')
    def get(self, tag):

        """ Get notes by tag

        Allows the use to get notes according to
        the tag."""

        # Base Query
        query = f"""MATCH (n: Note)<-[:TAGGED]-(t: Tag)
                    WHERE t.text = \'{tag}\' AND n.archived = False
                    RETURN n
                    ORDER BY n.createdAt
                    """

        # Pagination
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 5, type=int)

        # Return the collection
        Note.to_collection_dict(query, page, per_page, 'api.notes_notes')
        data = Note.to_collection_dict(query,
                                       page,
                                       per_page,
                                       'api.notes_notes')
        return data
