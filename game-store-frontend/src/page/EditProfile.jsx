import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import '../style/Edit.css'
import { Link } from 'react-router-dom';
import Transition from '../component/Transition';


function EditProfile() {
  const [userData, setUserData] = useState({
    full_name: '',
    address: '',
    phone_number: '',
    profile_picture: '',
    email: '',
    username: ''
  });
  
  const location = useLocation();
  const email = new URLSearchParams(location.search).get('email');

  useEffect(() => {
    // Fetch user data based on the email
    axios.get(`http://localhost:8081/getUserByEmail/${email}`)
      .then(res => {
        if (res.data.Status === 'Success') {
          setUserData(res.data.user);
        }
      })
      .catch(err => console.error(err));
  }, [email]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Prepare data to send
    const updatedData = {
      full_name: userData.full_name,
      address: userData.address,
      phone_number: userData.phone_number,
      profile_picture: userData.profile_picture // Send the path or URL here
    };

    // Send the updated data to the server
    axios.post(`http://localhost:8081/updateUserByEmail/${email}`, updatedData)
      .then(res => {
        if (res.data.Status === 'Success') {
          alert('Profile updated successfully!');
          window.location.reload()
        }
      })
      .catch(err => console.error(err));
  };

  return (
   
    <div>
      <div className='Navigation-bar'>
                        <div className='Logo'>
                            <h2><i class="fa-solid fa-gamepad" style={{fontSize : '14px'}}></i><Link to='/' style={{textDecoration : 'none' ,color: 'white', marginLeft: '5px'}}>GameStore</Link>
                            </h2>
                        </div>
                        <div className='d-flex  right-nav'>
                            <div className='text-white profile-picture'>
                                <img src={userData.profile_picture} alt="" />
                            </div>
                            <div style={{marginLeft : '30px',marginTop:"10px", marginRight: '20px'}}>
                              {userData.username}
                            </div>
                        </div>
                    </div>
                    <div className='Edit-container'>
                      <div className='Edit'>
      <h2 style={{fontWeight: 'bold'}} >Account Setting</h2>
      <p style={{marginTop : ".5rem", opacity: '50%', marginBottom : '2rem'}} className='fs-6'>Manage your account’s details.</p>
      <h5 style={{fontWeight : 'bold'}}>Account Information</h5>
      <div className='User-data-heading' style={{marginBottom : '0px'}}>
        <div>
          <p><strong>Email:</strong> {userData.email}</p>
        </div>
        <div> 
          <p><strong>Username:</strong> {userData.username}</p>
        </div>
      </div>
     
      <form onSubmit={handleSubmit} className='form-container'>
        <label  className='input-box'>
          <div>
            Full Name:
          </div>
          <input type="text" name="full_name" value={userData.full_name} onChange={handleInputChange} />
        </label  ><br/>
        <label  className='input-box'>
          <div>
          Address:
          </div>
          <input type="text" name="address" value={userData.address} onChange={handleInputChange} />
        </label ><br/>
        <label  className='input-box'>
          <div>
          Phone Number:
          </div>
          <input type="text" name="phone_number" value={userData.phone_number} onChange={handleInputChange} />
        </label><br/>
        <label  className='input-box'>
          <div>
          Profile Picture URL:
          </div>
          <input type="text" name="profile_picture" value={userData.profile_picture} onChange={handleInputChange} placeholder="Enter the URL of the image" />
        </label><br/>
        <div className='btn-con'>
          <button type="submit" className='btn btn-primary'>Save Changes</button>
        </div>
      </form>
      </div>
      </div>
    </div>
  );
}

export default EditProfile;
