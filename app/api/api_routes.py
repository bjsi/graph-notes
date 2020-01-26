from flask import request, url_for, Blueprint
from flask_restplus import Resource, Api
from app import graph
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
        'id': fields.String,
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
    def get(self):

        """ Get outstanding notes

        Returns a paginated collection of
        non-archived notes.
        """

        query_key = 'n'

        # Base Query
        query_base = f"""
                      MATCH ({query_key}: Note)
                      WHERE {query_key}.archived = False
                      """

        # Find search terms
        search = request.args.get("search")
        if search:
            query_base += " " + f"AND {query_key}.content CONTAINS \'{search}\'"

        query_tail = f"""
                      RETURN {query_key}
                      ORDER BY {query_key}.createdAt
                      """
        
        # Complete the query
        query = query_base + " " + query_tail

        # Parse query string for filters
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 5, type=int)

        # Get paginated Note collection
        data = Note.to_collection_dict(query,
                                       query_key,
                                       page,
                                       per_page,
                                       'api.notes_notes',
                                       search=search)

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
            # TODO fix the whole ogm mess.
            return {
                "id": note.id,
                "archived": note.archived,
                "createdAt": note.createdAt,
                "content": note.content,
                "tags": Note.get_tags(note.id),
                "_links": {
                    "currentNoteEndpoint": url_for("api.notes_notes_note",
                                                   id=note.id),
                    "parentNoteEndpoint": url_for("api.notes_notes_note",
                                                  id=note.id) if Note.has_parent(note.id) else "",
                    "childNoteEndpoint": url_for("api.notes_notes_note",
                                                 id=note.id) if Note.has_child(note.id) else ""
                }
            }
        else:
            # TODO return error message
            pass


@note_ns.route('/<id>')
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
                 WHERE {query_key}.id = \'{id}\'
                 RETURN {query_key}
                 """
        note = graph.evaluate(query)
        if note:
            return Note.to_dict(note)
        # else...

@note_ns.route('/<id>/parent')
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
                 WHERE {query_key}.id = \'{id}\'
                 RETURN {query_key}
                 """
        note = graph.evaluate(query)
        if note:
            return Note.to_dict(note)
        # else ...


@note_ns.route('/<id>/child')
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
                 WHERE parent.id = \'{id}\'
                 RETURN {query_key}
                 """
        note = graph.evaluate(query)

        if note:
            return Note.to_dict(note)

        # TODO else

    @api.marshal_with(note_model)
    @api.response(201, 'Successfully created child note')
    @api.expect(note_content)
    def post(self, id):

        """ Create a child of note by id

        Create a child note of the note according
        to id and archive the parent note """

        # Build the query
        parent = list(Note.match(graph).where(f"_.id = \'{id}\'"))[0]

        if parent:
            data = request.get_json()
            content = data.get("content")
            child = Note(content=content)
            parent.add_child(child)
            return {
                "id": child.id,
                "archived": child.archived,
                "createdAt": child.createdAt,
                "content": child.content,
                "tags": Note.get_tags(child.id),
                "_links": {
                    "currentNoteEndpoint": url_for("api.notes_notes_note",
                                                   id=child.id),
                    "parentNoteEndpoint": url_for("api.notes_notes_note",
                                                  id=child.id) if Note.has_parent(child.id) else "",
                    "childNoteEndpoint": url_for("api.notes_notes_note",
                                                 id=child.id) if Note.has_child(child.id) else ""
                }
            }
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

        query_key = 'n'

        # Base Query
        query = f"""MATCH ({query_key}: Note)<-[:TAGGED]-(t: Tag)
                    WHERE t.text = \'{tag}\' AND {query_key}.archived = False
                    RETURN {query_key}
                    ORDER BY {query_key}.createdAt
                    """

        # Pagination
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 5, type=int)

        # Return the collection
        data = Note.to_collection_dict(query,
                                       query_key,
                                       page,
                                       per_page,
                                       'api.notes_notes_tags_tag',
                                       tag=tag)
        return data


@note_ns.route("/<id>/archive")
class NoteArchive(Resource):
    """
    Archive a note
    """
    @api.marshal_with(note_model)
    @api.response(200, 'Successfully archived note')
    def post(self, id):
        """ Archive a note
        """

        query = f"""
                 MATCH (n: Note)
                 WHERE n.id = \'{id}\'
                 SET n.archived = True
                 RETURN n
                 """
        archived_note = graph.evaluate(query)
        return Note.to_dict(archived_note)
