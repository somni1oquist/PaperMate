FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set the working directory in the container
WORKDIR /app

# Install dependencies
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt\
    && pip install --no-cache-dir debugpy

# Copy the current directory contents into the container at /app
COPY . /app/

# Expose the Flask ports
EXPOSE 5000
EXPOSE 5678

# Run the application with debugger
CMD ["python", "-m", "debugpy", "--listen", "0.0.0.0:5678", "-m", "flask", "run", "--host=0.0.0.0", "--port=5000"]