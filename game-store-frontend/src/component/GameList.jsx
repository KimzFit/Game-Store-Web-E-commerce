import React, { useEffect, useState } from 'react';
import axios from 'axios';

const GameList = () => {
    const [games, setGames] = useState([]);

    useEffect(() => {
        const fetchGames = async () => {
            try {
                const response = await axios.get('http://localhost:8081/api/games');
                setGames(response.data);
            } catch (error) {
                console.error("Error fetching games data:", error);
            }
        };

        fetchGames();
    }, []);

    return (
        <div>
            <div className="game-list">
                {games.map(game => (
                    <div key={game.game_id} className="game-card">
                        <img src={game.cover_image} alt={game.title} height={200} width={200} />
                        <h2>{game.title}</h2>
                        <p>{game.genre}</p>
                        <p>Price: ${game.price}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GameList;
