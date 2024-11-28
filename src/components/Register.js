// components/Register.js
import React, { useState, useContext, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Webcam from "react-webcam";
import { AppContext } from "../App";
import ImageCropper from "./ImageCropper";

const Register = () => {
  const navigate = useNavigate();
  const { api, error, setError, success, setSuccess } = useContext(AppContext);
  const webcamRef = useRef(null);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    occupation: "",
    title: "",
    age: "",
  });
  
  useEffect(() => {
    return () => {
      setError(null);
      setSuccess(null);
    };
  }, []);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("camera");
  const [isCameraActive, setIsCameraActive] = useState(true);
  const [isCropping, setIsCropping] = useState(false);
  const [tempImageUrl, setTempImageUrl] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setTempImageUrl(URL.createObjectURL(file));
      setIsCropping(true);
    }
  };

  const handleCropComplete = (croppedBlob, croppedUrl) => {
    const file = new File([croppedBlob], "cropped-image.jpg", {
      type: "image/jpeg",
    });
    setImage(file);
    setPreview(croppedUrl);
    setIsCropping(false);
    setTempImageUrl(null);
  };

  const handleCropCancel = () => {
    setIsCropping(false);
    setTempImageUrl(null);
  };

  const resetImage = () => {
    setPreview(null);
    setImage(null);
    setIsCameraActive(false);
  };

  const videoConstraints = {
    width: 720,
    height: 480,
    facingMode: "user",
  };

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      setTempImageUrl(imageSrc);
      setIsCropping(true);
      setIsCameraActive(false);
    }
  }, [webcamRef]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    // Form validation
    if (!formData.firstName.trim()) {
      setError("Please enter a first name.");
      setIsLoading(false);
      return;
    }
    if (!formData.lastName.trim()) {
      setError("Please enter a last name.");
      setIsLoading(false);
      return;
    }
    if (!formData.title.trim()) {
      setError("Please enter a title.");
      setIsLoading(false);
      return;
    }
    if (!formData.age || formData.age === "0") {
      setError("Please enter a valid age.");
      setIsLoading(false);
      return;
    }
    if (!formData.occupation.trim()) {
      setError("Please enter an occupation.");
      setIsLoading(false);
      return;
    }
    if (!image) {
      setError("Please select or capture an image.");
      setIsLoading(false);
      return;
    }

    try {
      // Upload image
      const uploadResponse = await api.uploadImage(image);
      if (!uploadResponse.file_name) {
        throw new Error("Upload failed");
      }

      // Register face
      const registerResponse = await api.registerFace({
        file_name: uploadResponse.file_name,
        first_name: formData.firstName,
        last_name: formData.lastName,
        occupation: formData.occupation,
        title: formData.title,
        age: parseInt(formData.age),
      });

      if (registerResponse.message) {
        setSuccess("✅ Face registered successfully!");
        setTimeout(() => {
          setSuccess(null);
          navigate("/");
        }, 2000);
      } else {
        throw new Error(registerResponse.error || "Registration failed");
      }
    } catch (err) {
      setError("❌ " + (err.message || "Registration failed"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-container">
      <h1 className="title-text">Register a Person</h1>

      <div className="register-content">
        <button onClick={() => navigate("/")} className="home-button">
          🏠 Home
        </button>

        {/* Image Capture/Upload Section */}
        <div className="image-capture-section">
          {isCropping && tempImageUrl && (
            <ImageCropper
              imageUrl={tempImageUrl}
              onCropComplete={handleCropComplete}
              onCancel={handleCropCancel}
            />
          )}

          <div className="image-section-content">
            {!isCropping && activeTab === "camera" && (
              <div className="camera-section">
                {!preview && (
                  <div className="camera-container">
                    {isCameraActive ? (
                      <>
                        <Webcam
                          audio={false}
                          ref={webcamRef}
                          screenshotFormat="image/jpeg"
                          videoConstraints={videoConstraints}
                          className="camera-preview"
                        />
                        <div className="camera-controls">
                          <button
                            type="button"
                            className="button"
                            onClick={capture}
                          >
                            📷 Capture Photo
                          </button>
                          <button
                            type="button"
                            className="button button-secondary"
                            onClick={() => setIsCameraActive(false)}
                          >
                            ❌ Stop Camera
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="tabs">
                        <button
                          type="button"
                          className="tab"
                          onClick={() => setIsCameraActive(true)}
                        >
                          📸 Start Camera
                        </button>
                      </div>
                    )}
                  </div>
                )}
                {preview && (
                  <div className="preview-container">
                    <img
                      src={preview}
                      alt="Preview"
                      className="camera-preview"
                    />
                    <button
                      type="button"
                      className="button button-secondary"
                      onClick={resetImage}
                    >
                      ❌ Retake Photo
                    </button>
                  </div>
                )}
              </div>
            )}

            {!isCropping && activeTab === "upload" && (
              <div className="upload-section">
                <div class="file-upload-container">
                  <div class="upload-zone">
                    <div class="upload-content">
                      <div class="drag-drop-content">
                        <svg
                          class="cloud-icon"
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        >
                          <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
                        </svg>
                        <span class="upload-text">Drag and drop file here</span>
                      </div>
                      <div class="file-info">
                        Limit 200MB per file • JPG, JPEG, PNG
                      </div>
                    </div>
                    <div class="browse-button">Browse files</div>
                    <input
                      type="file"
                      accept="image/*"
                      class="file-input"
                      onChange={handleImageChange}
                      required
                    />
                  </div>
                </div>

                {preview && (
                  <div className="preview-container">
                    <img
                      src={preview}
                      alt="Preview"
                      className="camera-preview"
                    />
                    <button
                      type="button"
                      className="button button-secondary"
                      onClick={resetImage}
                    >
                      ❌ Remove Image
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="tabs">
              {activeTab === "camera" ? (
                <button
                  type="button"
                  className="tab"
                  onClick={() => {
                    setActiveTab("upload");
                    setPreview(null);
                    setImage(null);
                    setIsCameraActive(false);
                  }}
                >
                  📁 Upload Image Instead
                </button>
              ) : (
                <button
                  type="button"
                  className="tab"
                  onClick={() => {
                    setActiveTab("camera");
                    setPreview(null);
                    setImage(null);
                    setIsCameraActive(true);
                  }}
                >
                  📸 Take Picture Instead
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className="form-section">
          <form onSubmit={handleSubmit} className="register-form">
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">👤 First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">👤 Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">💼 Occupation</label>
                <input
                  type="text"
                  name="occupation"
                  value={formData.occupation}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">🎓 Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">🎂 Age</label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                  min="0"
                  max="120"
                />
              </div>
            </div>

            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <button
              type="submit"
              disabled={isLoading}
              className="submit-button"
            >
              {isLoading ? "Registering..." : "Register Person"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
