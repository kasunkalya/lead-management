# Lead Management API

This project is a Lead Management API built using Node.js, Express, Sequelize (MySQL), and JWT authentication. It provides endpoints for creating, assigning, progressing, cancelling, and retrieving leads.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Testing](#testing)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Contribution](#contribution)
- [License](#license)

## Prerequisites

- **Node.js** (v12 or higher)
- **npm**
- **MySQL Server**

## Installation

1. **Clone the repository**

   git clone https://github.com/kasunkalya/lead-management.git
   cd lead-management

2. **Install dependencies**
    npm install
    
## Configuration

1. **Environment Variables**

    Update .env file in the project root and add the following configuration:

    PORT=3000
    DB_URL=mysql://username:password@localhost:3306/lead_management
    JWT_SECRET=your_jwt_secret

    Replace username, password, and lead_management with your MySQL credentials and database name. Set a secure value for JWT_SECRET.

2. **Database Setup**

    Ensure your MySQL server is running and create the database:

    mysql -u root -p
    CREATE DATABASE lead_management;
    exit;

## Running the Application

    Start the server with:
    npm start

    The server will be available at http://localhost:3000.

## Testing

    To run the test suite, execute:
    npm test

    This command runs tests using Mocha, Chai, and SuperTest. Ensure your test configuration in package.json is set as follows:

    "scripts": {
    "test": "mocha"
    }

## Project Structure

    lead-management/
    ├── config/
    │   └── logger.js          # Logger configuration (e.g., Winston)
    ├── controllers/
    │   └── leadController.js  # API controller functions for leads
    │   └── userController.js  # API controller functions for user
    ├── middleware/
    │   └── auth.js            # JWT authentication middleware
    ├── models/
    │   └── Lead.js            # Sequelize model for Lead
    │   └── User.js            # Sequelize model for User
    ├── routes/
    │   └── leadRoutes.js      # Express routes for lead endpoints
    │   └── userRoutes.js      # Express routes for User endpoints
    ├── tests/
    │   └── leadController.test.js  # API tests using Mocha, Chai, and SuperTest
    ├── .env                   # Environment configuration
    ├── package.json
    └── README.md

## API Documentation

    Import the provided Postman collection (exported as a JSON file) to view detailed API documentation and example requests for all endpoints.
