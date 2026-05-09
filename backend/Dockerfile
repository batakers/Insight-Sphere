# Gunakan image Python ringan sebagai base image (Production Ready)
FROM python:3.10-slim

# Mencegah Python membuat file `.pyc`
ENV PYTHONDONTWRITEBYTECODE=1

# Log / stream standar output Python tidak di-*buffer*, langsung di-output
ENV PYTHONUNBUFFERED=1

# Set the working directory directly in the container
WORKDIR /app

# Salin dependencies list
COPY requirements.txt .

# Instal dependensi backend (Pastikan pydantic-settings sudah ditambahkan di file tersebut)
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt \
    && pip install --no-cache-dir pydantic-settings psycopg2-binary

# Salin seluruh struktur aplikasi *backend*
COPY . .

# Expose port yang digunakan FastAPI
EXPOSE 8000

# Jalankan server
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]