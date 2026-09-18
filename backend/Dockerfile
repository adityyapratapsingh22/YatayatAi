FROM python:3.12-slim

WORKDIR /app

# Install system dependencies required by OpenCV and compiling C extensions
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0 \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Copy dependency definition
COPY requirements.txt .

# Install CPU-optimized PyTorch first (keeps image small and fast to build)
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir torch torchvision --index-url https://download.pytorch.org/whl/cpu && \
    pip install --no-cache-dir -r requirements.txt

# Copy backend application source
COPY . .

# Expose FastAPI default port
EXPOSE 8000

# Start Uvicorn bound to all interfaces
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
