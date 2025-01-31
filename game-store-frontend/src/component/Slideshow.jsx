import { useState, useEffect } from 'react';
import axios from 'axios';
import '../style/Slideshow.css';  // Assuming this contains your custom styles




function Slideshow() {
  const [games, setGames] = useState([]);

  // Utility function to shuffle an array
  const shuffleArray = (array) => {
    return array.sort(() => Math.random() - 0.5);
  };

  // Fetch game data on component mount
  useEffect(() => {
    axios.get(`http://localhost:8081/api/games`)  // Replace with your actual API endpoint
      .then(response => {
        const shuffledGames = shuffleArray(response.data);  // Shuffle the game data
        setGames(shuffledGames);  // Store the shuffled game data in state
      })
      .catch(error => {
        console.error('Error fetching games:', error);
      });
  }, []);

  return (
    <div className="slideshow-container">
      {/* Carousel section */}
      <div className="carousel-wrapper">
        <div id="carouselExampleIndicators" className="carousel slide" data-bs-ride="carousel" data-bs-interval="5000">  {/* Set interval to 5000 ms */}
          <div className="carousel-indicators">
            {games.slice(0, 6).map((game, index) => ( // Limiting to 6 items
              <button
                key={index}
                type="button"
                data-bs-target="#carouselExampleIndicators"
                data-bs-slide-to={index}
                className={index === 0 ? 'active' : ''}
                aria-current={index === 0 ? 'true' : 'false'}
                aria-label={`Slide ${index + 1}`}
              ></button>
            ))}
          </div>

          <div className="carousel-inner">
            {games.slice(0, 6).map((game, index) => (  // Limiting to 6 items
              <div key={game.id} className={`carousel-item ${index === 0 ? 'active' : ''}`}>
                <img src={game.cover_image} className="d-block w-100" alt={game.name} />
                <div className="carousel-caption d-none d-md-block text-overlay">
                  <h5>{game.title}</h5>
                  <p>{game.description}</p>
                </div>
              </div>
            ))}
          </div>

          <button className="carousel-control-prev" type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide="prev">
            <span className="carousel-control-prev-icon" aria-hidden="true"></span>
            <span className="visually-hidden">Previous</span>
          </button>
          <button className="carousel-control-next" type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide="next">
            <span className="carousel-control-next-icon" aria-hidden="true"></span>
            <span className="visually-hidden">Next</span>
          </button>
        </div>
      </div>

      {/* Right block for game titles and images */}
      <div className="game-list-wrapper">
        <div className="game-list">
          {games.slice(0, 6).map((game, index) => (  // Limiting to 6 items
            <div key={index} className="game-item">
              <img src={game.cover_image} alt={game.title} className="game-thumbnail" />
              <h6>{game.title}</h6>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Slideshow;
