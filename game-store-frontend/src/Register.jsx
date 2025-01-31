import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';

function Register() {
  const [values, setValues] = useState({
    username: '',
    password: '',
    email: ''
  });
  
  const navigate = useNavigate();
  
  const handleSubmit = (event) => {
    event.preventDefault();
    axios.post('http://localhost:8081/register', values)
      .then(res => {
        if (res.data.Status === "Success") {
          navigate('/login');
        } else {
          alert("Error");
        }
      })
      .catch(err => console.log(err));
  };
  
  return (
    <>
      <section className="vh-100" style={{ backgroundColor: "#18181b" }}>
      <Link to='/' className='Link-home-2'>
          <h2 className='text-white'>
            <i className="fa-solid fa-gamepad" style={{ fontSize: '20px' }}></i> GameStore
          </h2>
        </Link>
        <div className="container h-100">
          <div className="row d-flex justify-content-center align-items-center h-100">
            <div className="col-md-6 col-lg-5">
              <div className="card text-white " style={{ borderRadius: '25px', backgroundColor: 'rgb(39, 39, 42)', padding: '15px'}}>
                <div className="card-body p-md-4">
                  <div className="text-center h3 fw-bold mb-5 mx-1 mx-md-4 mt-4">
                    Sign up
                  </div>

                  <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                      <i className="fas fa-user fa-lg me-3 fa-fw mb-4"></i>
                      <div className="form-outline flex-fill mb-0">
                        <input
                          type="text"
                          className="form-control"
                          onChange={e => setValues({ ...values, username: e.target.value })}
                          style={{ backgroundColor: '#3f3f46', color: 'white' }}
                        />
                        <label className="form-label">Username</label>
                      </div>
                    </div>

                    <div className="mb-4">
                      <i className="fas fa-envelope fa-lg me-3 fa-fw mb-4"></i>
                      <div className="form-outline flex-fill mb-0">
                        <input
                          type="email"
                          className="form-control"
                          onChange={e => setValues({ ...values, email: e.target.value })}
                          style={{ backgroundColor: '#3f3f46', color: 'white' }}
                        />
                        <label className="form-label">Your Email</label>
                      </div>
                    </div>

                    <div className="mb-4">
                      <i className="fas fa-lock fa-lg me-3 fa-fw mb-4"></i>
                      <div className="form-outline flex-fill mb-0">
                        <input
                          type="password"
                          className="form-control"
                          onChange={e => setValues({ ...values, password: e.target.value })}
                          style={{ backgroundColor: '#3f3f46', color: 'white' }}
                        />
                        <label className="form-label">Password</label>
                      </div>
                    </div>

                    <div className="form-check d-flex justify-content-center mb-5">
                      <span>Already have an account? <Link to='/login' style={{ color: '#661ae6' }}>Sign in</Link></span>
                    </div>

                    <div className="d-flex justify-content-center mx-4 mb-3 mb-lg-4">
                      <button type="submit" className="btn btn-lg text-white" style={{ background: '#661ae6', width : '100%' }}>
                        Register
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default Register;
