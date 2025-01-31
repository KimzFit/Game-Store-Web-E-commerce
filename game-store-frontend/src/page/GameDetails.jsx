import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaArrowLeft } from "react-icons/fa";
import { FaHeart } from "react-icons/fa";
import "../style/GameDetail.css";

function GameDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [gameDetails, setGameDetails] = useState(null);
  const [auth, setAuth] = useState(false);
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [userData, setUserData] = useState({
    full_name: "",
    address: "",
    phone_number: "",
    profile_picture: "",
    email: "",
    username: "",
  });
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState("");
  const [rating, setRating] = useState(0);

  // Fetch user data based on email
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await axios.get(`http://localhost:8081/getUserByEmail/${email}`);
        if (res.data.Status === "Success") {
          setUserData(res.data.user);
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
      }
    };
    fetchUserData();
  }, [email]);

  // Check authentication status
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const res = await axios.get("http://localhost:8081/");
        if (res.data.Status === "Success") {
          setAuth(true);
          setEmail(res.data.email);
        } else {
          setAuth(false);
          setMessage(res.data.Error);
        }
      } catch (err) {
        console.log("Error checking authentication status:", err);
      }
    };
    checkAuthStatus();
  }, []);

  // Handle logout
  const handleLogout = async () => {
    try {
      await axios.get("http://localhost:8081/logout");
      navigate('/');
    } catch (err) {
      console.log("Error logging out:", err);
    }
  };

  // Fetch game details and reviews
  useEffect(() => {
    const fetchGameDetailsAndReviews = async () => {
      try {
        const gameResponse = await axios.get(`http://localhost:8081/api/games/${id}`);
        setGameDetails(gameResponse.data);

        const reviewResponse = await axios.get(`http://localhost:8081/api/reviews/${id}`);
        setReviews(reviewResponse.data.reviews);
      } catch (error) {
        console.error("Error fetching game details or reviews:", error);
      }
    };
    fetchGameDetailsAndReviews();
  }, [id]);

  // Handle review submission
  const handleReviewSubmit = async () => {
    try {
      await axios.post("http://localhost:8081/api/reviews", {
        user_id: userData.user_id,
        game_id: id,
        rating,
        review: newReview,
      });
      setNewReview("");
      setRating(0);

      const reviewResponse = await axios.get(`http://localhost:8081/api/reviews/${id}`);
      setReviews(reviewResponse.data.reviews);
    } catch (error) {
      console.error("Error submitting review:", error);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (!gameDetails) return <p>Loading...</p>;

  return (
    <div className="gamedetail-container">
      <div className="Navigation-bar">
        <div className="Logo">
          <h2>
            <i className="fa-solid fa-gamepad" style={{ fontSize: "14px" }}></i>{" "}
            <Link
              to="/"
              style={{
                textDecoration: "none",
                color: "white",
                marginLeft: "5px",
              }}
            >
              GameStore
            </Link>
          </h2>
        </div>
        <div className="Search-con" style={{ fontSize: ".875rem" }}>
          <input type="search" placeholder="Search games..." />
          <i className="fa-solid fa-magnifying-glass"></i>
        </div>
        <div className="d-flex right-nav">
          <div className="text-white profile-picture">
            <img src={userData.profile_picture} alt="" />
          </div>

          <div
            className="dropdown"
            style={{ marginLeft: "30px", marginRight: "20px" }}
          >
            <button
              className="btn btn-secondary dropdown-toggle"
              type="button"
              id="dropdownMenuButton1"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              {userData.username}
            </button>
            <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton1">
              <li>
                <Link
                  to={`/editprofile?email=${email}`}
                  className="dropdown-item"
                >
                  Account setting
                </Link>
              </li>
              <li>
                <Link to={`/transaction/${userData.user_id}`} className="dropdown-item">
                  Transaction
                </Link>
              </li>
              <li>
                <Link onClick={handleLogout} className="dropdown-item">
                  Logout
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
      {/* Your existing navigation bar code here */}
      <div className="heading-gamedetail">
        <div>
          <Link to="/gameshop" className="arrow-to-home">
            <FaArrowLeft /> Store
          </Link>
        </div>
        <h1 style={{ fontSize: "3.75rem", color: "white" }}>{gameDetails.title}</h1>
      </div>

      <div className="gamedetails-block">
        <div className="game-details" style={{ color: "white" }}>
          <img src={gameDetails.cover_image} alt={gameDetails.title} />
        </div>
        <div className="block-item">
          <div className="game-block-1">
            <h2 style={{fontWeight : 'bolder'}}>ABOUT</h2>
            <p>{gameDetails.description}</p>
            <div style={{marginTop : '20px'}}>
            <p style={{fontSize : '15px' ,color : '#ccc'}}>Genre: {gameDetails.genre}</p>
            <p style={{fontSize : '15px' ,color : '#ccc'}}>Platform: {gameDetails.platform}</p>
            <p style={{fontSize : '15px' ,color : '#ccc'}}>release Date: {new Date(gameDetails.release_date).toLocaleDateString()}</p>
            <p style={{fontSize : '15px' ,color : '#ccc'}}>Developer: {gameDetails.developer}</p>
            <p style={{fontSize : '15px' ,color : '#ccc'}}>Pubisher: {gameDetails.publisher}</p>
            </div>
          </div>
          <div className="game-block-2">
            <div>
            <p style={{ margin: "0px", color: "white", fontWeight: "bold", fontSize: "1.25rem" }}>฿{gameDetails.price}</p>          
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="reviews-section">
        <h2>Reviews</h2>
        <ul className="reaview-user">
          {reviews.map((review, index) => (
            <li key={index}>
              <p><strong>{review.username}</strong> {formatDate(review.review_date)}:</p>
              <p>Rating: {review.rating} / 5</p>
              <p>{review.review}</p>
            </li>
          ))}
        </ul>

        {/* Submit a New Review */}
        <h3>Add Your Review</h3>
        <textarea
          value={newReview}
          onChange={(e) => setNewReview(e.target.value)}
          placeholder="Write your review..."
        />
        <input
          type="number"
          value={rating}
          onChange={(e) => setRating(e.target.value)}
          min="1"
          max="5"
          placeholder="Rating (1-5)"
        />
        <button onClick={handleReviewSubmit} className="review-btn">Submit Review</button>
      </div>
    </div>
  );
}

export default GameDetails;
