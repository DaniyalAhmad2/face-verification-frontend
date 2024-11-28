// ImageCropper.js
import React, { useState, useCallback } from "react";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

const ImageCropper = ({ imageUrl, onCropComplete, onCancel }) => {
  const [crop, setCrop] = useState({
    unit: "%",
    width: 100, 
    height: 100,
    x: 0, 
    y: 0, 
    aspect: 1,
  });
  const [completedCrop, setCompletedCrop] = useState(null);
  const [imgRef, setImgRef] = useState(null);

  const onLoad = useCallback((img) => {
    setImgRef(img);

    // Set initial crop to cover the entire image
    const width = img.width;
    const height = img.height;

    const aspectRatio = 1; 
    let newCrop;

    if (width > height) {
      newCrop = {
        unit: "px",
        width: height,
        height: height,
        x: (width - height) / 2,
        y: 0,
        aspect: aspectRatio,
      };
    } else {
      newCrop = {
        unit: "px",
        width: width,
        height: width,
        x: 0,
        y: (height - width) / 2,
        aspect: aspectRatio,
      };
    }

    setCrop(newCrop);
    setCompletedCrop(newCrop);
  }, []);

  const getCroppedImg = useCallback(async () => {
    if (!imgRef || !completedCrop?.width || !completedCrop?.height) return;

    const canvas = document.createElement("canvas");
    const scaleX = imgRef.naturalWidth / imgRef.width;
    const scaleY = imgRef.naturalHeight / imgRef.height;

    const pixelRatio = window.devicePixelRatio;
    canvas.width = completedCrop.width * pixelRatio;
    canvas.height = completedCrop.height * pixelRatio;

    const ctx = canvas.getContext("2d");
    ctx.scale(pixelRatio, pixelRatio);
    ctx.imageSmoothingQuality = "high";

    const cropX = completedCrop.x * scaleX;
    const cropY = completedCrop.y * scaleY;
    const cropWidth = completedCrop.width * scaleX;
    const cropHeight = completedCrop.height * scaleY;

    ctx.drawImage(
      imgRef,
      cropX,
      cropY,
      cropWidth,
      cropHeight,
      0,
      0,
      completedCrop.width,
      completedCrop.height
    );

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            console.error("Canvas is empty");
            return;
          }
          const croppedImageUrl = URL.createObjectURL(blob);
          resolve({ blob, croppedImageUrl });
        },
        "image/jpeg",
        1
      );
    });
  }, [imgRef, completedCrop]);

  const handleCropComplete = async () => {
    if (!imgRef || !completedCrop?.width || !completedCrop?.height) {
      alert("Please make a crop selection");
      return;
    }

    try {
      const result = await getCroppedImg();
      if (result) {
        onCropComplete(result.blob, result.croppedImageUrl);
      }
    } catch (e) {
      console.error("Error creating crop:", e);
    }
  };

  return (
    <div className="cropper-modal">
      <div className="cropper-content">
        <div className="cropper-header">
          <h3>Crop Image</h3>
          <p>Drag to create a square crop, or resize the crop area as needed</p>
        </div>

        <div className="cropper-area">
          <ReactCrop
            crop={crop}
            onChange={(c) => setCrop(c)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={1}
            maxWidth={2000}
            maxHeight={2000}
          >
            <img
              src={imageUrl}
              onLoad={(e) => onLoad(e.target)}
              alt="Crop"
              className="crop-image"
            />
          </ReactCrop>
        </div>

        <div className="cropper-actions">
          <button type="button" onClick={onCancel} className="button-secondary">
            Cancel
          </button>
          <button
            type="button"
            onClick={handleCropComplete}
            className="button-primary"
          >
            Apply Crop
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageCropper;
