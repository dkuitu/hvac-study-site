import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Flashcards.css';

const Flashcards = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchFlashcards = async () => {
      try {
        const response = await axios.get('/api/flashcards');
        setCategories(response.data.categories);
        setLoading(false);
      } catch (err) {
        setError('Failed to load flashcards');
        setLoading(false);
      }
    };
    
    fetchFlashcards();
  }, []);
  
  if (loading) return <div>Loading flashcards...</div>;
  if (error) return <div>{error}</div>;
  
  return (
    <div className="flashcards-container">
      <h1>HVAC Flashcards</h1>
      
      {categories.length === 0 ? (
        <p>No flashcards available yet. Check back soon!</p>
      ) : (
        <div className="categories-list">
          {categories.map(category => (
            <div key={category.id} className="category-item">
              <h2>{category.name}</h2>
              <p>{category.description}</p>
              
              <div className="chapters-list">
                {category.chapters.map(chapter => (
                  <div key={chapter.id} className="chapter-item">
                    <h3>{chapter.name}</h3>
                    
                    <div className="decks-list">
                      {chapter.decks.map(deck => (
                        <div key={deck.id} className="deck-item">
                          <h4>{deck.name}</h4>
                          <p>Difficulty: {deck.difficulty}</p>
                          <p>{deck.cards.length} cards</p>
                          <button>Study Now</button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Flashcards;
