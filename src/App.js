import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import Register from "./components/Register";
import Verify from "./components/Verify";
import "./styles/global.css";

const BACKEND_URL = "http://3.11.83.126:5000";

export const AppContext = React.createContext();

const App = () => {
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const api = {
    uploadImage: async (file) => {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch(`${BACKEND_URL}/upload`, {
        method: "POST",
        body: formData,
      });
      return response.json();
    },

    registerFace: async (data) => {
      const response = await fetch(`${BACKEND_URL}/register-face`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      return response.json();
    },

    verifyFace: async (imageBytes) => {
      const response = await fetch(`${BACKEND_URL}/verify-face-bytes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image_bytes: imageBytes }),
      });
      return response;
    },
  };

  return (
    <AppContext.Provider value={{ api, error, setError, success, setSuccess }}>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify" element={<Verify />} />
        </Routes>
      </Router>
    </AppContext.Provider>
  );
};

export default App;
