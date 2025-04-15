# Slopify: A Modern Music Discovery Application

Slopify is a web application designed to help users discover new music. It features a React-based frontend and a Node.js/Express backend with MongoDB for data storage. The application is containerized using Docker for easy setup and deployment.

## Features

*   **Browse Music:** Browse a curated selection of songs, albums, and artists.
*   **Search Functionality:** Quickly find your favorite music using the search bar.
*   **User Authentication:** Create an account, save favorite songs, and create playlists.

## Technologies Used

*   **Frontend:**
    *   React: A JavaScript library for building user interfaces.
    *   Vite: A fast build tool and development server.
    *   Material UI: A React UI framework for creating a visually appealing and consistent design.
*   **Backend:**
    *   Node.js: A JavaScript runtime environment.
    *   Express: A web application framework for Node.js.
    *   MongoDB: A NoSQL database.
*   **Containerization:**
    *   Docker: A platform for building, shipping, and running applications in containers.
    *   Docker Compose: A tool for defining and managing multi-container Docker applications.

## Development Setup

Follow these steps to get the project running locally:

**1. Prerequisites:**

*   Docker: Install Docker and ensure it's running.
*   Node.js and npm: While Docker handles the final deployment environment, it's useful to have Node.js installed for running scripts and managing dependencies.

**2. Clone the Repository:**

```bash
git clone git@github.com:NathanAnto/slopify.git
cd slopify
```

**3. Start the Application with Docker Compose:**
```bash
docker-compose up --build
```
This command does the following:

- Builds the Docker images for the frontend and backend services.
- Starts the MongoDB, backend, and frontend containers.
- Sets up the necessary networking and volume mounts.

**4. Access the Application:**

*   **Frontend:** Open your web browser and navigate to `http://localhost:3000`. You should see the Slopify application. The `vite.config.js` file configures the frontend development server to listen on port 5173, but `docker-compose.yaml` maps it to port 3000 on your host machine.
*   **Backend:** The backend API is available at `http://localhost:4000`. You can test the basic API by visiting `http://localhost:4000/`, which should return "Hello World!" as defined in `slopify-server/index.js`.
*   **MongoDB:** MongoDB is running on `http://localhost:27017`. Use a MongoDB client (like MongoDB Compass) to connect and manage the database.

## Development Workflow

The project uses Docker volumes to allow you to make changes to the code on your host machine and have them reflected inside the containers without rebuilding.

*   **Frontend (`slopify/` directory):**
    *   Edit React components in `slopify/src/`. The `vite.config.js` file is configured with `usePolling: true` to ensure hot reloading works correctly within the Docker environment.
    *   Use `npm run lint` to check for code style issues.
*   **Backend (`slopify-server/` directory):**
    *   Modify the backend logic in `slopify-server/index.js` or create new API endpoints.
    *   `nodemon` automatically restarts the server when you save changes, so you don't need to manually restart the container.
*   **MongoDB:** Data is persisted in the `mongodb_data` volume defined in `docker-compose.yaml`.

## Configuration

*   **Environment Variables:** The backend service requires a `MONGODB_URI` environment variable to connect to the MongoDB database. This is set in the `docker-compose.yaml` file. Other environment variables can be added as needed.
*   **Ports:**
    *   Frontend: 3000 (host) -> 5173 (container)
    *   Backend: 4000 (host) -> 4000 (container)
    *   MongoDB: 27017 (host) -> 27017 (container)

## Common Issues and Troubleshooting

*   **File Permissions:** If you encounter file permission issues inside the containers, you may need to adjust the user ID mapping.
*   **Hot Reloading:** If hot reloading isn't working, ensure that the `usePolling: true` option is set in `vite.config.js`.
*   **Database Connection:** Verify that the `MONGODB_URI` environment variable is correctly set in `docker-compose.yaml`.
