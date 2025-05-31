# EduNotes Portal

EduNotes is a full-stack web application designed for teachers and students to create, share, and manage educational notes and classes easily.

## Features

- User authentication (Signup/Login)
- Role-based access control (Admin, Teacher, Student)
- Create, update, and delete classes
- Add, view, and manage notes within classes
- Upload supporting files and media
- Responsive UI with clean design
- Admin panel for managing users and content

## Tech Stack

- **Backend:** Node.js, Express.js
- **Frontend:** EJS (Embedded JavaScript templates), HTML, CSS, JavaScript
- **Database:** MongoDB (Mongoose ODM)
- **Others:** Middleware for authentication and role checking

## Installation

1. Clone the repository  
   ```bash
   git clone https://github.com/rounakkhanam06/EduNotes.git
2. Navigate to the project directory
cd EduNotes/classroom-app

4. Install dependencies
  npm install

5. Setup environment variables
Create a .env file with your MongoDB connection string and secret keys for example:  MONGODB_URI=your_mongodb_connection_string
SESSION_SECRET=your_secret_key

6. Start the server
  npm start
7.Open your browser and go to
http://localhost:8080

## Usage
Teachers can create classes and add notes and vedio lectures.
Students can view and download notes.
Admin users have access to manage users and overall portal settings.

