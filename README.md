# HVAC Study Website

A study resource for HVAC apprentices featuring flashcards, quizzes, and interactive demos.

## Features

- Flashcards organized by category, chapter, and difficulty
- Practice quizzes with scoring and timing
- Interactive demos for HVAC concepts
- Admin panel for content management

## Setup

1. Clone the repository
2. Create a virtual environment:
   ```
   python -m venv venv
   ```
3. Activate the virtual environment:
   - Windows: `venv\Scripts\activate`
   - macOS/Linux: `source venv/bin/activate`
4. Install dependencies:
   ```
   pip install -r requirements.txt
   ```
5. Set up environment variables (copy `.env.example` to `.env` and modify as needed)
6. Run the application:
   ```
   flask run
   ```

## Structure

- `/app`: Main application package
  - `/api`: API routes for delivering content
  - `/admin`: Admin panel routes and views
  - `/models`: Data models and content management functions
  - `/static`: Static assets (CSS, JS, data files)
  - `/templates# Continuation of README.md
cat >> README.md << 'EOF'
  - `/templates`: HTML templates
    - `/admin`: Admin panel templates
    - `/main`: Main site templates

## Client-Side (React)

The client-side React application will be built separately and connected to the Flask backend API. See the `/client` directory for details.

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
