from flask import request, url_for, Blueprint
from flask_restplus import Resource, Api
from ..models import Note, Tag
from flask_restplus import fields

blueprint = Blueprint('api', __name__)

api = Api(blueprint,
          title="Note App",
          version='1.0',
          description="API documentation for my graph notes app")


# Models
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

note_links = api.model('Note Links', {
        "currentNoteEndpoint": fields.String,
        "parentNoteEndpoint": fields.String,
        "childNoteEndpoint": fields.String,
})

note_model = api.model('Note Model', {
        'id': fields.Integer,
        'uid': fields.String,
        'content': fields.String,
        'createdAt': fields.DateTime,
        'archived': fields.Boolean,
        'tags': fields.List(fields.String),
        '_links': fields.Nested(note_links)
})

paginated_notes_model = api.model('Paginated Notes Model', {
        'data': fields.List(fields.Nested(note_model)),
        '_meta': fields.Nested(paginated_notes_meta),
        '_links': fields.Nested(paginated_notes_links)
})


# Routes
@note_ns.route('/')
class Notes(Resource):
    """ Main Note routes.
    """
    @api.marshal_with(paginated_notes_model)
    @api.response(200, 'Successfully read notes')
    @api.param('page', 'Number of the page to get')
    @api.param('per_page', 'Number of notes per page')
    @api.param('tag', "Get notes matching this tag")
    @api.param('start_date', "Date to match after eg. 1970-10-10")
    @api.param('end_date', "Date to match before eg. 1970-10-15")
    @api.param('search', "Get notes with content containing this string")
    def get(self):

        """ Get outstanding notes

        Begins with the base clause and adds additional query clauses.
        """

        # Query parameters
        params = {}

        # Base Query
        query = """
                MATCH (n: Note)
                """

        # Parse query parameters
        params['tag'] = request.args.get('tag')
        params['search'] = request.args.get("search")
        params['start_date'] = request.args.get("start_date")
        params['end_date'] = request.args.get('end_date')
        params['page'] = request.args.get('page', 1, type=int)
        params['per_page'] = request.args.get('per_page', 5, type=int)

        # Pagination variables
        params['skip'] = (params['page'] * params['per_page']) - params['per_page']
        params['limit'] = (params['per_page']) + 1

        if params['tag']:
            tag_clause = "-[:TAGGED]->(t: Tag)"
            query = "".join((query, tag_clause))

        # Add query clauses.
        archived_clause = "WHERE n.archived = False"
        query = " ".join((query, archived_clause))

        if params['tag']:
            tag_clause = "AND t.text = $tag"
            query = " ".join((query, tag_clause))
        if params['search']:
            search_clause = "AND toLower(n.content) CONTAINS toLower($search) "
            query = " ".join((query, search_clause))
        if params['start_date']:
            start_date_clause = "AND n.createdAt > $start_date"
            query = " ".join((query, start_date_clause))
        if params['end_date']:
            end_date_clause = "AND n.createdAt < $end_date"
            query = " ".join((query, end_date_clause))

        # Return clause with pagination
        return_clause = """
                        RETURN n
                        ORDER BY n.createdAt
                        """
        pagination_clause = "SKIP $skip LIMIT $limit"
        query = " ".join((query, return_clause, pagination_clause))

        # Get paginated Note collection
        data = Note.to_collection_dict(query,
                                       params,
                                       'api.notes_notes',
                                       search=params['search'],
                                       start_date=params['start_date'],
                                       end_date=params['end_date'],
                                       per_page=params['per_page'],
                                       tag=params['tag'])
        return data

    @api.marshal_with(note_model)
    @api.response(201, 'Successfully created new note')
    @api.expect(note_content)
    def post(self):
        """ Create a new parent note

        Returns the newly created parent note.
        """

        # Parse content
        data = request.get_json()
        content = data["content"]

        if content:
            note = Note(content=content)
            note.save_note()
            return note.to_dict()
        # TODO return error message


@note_ns.route('/<uid>')
class NotesNote(Resource):

    """ Individual Notes
    """

    @api.marshal_with(note_model)
    @api.response(200, 'Successfully read note')
    def get(self, uid):

        """ Get a single note

        Allows the user to get a single note from
        the database according to the id.
        """

        note = Note.nodes.get_or_none(uid=uid)
        if note:
            return note.to_dict()
        # else...


@note_ns.route('/<uid>/parent')
class NoteParent(Resource):

    """ For finding parent Notes.
    """

    @api.marshal_with(note_model)
    @api.response(200, 'Successfully read note')
    def get(self, uid):

        """ Get parent of note by id

        Get a parent note from the database
        according to the child's id"""

        child = Note.nodes.get_or_none(uid=uid)
        if child:
            parent = child.parent.get_or_none()
            if parent:
                return parent.to_dict()
            # else....
        # else ...


@note_ns.route('/<uid>/child')
class NoteChild(Resource):

    """ Finding Child Notes.
    """

    @api.marshal_with(note_model)
    @api.response(200, 'Successfully read note')
    def get(self, uid):

        """ Get child of note by id

        Get a child note from the database
        according to the parent's id"""
        
        parent = Note.nodes.get_or_none(uid=uid)
        if parent:
            child = parent.child.get_or_none()
            if child:
                return child.to_dict()
            # else....
        # else ...

    @api.marshal_with(note_model)
    @api.response(201, 'Successfully created child note')
    @api.expect(note_content)
    def post(self, uid):

        """ Create a child of note by id

        Create and return a child note of the note according
        to id and archive the parent note """

        parent = Note.nodes.get_or_none(uid=uid)
        if parent:
            # Parse content
            data = request.get_json()
            content = data.get("content")
            # Create child
            child = Note(content=content)
            child.save()
            # Connect parent and child
            parent.child.connect(child)
            child.parent.connect(parent)  # TODO test this
            parent.archived = True
            parent.save()
            child.save()
            return child.to_dict()
        # else...


@note_ns.route("/<uid>/archive")
class NoteArchive(Resource):
    """
    Archive a note
    """
    @api.marshal_with(note_model)
    @api.response(200, 'Successfully archived note')
    def post(self, uid):
        """ Archive a note
        """
        note = Note.nodes.get_or_none(uid=uid)
        if note:
            note.archived = True
            note.save()
            return note.to_dict()
        # else...
