// components/Verify.js
import React, { useState, useContext, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Webcam from "react-webcam";
import { AppContext } from "../App";
import ImageCropper from "./ImageCropper";

const Verify = () => {
  const navigate = useNavigate();
  const { api, error, setError, success, setSuccess } = useContext(AppContext);
  const webcamRef = useRef(null);

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("camera");
  const [isCameraActive, setIsCameraActive] = useState(true);
  const [isCropping, setIsCropping] = useState(false);
  const [tempImageUrl, setTempImageUrl] = useState(null);
  const [matchedPerson, setMatchedPerson] = useState(null);

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

  const handleVerify = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);
    setMatchedPerson(null);

    if (!image) {
      setError("Please select or capture an image.");
      setIsLoading(false);
      return;
    }

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64Image = reader.result.split(",")[1];
          const response = await api.verifyFace(base64Image);

          if (response.ok) {
            const data = await response.json();
            setMatchedPerson(data);
            setSuccess("✅ Face matched successfully!");
          } else if (response.status === 404) {
            setError("❌ No matching face found");
          } else {
            throw new Error("Verification failed");
          }
        } catch (err) {
          setError("❌ " + (err.message || "Verification failed"));
        } finally {
          setIsLoading(false);
        }
      };

      reader.readAsDataURL(image);
    } catch (err) {
      setError("❌ " + (err.message || "Verification failed"));
      setIsLoading(false);
    }
  };

  return (
    <div className="register-container">
      <h1 className="title-text">Verify/Search Face</h1>

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
                <div className="file-upload-container">
                  <div className="upload-zone">
                    <div className="upload-content">
                      <div className="drag-drop-content">
                        <svg
                          className="cloud-icon"
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
                        </svg>
                        <span className="upload-text">
                          Drag and drop file here
                        </span>
                      </div>
                      <div className="file-info">
                        Limit 200MB per file • JPG, JPEG, PNG
                      </div>
                    </div>
                    <div className="browse-button">Browse files</div>
                    <input
                      type="file"
                      accept="image/*"
                      className="file-input"
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
          <form onSubmit={handleVerify} className="register-form">
            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <button
              type="submit"
              disabled={isLoading}
              className="submit-button"
            >
              {isLoading ? "Verifying..." : "Verify Face"}
            </button>

            {matchedPerson && (
              <div className="results-card">
                <div className="results-content">
                  <h3>Matched Person Details</h3>
                  <p>
                    <strong>Name:</strong> {matchedPerson.title}{" "}
                    {matchedPerson.first_name} {matchedPerson.last_name}
                  </p>
                  <p>
                    <strong>Occupation:</strong> {matchedPerson.occupation}
                  </p>
                  <p>
                    <strong>Age:</strong> {matchedPerson.age}
                  </p>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Verify;
