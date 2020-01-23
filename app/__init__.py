from flask import Flask
from py2neo import Graph
import os


graph = Graph(password=os.environ.get("NEO4J_PASSWORD"))


def create_uniqueness_constraint(label, property):
    query = f"CREATE CONSTRAINT ON (n:{label}) ASSERT n.{property} IS UNIQUE"
    graph.run(query)


def create_app():
    """Application Factory"""

    app = Flask(__name__)
    app.config.from_object('config.Config')

    with app.app_context():
        from . import views
        from app.api.api_models import blueprint as api
        app.register_blueprint(api, url_prefix='/api/1')
        # create_uniqueness_constraint("Note", "id")
        # create_uniqueness_constraint("Tag", "tag")
        return app
