# Use Python 3.10
FROM python:3.10-slim

# Set working directory
WORKDIR /app

# Copy requirements
COPY requirements.txt .

# Install dependencies
RUN pip install flask scikit-learn pandas numpy flask-cors

# Copy all files
COPY . .

# Expose port
EXPOSE 5001

# Start the Flask app
CMD ["python", "app.py"]