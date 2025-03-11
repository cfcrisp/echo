# Echo - Customer Request Tracking Software

## Overview
Echo is a customer request tracking software designed to make it easy to manage and prioritize customer requests. Built with a modern React frontend and an Express backend, Echo provides a user-friendly interface to track, filter, and prioritize requests, complete with dashboards and analytics.

## Features
- **Request Management**: Add, edit, and track customer feature requests.
- **Prioritization**: Assign priorities (Low, Medium, High, Critical) and effort estimates.
- **Status Tracking**: Monitor request statuses (Not Started, In Progress, In Review, Blocked, Completed).
- **Customer Association**: Link requests to customers with multiple tiers and stages.
- **Analytics Dashboard**: Visualize request statuses and priorities with charts.
- **User Authentication**: Secure login and registration with JWT-based authentication.
- **Responsive Design**: Collapsible sidebar and mobile-friendly interface.

## Prerequisites
- Node.js (v14.x or later)
- PostgreSQL (v12.x or later)
- npm or yarn
- Docker (optional, for containerized deployment)

### 1\. Set Up the Backend

-   `cd server`
-   `npm install`
-   Create a .env file in the server directory with the following variables:
    - `DB_USER=admin`
    - `DB_HOST=localhost` 
    - `DB_NAME=echo_db`
    - `DB_PASSWORD=your_admin_password`
    - `DB_PORT=5434`
    - `JWT_SECRET=your-secure-secret-key`
    - `PORT=5002`

#### Set up the PostgreSQL database with Docker:
-   **Build the image:** `docker build -t echo_db .`
-   **Run the container:** `docker run --name echo_db -e POSTGRES_PASSWORD=<password> -p 5434:5432 -d echo_db`
-   **Validate running container:** `docker ps`
-   **Connect to the database:** `psql -h localhost -p 5434 -U admin -d echo_db`
-   **Stop the container:** `docker stop echo_db`
-   **Remove the container:** `docker rm echo_db`
Others:
-   **Persist data:** Mount a volume using `-v pgdata:/var/lib/postgresql/data/pgdata`
-   **Check logs for troubleshooting:** `docker logs echo_db`
-   **Open a Bash session inside the container:** `docker exec -ti <container_id> bash`
-   **Access the database from Bash:** `psql -U admin -d echo_db`


### 2\. Set Up the Frontend

-   `cd ../client`
-   `npm install`

-   Optionally, create a .env file for client-side environment variables (e.g., API URL):
    `REACT_APP_API_URL=http://localhost:5002/api`

### 3\. Run the Application

-   `cd ../server npm start`
-   `cd ../client npm start`


-   Open your browser at http://localhost:3000 to view the app.
