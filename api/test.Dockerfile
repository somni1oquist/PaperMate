FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set the working directory in the container
WORKDIR /app

# Install dependencies
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Install additional dev dependencies (pytest, flake8)
RUN pip install pytest flake8

# Copy the current directory contents into the container at /app
COPY . /app/

# Expose the Flask port (if needed for API testing)
EXPOSE 5000
EXPOSE 5678

# Run flake8 linting check with extended ignore for E501 (line length)
RUN flake8 --extend-ignore=E501 /app

# Run tests
CMD ["pytest", "--disable-warnings", "-v"]
