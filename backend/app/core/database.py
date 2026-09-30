from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

from app.core.config import settings

DATABASE_URL = settings.DATABASE_URL

# SQLAlchemy 2.x with a plain `postgresql://` URL may try to load psycopg v3
# ('psycopg') instead of the psycopg2-binary we install.  Force it to use
# psycopg2 by normalising the scheme here, before the engine is created.
if DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg2://", 1)
elif DATABASE_URL.startswith("postgres://"):
    # Heroku / Supabase sometimes emit this legacy form
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+psycopg2://", 1)

# pool_pre_ping=True tests the connection before handing it out,
# which gracefully handles dropped or idle connections from Supabase pooler.
engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """FastAPI dependency: yields a DB session and always closes it afterward."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

