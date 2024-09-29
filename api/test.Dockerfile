FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set the working directory in the container
WORKDIR /app

# Install dependencies
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt\
    && pip install --no-cache-dir debugpy pytest  # Add pytest for testing

# Copy the current directory contents into the container at /app
COPY . /app/

# Expose the Flask port (if needed for API testing)
EXPOSE 5000
EXPOSE 5678

# Run tests
CMD ["pytest", "--disable-warnings", "-v"]  # Run pytest by default in the test environment
