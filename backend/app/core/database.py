import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# The .db file lives in the top-level database/ folder, separate from backend code,
# matching the project structure where database/ is its own concern.
DB_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "..", "database")
os.makedirs(DB_DIR, exist_ok=True)
DB_PATH = os.path.join(DB_DIR, "traffic_analyzer.db")

DATABASE_URL = f"sqlite:///{DB_PATH}"

# check_same_thread=False is needed because FastAPI can use the connection across
# different async tasks/threads -- safe here since SQLite handles this fine for a
# single-writer mini-project setup.
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """FastAPI dependency: yields a DB session and always closes it afterward."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
