import React from "react";
import { useNavigate } from "react-router-dom";
import UploadImageIcon from '../styles/upload-image-icon.svg';
import Search from '../styles/search.svg';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="container">
      <h1 className="title-text">Face Verification System</h1>

      <div className="home-grid">
        <div
          className="image-button-container"
          onClick={() => navigate("/register")}
        >
          <div className="image-button">
            <div className="image-overlay">
              <img
                src={UploadImageIcon}
                alt="Register"
                className="action-image"
              />
              <span className="action-text">Register</span>
            </div>
          </div>
        </div>

        <div
          className="image-button-container"
          onClick={() => navigate("/verify")}
        >
          <div className="image-button">
            <div className="image-overlay">
              <img
                src={Search}
                alt="Search"
                className="action-image"
              />
              <span className="action-text">Search</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
