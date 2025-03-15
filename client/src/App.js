import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// Import components
import Flashcards from './components/Flashcards/Flashcards';
import Quizzes from './components/Quizzes/Quizzes';
import Demos from './components/Demos/Demos';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/flashcards" element={<Flashcards />} />
          <Route path="/quizzes" element={<Quizzes />} />
          <Route path="/demos" element={<Demos />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
