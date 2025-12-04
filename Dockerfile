# Use the official Python 3.10 slim image which matches your project environment
FROM python:3.10-slim-bullseye

# Set environment variables
ENV PYTHONUNBUFFERED 1
ENV POETRY_HOME="/opt/poetry"
ENV PATH="$POETRY_HOME/bin:$PATH"

# Install Poetry and necessary system dependencies for OpenCV and development tools
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        curl \
        build-essential \
        libgl1-mesa-glx \
        libgtk2.0-dev \
    && curl -sSL https://install.python-poetry.org | python - \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory inside the container
WORKDIR /app

# Copy the core dependency files first (for efficient caching)
COPY . .

# Copy the entire monorepo structure (apps and libs)
COPY apps apps/
COPY libs libs/

# Install dependencies. This command handles both external packages (opencv, numpy)
# and the local path dependency (cv-utils).
# We run it in non-interactive mode.
RUN poetry install --project apps/cv-app --no-root --no-interaction

# Expose the display (important for running OpenCV with GUI, though requires host setup)
# Note: For production use without a GUI, remove cv.imshow from main.py
# EXPOSE 5900 

# Command to run the application using the poetry run context
# The path is relative to the WORKDIR /app
CMD ["poetry", "run", "python", "apps/cv-app/main.py"]