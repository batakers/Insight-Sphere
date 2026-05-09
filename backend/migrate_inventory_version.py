"""
Migration Script — Add 'version' column to inventory table.
InsightSphere POS Hardening Phase.
"""
from sqlalchemy import create_engine, text
import os

# Database URL from environment or fallback to default
DATABASE_URL = "postgresql://postgres:postgres@localhost/insightsphere"

def migrate():
    engine = create_engine(DATABASE_URL)
    
    with engine.connect() as conn:
        print("Checking inventory table for version column...")
        
        # 1. Add version column if not exists
        conn.execute(text("""
            ALTER TABLE inventory 
            ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1;
        """))
        
        # 2. Ensure all existing rows have version = 1
        conn.execute(text("""
            UPDATE inventory SET version = 1 WHERE version IS NULL;
        """))
        
        conn.commit()
        print("Migration successful: 'version' column added and initialized.")

if __name__ == "__main__":
    try:
        migrate()
    except Exception as e:
        print(f"Migration failed: {e}")
        print("Please ensure your database is running and the connection string is correct.")
