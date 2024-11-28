import React, { useRef, useEffect, useState } from "react";

const CameraCapture = ({ onCapture, onError }) => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [isStreaming, setIsStreaming] = useState(false);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsStreaming(true);
      }
    } catch (err) {
      onError(
        "Unable to access camera. Please ensure camera permissions are granted."
      );
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setIsStreaming(false);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(videoRef.current, 0, 0);

    canvas.toBlob(
      (blob) => {
        const file = new File([blob], "camera-capture.jpg", {
          type: "image/jpeg",
        });
        onCapture(file);
        stopCamera();
      },
      "image/jpeg",
      0.8
    );
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="camera-container">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="camera-preview"
        style={{ display: isStreaming ? "block" : "none" }}
      />

      <div className="camera-controls">
        {!isStreaming ? (
          <button type="button" onClick={startCamera} className="button">
            📸 Start Camera
          </button>
        ) : (
          <div className="space-y-4">
            <button type="button" onClick={capturePhoto} className="button">
              📷 Take Photo
            </button>
            <button
              type="button"
              onClick={stopCamera}
              className="button button-secondary"
            >
              ⏹ Stop Camera
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CameraCapture;
