from flask import Flask
from neomodel import config


def create_app():
    """Application Factory"""

    app = Flask(__name__)
    app.config.from_object('config.Config')

    with app.app_context():
        from . import views
        from app.api.api_routes import blueprint as api
        app.register_blueprint(api, url_prefix='/api/1')
        return app
