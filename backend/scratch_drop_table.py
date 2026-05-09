from database import engine
from models import AIPredictionLog

try:
    AIPredictionLog.__table__.drop(engine, checkfirst=True)
    AIPredictionLog.__table__.create(engine, checkfirst=True)
    print("AIPredictionLog table dropped and recreated successfully with new schema.")
except Exception as e:
    print(f"Error: {e}")
