from flask_restplus import Api
from flask import Blueprint
from flask_restplus import fields

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
