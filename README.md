# ActiviTracker (Backend)

## Description

This project is a web application that uses JWT for authentication and connects to a MongoDB database. 
It is designed to track users' time, and serves all information as a rest API.

## Installation

To get a development environment running, clone the repository and install the dependencies.

```bash
npm install
```
## Usage

### Setting up:

The project uses environment variables for configuration. 
These are loaded from a .env file at the root of the project. Here's an example .env file:

```bash
JWT_KEY=<your_jwt_key>
PORT=<your_port>
MONGO_USER=<your_mongo_username>
MONGO_PASS=<your_mongo_password>
```

Replace <> with your actual data.

### Scripts

Start for **dev** env.
```bash
npm run dev
```

Start for **production** env.
```bash
npm start
```

## Contributing

Contributions are welcome. Please fork the repository and create a pull request with your changes.
