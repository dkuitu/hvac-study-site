import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Quizzes.css';

const Quizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const response = await axios.get('/api/quizzes');
        setQuizzes(response.data.quizzes);
        setLoading(false);
      } catch (err) {
        setError('Failed to load quizzes');
        setLoading(false);
      }
    };
    
    fetchQuizzes();
  }, []);
  
  if (loading) return <div>Loading quizzes...</div>;
  if (error) return <div>{error}</div>;
  
  return (
    <div className="quizzes-container">
      <h1>HVAC Practice Tests</h1>
      
      {quizzes.length === 0 ? (
        <p>No quizzes available yet. Check back soon!</p>
      ) : (
        <div className="quizzes-list">
          {quizzes.map(quiz => (
            <div key={quiz.id} className="quiz-item">
              <h2>{quiz.title}</h2>
              <p>{quiz.description}</p>
              <div className="quiz-details">
                <span>Difficulty: {quiz.difficulty}</span>
                <span>{quiz.questions.length} questions</span>
                <span>{quiz.time_limit_minutes > 0 ? `${quiz.time_limit_minutes} min time limit` : 'No time limit'}</span>
              </div>
              <button>Start Quiz</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Quizzes;
