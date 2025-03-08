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

-   Navigate to the server directory:

    bash

    CollapseWrapCopy

    `cd server`

-   Install dependencies:

    bash

    CollapseWrapCopy

    `npm install`

-   Create a .env file in the server directory with the following variables:

    text

    CollapseWrapCopy

    `DB_USER=admin DB_HOST=localhost DB_NAME=echo_db DB_PASSWORD=your_admin_password DB_PORT=5432 JWT_SECRET=your-secure-secret-key PORT=5002`

-   Set up the PostgreSQL database:
    -   Ensure PostgreSQL is running.
    -   Run the SQL script in server/scripts/database-setup.sql to create the database and tables:

        bash

        CollapseWrapCopy

        `psql -U admin -d postgres < server/scripts/database-setup.sql`

    -   Verify the admin role and database connection.

### 2\. Set Up the Frontend

-   Navigate to the client directory:

    bash

    CollapseWrapCopy

    `cd ../client`

-   Install dependencies:

    bash

    CollapseWrapCopy

    `npm install`

-   Optionally, create a .env file for client-side environment variables (e.g., API URL):

    text

    CollapseWrapCopy

    `REACT_APP_API_URL=http://localhost:5002/api`

### 3\. Run the Application

-   Start the backend server:

    bash

    CollapseWrapCopy

    `cd ../server npm start`

-   Start the frontend development server:

    bash

    CollapseWrapCopy

    `cd ../client npm start`

-   Open your browser at http://localhost:3000 to view the app.