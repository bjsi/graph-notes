from flask_restplus import Resource, Api
from flask import Blueprint, request
from flask_restplus import fields
from app import graph
from .models import Note, Tag

blueprint = Blueprint('api', __name__)

api = Api(blueprint,
          title="Note App",
          version='1.0',
          description="API documentation for my graph notes app")

note_ns = api.namespace('notes',
                        description="Operations for retrieving "
                                    "Notes, Child Notes and Parent Notes.")

note_content = api.model('Note Content', {
        "content": fields.String
        })

paginated_notes_meta = api.model('Paginated Notes Meta', {
        "currentPage": fields.Integer,
        "itemsPerPage": fields.Integer,
})

paginated_notes_links = api.model('Paginated Notes Links', {
        "currentPageEndpoint": fields.String,
        "nextPageEndpoint": fields.String,
        "prevPageEndpoint": fields.String
})

note_model = api.model('Note Model', {
        'id': fields.String,
        'content': fields.String,
        'createdAt': fields.DateTime,
        'archived': fields.Boolean,
        'tags': fields.List(fields.String),
})

paginated_notes_model = api.model('Paginated Notes Model', {
        'data': fields.List(fields.Nested(note_model)),
        '_meta': fields.Nested(paginated_notes_meta),
        '_links': fields.Nested(paginated_notes_links)
})


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

        # Base Query

        query = (Note
                 .match(graph)
                 .where("_.archived = False")
                 .order_by("_.createdAt"))

        # Parse query string for filters
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 5, type=int)

        Note.to_collection_dict(query, page, per_page, 'api.notes_notes')

        data = Note.to_collection_dict(query,
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

        # Find the note
        note = (Note
                .match(graph)
                .where(f"_.id = {id}")
                .first())
        if note:
            return note.to_dict()

        # error no note.

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
        note = (graph
                .run("""
                     MATCH (child: Note id: $id)-[:CHILD_OF]->(parent: Note)
                     RETURN parent
                     """, parameters={"id": id}).data()[0])
        if note:
            return note.parent.to_dict()
        # else error no parent note found


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
        
        note = (graph
                .run("""
                     MATCH (parent: Note id: $id)-[:PARENT_OF]->(child: Note)
                     RETURN child
                     """, parameters={"id": id}).data()[0])
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
                    WHERE t.text = {tag} AND n.archived = False
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
