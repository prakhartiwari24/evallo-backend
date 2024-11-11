
Robust Logging: Logging is handled with Winston and Morgan for debugging and monitoring. Technologies Used Node.js: JavaScript runtime for building server-side applications.
Express.js: Fast and minimalist web framework for Node.js. 
MongoDB: NoSQL database for storing user and admin information. JWT: JSON Web Token for user authentication. Morgan: HTTP request logger middleware for Node.js. 
Winston: Logger for handling application logs. TypeScript: Strongly typed JavaScript for improved development experience. Prerequisites Before setting up the project, ensure you have the following installed:
Google APIs

Node.js (v14 or higher): Install Node.js MongoDB: A running instance of MongoDB (locally or through a service like MongoDB Atlas). Docker (optional)

Clone the Repository: Install Dependencies: npm install Environment Variables: Create a .env file in the root of the project and provide the following variables 
MONGODB_STRING= 
JWT_KEY= 
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=

Start the Application: npm start

Run in Docker: docker build -t evallo-backend-app . docker run -p 5002:5002 evallo-backend-app

Usage Once the project is running, you can access the following endpoints:

endpoint: http://localhost:5002
login to google:http://localhost:5002/api/auth/google


POST /api/create/events: Create a new event in user calendar. 
GET /api/get/events: Get all events from user's calendar. 
PUT /api/update/events/:id: Update an event based on id  
DELETE /api/delete/events/:id : delete an event based on id



