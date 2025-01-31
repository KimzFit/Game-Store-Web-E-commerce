import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../style/Homepage.css";
import Slideshow from "../component/Slideshow";
import "../style/Edit.css";


function Homepage() {
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
          setMessage(res.data.Error);
        }
      })
      .then((err) => console.log(err));
  }, []);

  const handleLogout = () => {
    axios
      .get("http://localhost:8081/logout")
      .then((res) => {
        window.location.reload();
      })
      .catch((err) => console.log(err));
  };
  return (
    <div>
      {auth ? (
        <div className="Logined-container">
          <div className="Navigation-bar">
            <div className="Logo">
              <h2>
                <i class="fa-solid fa-gamepad" style={{ fontSize: "14px" }}></i>{" "}
                <Link to='/' style={{textDecoration : 'none' ,color: 'white', marginLeft: '5px'}}>GameStore</Link>
              </h2>
            </div>
            <div className="Search-con" style={{ fontSize: ".875rem" }}>
              <input type="search" placeholder="Search games..." />
              <i class="fa-solid fa-magnifying-glass"></i>
            </div>
            <div className="d-flex  right-nav">
              <div className="text-white profile-picture">
                <img src={userData.profile_picture} alt="" />
              </div>

              <div
                class="dropdown"
                style={{ marginLeft: "30px", marginRight: "20px" }}
              >
                <button
                  class="btn btn-secondary dropdown-toggle"
                  type="button"
                  id="dropdownMenuButton1"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  {userData.username}
                </button>
                <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                  <li>
                    <Link to={`/editprofile?email=${email}`} className="dropdown-item">Account setting</Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="login-container">
            <Link className="link" to="/gameshop">
              Browse
            </Link>
            <Link className="link" onClick={handleLogout}>
              Logout
            </Link>
            <Link to={`/editprofile?email=${email}`} className="authen-link">
              {email}
            </Link>
          </div>
          <Slideshow></Slideshow>
        </div>
      ) : (
        <div className="main">
          <div className="Navigation-bar">
            <div className="Logo">
              <h2>
                <i class="fa-solid fa-gamepad" style={{ fontSize: "12px" }}></i>{" "}
                GameStore
              </h2>
            </div>
            <div className="Search-con" style={{ fontSize: ".875rem" }}>
              <input type="search" placeholder="Search games..." />
              <i class="fa-solid fa-magnifying-glass"></i>
            </div>
            <div className="d-flex align-center right-nav">
              <div className="text-white">{message}</div>
              
            </div>
          </div>
          <div className="login-container">
            <Link className="link" to="/login">
              Browse
            </Link>
            <Link to="/login" className="authen-link">
              Login
            </Link>
            <Link to="/register" className="authen-link">
              Sign up
            </Link>
          </div>
          <Slideshow></Slideshow>
        </div>
      )}
    </div>
  );
}

export default Homepage;
