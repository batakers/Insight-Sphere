from database import engine
from sqlalchemy import text

with engine.connect() as conn:
    try:
        # Create products table if it doesn't exist
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS products (
                id UUID PRIMARY KEY,
                name VARCHAR NOT NULL
            );
        """))
        # Insert the mock product
        conn.execute(text("""
            INSERT INTO products (id, name, default_price) VALUES ('123e4567-e89b-12d3-a456-426614174000', 'MOCK PRODUCT', 25.50)
            ON CONFLICT DO NOTHING;
        """))
        conn.commit()
        print("Mock product inserted.")
    except Exception as e:
        print(f"Error: {e}")
