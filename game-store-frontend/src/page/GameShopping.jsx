import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import { GiAbdominalArmor } from "react-icons/gi";
import { FaChessPawn } from "react-icons/fa";
import { GiBarbute } from "react-icons/gi";
import { FaGun } from "react-icons/fa6";
import { GiBirchTrees } from "react-icons/gi";
import { FaPuzzlePiece } from "react-icons/fa6";
import { IoCarSport } from "react-icons/io5";
import { IoFootball } from "react-icons/io5";
import { FaStar } from "react-icons/fa";
import { AiFillLike } from "react-icons/ai";
import { FaCalendarAlt } from "react-icons/fa";
import { FaPlus } from "react-icons/fa";
import { FaHeart } from "react-icons/fa";
import { FaWindows } from "react-icons/fa6";
import { FaXbox } from "react-icons/fa";
import { FaPlaystation } from "react-icons/fa";
import { MdOutlineShoppingCart } from "react-icons/md";
import { FaCheck } from "react-icons/fa";
import { RxCross2 } from "react-icons/rx";
import { FaArrowRight } from "react-icons/fa";

import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "../style/GameStore.css";

function GameShopping() {
  const [games, setGames] = useState([]);
  const [auth, setAuth] = useState(false);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [userData, setUserData] = useState({
    full_name: "",
    address: "",
    phone_number: "",
    profile_picture: "",
    email: "",
    username: "",
  });
  const [selectedGenre, setSelectedGenre] = useState("");
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [addedToCart, setAddedToCart] = useState(new Set()); // Set to track added items
  const [totalprice, setTotalprice] = useState(0);
  const [wishlistedGames, setWishlistedGames] = useState(new Set());
  const [likebutton, setLikebutton] = useState({});

  // Fetch game data from API
  useEffect(() => {
    axios
      .get("http://localhost:8081/api/games")
      .then((response) => {
        setGames(response.data);
        console.log(response.data)
      })
      .catch((error) => {
        console.error("Error fetching games:", error);
      });
  }, []);

  useEffect(() => {
    // Fetch user data based on the email
    axios
      .get(`http://localhost:8081/getUserByEmail/${email}`)
      .then((res) => {
        if (res.data.Status === "Success") {
          setUserData(res.data.user);
        }
      })
      .catch((err) => console.error(err));
  }, [email]);

  axios.defaults.withCredentials = true;
  useEffect(() => {
    axios
      .get("http://localhost:8081/")
      .then((res) => {
        if (res.data.Status === "Success") {
          setAuth(true);
          setEmail(res.data.email);
        } else {
          setAuth(false);
        }
      })
      .catch((err) => console.log(err));
  }, []);

  const handleLogout = () => {
    axios
      .get("http://localhost:8081/logout")
      .then((res) => {
        navigate("/"); // Navigate to home after logout
      })
      .catch((err) => console.log(err));
  };

  const clearFilter = () => {
    setSelectedGenre("");
  };

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
  };

  const addToCart = async (game) => {
    try {
      await fetch("http://localhost:8081/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userData.user_id, 
          game_id: game.game_id,
          quantity: 1, 
        }),
      });

      // Update the local state
      setCartItems((prevItems) => [...prevItems, game]);
      setAddedToCart((prev) => new Set(prev).add(game.title));
      setTotalprice((prevPrice) => prevPrice + game.price);
    } catch (error) {
      console.error("Error adding game to cart:", error);
    }
  };

  useEffect(() => {
    if (auth) {
      axios
        .get(`http://localhost:8081/api/cart/${userData.user_id}`)
        .then((response) => {
          setCartItems(response.data.cartItems); // ตั้งค่าเกมในตะกร้าใหม่
          setTotalprice(response.data.totalPrice); // ตั้งราคารวมใหม่
        })
        .catch((error) => {
          console.error("Error fetching cart items:", error);
        });
    }
  }, [auth, userData.user_id]);

  axios.defaults.withCredentials = true;

  useEffect(() => {
    axios
      .get("http://localhost:8081/")
      .then((res) => {
        if (res.data.Status === "Success") {
          setAuth(true);
          setEmail(res.data.email);
        } else {
          setAuth(false);
        }
      })
      .catch((err) => console.log(err));
  }, []);

  const removeFromCart = async (gameToRemove) => {
    try {
      // Send DELETE request to remove the game from the cart
      const response = await fetch(
        `http://localhost:8081/api/cart/${userData.user_id}/${gameToRemove.game_id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to remove game from cart");
      }

      // Update local state
      setCartItems((prevItems) =>
        prevItems.filter((item) => item.game_id !== gameToRemove.game_id)
      ); // Remove game from cart
      setAddedToCart((prev) => {
        const newSet = new Set(prev);
        newSet.delete(gameToRemove.title); // Remove from added set
        return newSet;
      });
      setTotalprice((prevPrice) => prevPrice - gameToRemove.price);
    } catch (error) {
      console.error("Error removing game from cart:", error);
    }
  };

  const [paymentMethod, setPaymentMethod] = useState("Credit Card");
  const [deliveryMethod, setDeliveryMethod] = useState("Digital");

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    const transactionDetails = {
      buyer_id: userData.user_id,
      seller_id: 1,
      games: cartItems.map((game) => ({ game_id: game.game_id })),
      total_price: totalprice,
      payment_method: paymentMethod,
      delivery_method: deliveryMethod,
    };

    axios
      .post("http://localhost:8081/api/createTransaction", transactionDetails)
      .then((response) => {
        if (response.data.Status === "Success") {
          alert("Transaction Successful!");

          // Clear the cart in the frontend
          setCartItems([]);
          setTotalprice(0);
          setIsCartOpen(false);

          // Redirect to transaction page
          navigate(`/transaction/${userData.user_id}`);

          // Clear the cart in the database
          axios
            .delete(`http://localhost:8081/api/clearCart/${userData.user_id}`)
            .then(() => {
              console.log("Cart cleared in database");
            })
            .catch((error) => {
              console.error("Error clearing cart:", error);
            });
        }
      })
      .catch((error) => {
        console.error("Error during transaction:", error);
        alert("Transaction Failed. Please try again.");
      });
  };

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8081/wishlist/${userData.user_id}`
        );
        if (response.data.Status === "Success") {
          const wishlistGameIds = new Set(
            response.data.wishlist.map((item) => item.game_id)
          );
          setWishlistedGames(wishlistGameIds);
          const initialLikeButtonState = {};
          wishlistGameIds.forEach((gameId) => {
            initialLikeButtonState[gameId] = true; // Set games in wishlist to true
          });
          setLikebutton(initialLikeButtonState);
        }
      } catch (error) {
        console.error("Error fetching wishlist:", error);
      }
    };

    fetchWishlist();
  }, [userData.user_id]);

  const toggleWishlist = async (gameId) => {
    try {
      const response = await axios.post("http://localhost:8081/wishlist", {
        user_id: userData.user_id,
        game_id: gameId,
      });

      if (response.data.Status === "Success") {
        const newWishlist = new Set(wishlistedGames);
        if (response.data.Message === "Added to wishlist") {
          newWishlist.add(gameId);
        } else if (response.data.Message === "Removed from wishlist") {
          newWishlist.delete(gameId);
        }

        // Update likebutton and wishlistedGames states
        setWishlistedGames(newWishlist);
        setLikebutton((prev) => ({
          ...prev,
          [gameId]: !prev[gameId],
        }));
      }
    } catch (error) {
      console.error("Error updating wishlist:", error);
    }
  };

  return (
    <div>
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
                <Link
                  to={`/transaction/${userData.user_id}`}
                  className="dropdown-item"
                >
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
          <div className="Cart-icon" onClick={toggleCart}>
            <MdOutlineShoppingCart className="icon-item" />
            <span>{cartItems.length}</span>
          </div>

          {isCartOpen && (
            <div
              className={`cart-sidebar ${isCartOpen ? "open" : ""}`}
              style={{ height: "100%" }}
            >
              <h2>Your Cart</h2>
              <div className="d-flex justify-content-between align-items-center">
                <p
                  style={{
                    fontWeight: "800",
                    fontSize: "1.875rem",
                    margin: "0",
                  }}
                >
                  {cartItems.length} Games
                </p>
                <button onClick={toggleCart} className="btn btn-danger">
                  Close
                </button>
              </div>
              <ul style={{ height: "85%", padding: "0", fontSize: ".875rem" }}>
                {cartItems.map((game, index) => (
                  <li
                    key={index}
                    className="game-lists-cart d-flex justify-content-between align-items-center"
                  >
                    <div style={{ maxWidth: "150px", width: "100%" }}>
                      {game.title}
                    </div>
                    <div className="game-list-cart-btn">
                      ฿{game.price}
                      <button onClick={() => removeFromCart(game)}>
                        <RxCross2 />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
              <div
                className="d-flex justify-content-between align-items-end"
                style={{ position: "sticky", bottom: "0px" }}
              >
                <p
                  style={{
                    margin: "0",
                    color: "#71717A",
                    fontSize: "16px",
                    fontWeight: "bold",
                  }}
                >
                  Total : ฿{totalprice}
                </p>
                <div className="checkout-btn" onClick={handleCheckout}>
                  <span>Checkout</span>
                  <FaArrowRight className="arrow-icon" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="gamestore-container">
        <div className="filters">
          <h3>Filters</h3>
          <ul>
            <li>
              <span className="icon">
                <AiFillLike />
              </span>
              <span>Wishlist</span>
            </li>
            <li>
              <span className="icon">
                <FaStar />
              </span>
              <span>Metacritic</span>
            </li>
            <li>
              <span className="icon">
                <FaCalendarAlt />
              </span>
              <span>Release Date</span>
            </li>
          </ul>
          <h4>Genres</h4>
          <ul>
            <li
              onClick={() => setSelectedGenre("Action")}
              className={selectedGenre === "Action" ? "selected-genre" : ""}
            >
              <span className="icon">
                <GiBarbute />
              </span>
              <span>Action</span>
            </li>
            <li
              onClick={() => setSelectedGenre("Strategy")}
              className={selectedGenre === "Strategy" ? "selected-genre" : ""}
            >
              <span className="icon">
                <FaChessPawn />
              </span>
              <span>Strategy</span>
            </li>
            <li
              onClick={() => setSelectedGenre("RPG")}
              className={selectedGenre === "RPG" ? "selected-genre" : ""}
            >
              <span className="icon">
                <GiAbdominalArmor />
              </span>
              <span>RPG</span>
            </li>
            <li
              onClick={() => setSelectedGenre("Shooter")}
              className={selectedGenre === "Shooter" ? "selected-genre" : ""}
            >
              <span className="icon">
                <FaGun />
              </span>
              <span>Shooter</span>
            </li>
            <li
              onClick={() => setSelectedGenre("Adventure")}
              className={selectedGenre === "Adventure" ? "selected-genre" : ""}
            >
              <span className="icon">
                <GiBirchTrees />
              </span>
              <span>Adventure</span>
            </li>
            <li
              onClick={() => setSelectedGenre("Souls-like")}
              className={selectedGenre === "Souls-like" ? "selected-genre" : ""}
            >
              <span className="icon">
                <FaPuzzlePiece />
              </span>
              <span>Souls-like</span>
            </li>
            <li
              onClick={() => setSelectedGenre("Racing")}
              className={selectedGenre === "Racing" ? "selected-genre" : ""}
            >
              <span className="icon">
                <IoCarSport />
              </span>
              <span>Racing</span>
            </li>
            <li
              onClick={() => setSelectedGenre("Sports")}
              className={selectedGenre === "Sports" ? "selected-genre" : ""}
            >
              <span className="icon">
                <IoFootball />
              </span>
              <span>Sports</span>
            </li>
          </ul>
        </div>

        <div className="game-list">
          <h1>Trending and Interesting</h1>
          <p>Based on player counts and release date</p>

          {selectedGenre && (
            <div className="clear-filter">
              <button className="filter-btn">Filter by: {selectedGenre}</button>
              <button className="filter-btn" onClick={clearFilter}>
                Clear Filter
              </button>
            </div>
          )}

          <div className="row row-gap-3">
            {games
              .filter((game) =>
                selectedGenre ? game.genre.includes(selectedGenre) : true
              )
              .map((game, index) => (
                <div className="col-xxl-3 col-xl-4 col-md-5 " key={index}>
                  <div className="game-card">
                    <Link to={`/game/${game.game_id}`}>
                      <img
                        src={game.cover_image}
                        alt={game.title}
                        className="game-image"
                      />
                    </Link>
                    <div className="game-info">
                      <div className="d-flex justify-content-between align-items-center">
                        <div
                          className="add-cart-con"
                          onClick={() =>
                            addedToCart.has(game.title)
                              ? removeFromCart(game)
                              : addToCart(game)
                          }
                        >
                          <span
                            style={{
                              color: addedToCart.has(game.title)
                                ? "#36d399"
                                : "inherit",
                            }}
                          >
                            {addedToCart.has(game.title)
                              ? "Added"
                              : "Add to cart"}
                          </span>
                          <FaPlus
                            className={
                              addedToCart.has(game.title)
                                ? "cart-icon-2"
                                : "cart-icon"
                            }
                          />
                          <FaCheck
                            className={
                              addedToCart.has(game.title)
                                ? "cart-icon"
                                : "cart-icon-3"
                            }
                            style={{ color: "#36d399", marginBottom: "3px" }}
                          />
                        </div>
                        <span className="price">฿{game.price}</span>
                      </div>
                      <div className="game-title-rating">
                        <h5>{game.title}</h5>
                        <span className="rating">{parseFloat(game.rating).toFixed(1)}</span>
                      </div>

                      <button
                        className={
                          likebutton[game.game_id] ? "btn-like-2" : "btn-like"
                        }
                        onClick={() => toggleWishlist(game.game_id)}
                      >
                        <FaHeart className="like-icon" />
                      </button>
                      <div className="platform-con">
                        <FaWindows className="platform-icon" />
                        <FaXbox className="platform-icon" />
                        <FaPlaystation className="platform-icon" />
                      </div>

                      <div className="bottom-detail">
                        <p>
                          Released:{" "}
                          {new Date(game.release_date).toLocaleDateString()}
                        </p>
                        <p>Genres: {game.genre}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default GameShopping;
