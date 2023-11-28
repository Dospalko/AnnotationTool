# Annotator Project Setup Guide

This document provides instructions for setting up the Annotator project on macOS and Windows. The Annotator project consists of a Python Flask backend and a React frontend.

## Prerequisites

Before starting, ensure you have the following installed:
- Python (3.7 or later)
- Node.js (12.0 or later)
- Git
- PostgreSQL (optional, if using a local database)

## Cloning the Repository

1. Open a terminal (macOS) or command prompt (Windows).
2. Navigate to the desired directory where you want to clone the repository.
3. Run:

Replace `<repository_url>` with the URL of the Git repository.

## Setting Up the Backend

### macOS and Linux

1. Navigate to the backend directory:
2. Create a virtual environment:
3. Activate the virtual environment:
3. Activate the virtual environment:
If `requirements.txt` is not available, install the necessary packages using `pip install`.

### Windows

1. Navigate to the backend directory:
2. Create a virtual environment:
3. Activate the virtual environment:
4. Install the required Python packages:
If `requirements.txt` is not available, install the necessary packages using `pip install`.

### Database Setup

1. Ensure PostgreSQL is installed and running.
2. Create a new database for the project (e.g., `annotator`).
3. Update the `SQLALCHEMY_DATABASE_URI` in your Flask app configuration to reflect the new database credentials.

## Setting Up the Frontend

1. Navigate to the frontend directory:
2. Install the necessary Node.js packages:

## Running the Application

### Backend

1. Make sure the virtual environment is activated.
2. Run the Flask application:

### Frontend

1. Open a new terminal or command prompt.
2. Navigate to the frontend directory.
3. Start the React application:

Your Annotator project should now be running with the backend on `http://localhost:5000` and the frontend on `http://localhost:3000`.

## Additional Notes

- Ensure that any environment-specific variables (like database credentials) are set appropriately in your environment or configuration files.
- If you encounter any issues with package versions or dependencies, you might need to adjust the versions in `requirements.txt` (backend) or `package.json` (frontend) accordingly.
