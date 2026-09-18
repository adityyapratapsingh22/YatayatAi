from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

from app.core.config import settings

DATABASE_URL = settings.DATABASE_URL

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

