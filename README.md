# HVAC Pro Study

A comprehensive web application providing training resources for HVAC technicians and apprentices. The site includes interactive flashcards, quizzes, and interactive demos for hands-on learning.

## Features

- **Flashcards**: Study categorized flashcards covering HVAC terminology, components, and concepts
- **Quizzes**: Test your knowledge with comprehensive quizzes on HVAC systems
- **Interactive Demos**: Practice with simulations of refrigeration diagnostics, electrical troubleshooting, and more
- **Responsive Design**: Works on desktop and mobile devices
- **Admin Panel**: Content management interface for adding and modifying educational content

## Technology Stack

- **Backend**: Flask (Python)
- **Frontend**: HTML, CSS, JavaScript, Bootstrap 5
- **Database**: SQLite (for development)

## Local Development

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/hvac-study-site.git
   cd hvac-study-site
   ```

2. Create a virtual environment and install dependencies:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. Run the application:
   ```
   flask run
   ```

4. Open your browser and navigate to `http://localhost:5000`

## Deployment

The site is configured to be deployed on a Digital Ocean droplet:

1. Set up a new server using the setup script:
   ```
   chmod +x setup_server.sh
   ./setup_server.sh
   ```

2. For future updates, use the deployment script:
   ```
   ./deploy.sh
   ```

## Project Structure

- `/app`: Main application package
  - `/api`: API routes for delivering content
  - `/admin`: Admin panel routes and views
  - `/models`: Data models and content management functions
  - `/static`: Static assets (CSS, JS, data files)
  - `/templates`: HTML templates
    - `/admin`: Admin panel templates
    - `/main`: Main site templates

## Client-Side (React)

The client-side React application is in development and will connect to the Flask backend API. See the `/client` directory for details.

## Adding Content

### Flashcards
1. Log in to the admin panel at `/admin`
2. Navigate to the Flashcards section
3. Fill out the form to add new flashcards

### Quizzes
1. Log in to the admin panel
2. Navigate to the Quizzes section
3. Create a new quiz with multiple-choice, true/false, or short answer questions

### Interactive Demos
1. Log in to the admin panel
2. Navigate to the Demos section
3. Create a new demo with HTML and JavaScript content

## License

This project is licensed under the MIT License - see the LICENSE file for details.
