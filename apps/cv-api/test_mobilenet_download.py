#!/usr/bin/env python3
"""
Test script to manually download and verify MobileNet SSD model files.
This helps debug why the automatic download in the detector isn't working.
"""

import os
import urllib.request
import cv2 as cv
import numpy as np

def test_mobilenet_download():
    """Test downloading and loading MobileNet SSD model files."""

    # Define file paths (same as in the detector)
    base_dir = os.path.join(os.path.dirname(__file__), 'libs/od-models/src/od_models')
    os.makedirs(base_dir, exist_ok=True)

    model_path = os.path.join(base_dir, 'MobileNetSSD_deploy.caffemodel')
    config_path = os.path.join(base_dir, 'MobileNetSSD_deploy.prototxt')

    print(f"Model path: {model_path}")
    print(f"Config path: {config_path}")
    print(f"Base directory: {base_dir}")

    # URLs for the model files (from OpenCV's official samples)
    model_url = "https://github.com/opencv/opencv/raw/4.x/samples/data/MobileNetSSD_deploy.caffemodel"
    config_url = "https://github.com/opencv/opencv/raw/4.x/samples/data/MobileNetSSD_deploy.prototxt"

    try:
        # Check if files already exist
        model_exists = os.path.exists(model_path)
        config_exists = os.path.exists(config_path)

        print(f"Model file exists: {model_exists}")
        print(f"Config file exists: {config_exists}")

        # Download model file if needed
        if not model_exists:
            print(f"Downloading model from {model_url}")
            urllib.request.urlretrieve(model_url, model_path)
            print("Model downloaded successfully")
        else:
            print("Model file already exists")

        # Download config file if needed
        if not config_exists:
            print(f"Downloading config from {config_url}")
            urllib.request.urlretrieve(config_url, config_path)
            print("Config downloaded successfully")
        else:
            print("Config file already exists")

        # Check file sizes
        if os.path.exists(model_path):
            model_size = os.path.getsize(model_path)
            print(f"Model file size: {model_size} bytes")

        if os.path.exists(config_path):
            config_size = os.path.getsize(config_path)
            print(f"Config file size: {config_size} bytes")

        # Test loading the model
        print("Testing model loading...")
        net = cv.dnn.readNetFromCaffe(config_path, model_path)
        print("Model loaded successfully!")

        # Test forward pass with dummy input
        print("Testing forward pass...")
        blob = cv.dnn.blobFromImage(np.zeros((300, 300, 3), dtype=np.uint8), 0.007843, (300, 300), 127.5)
        net.setInput(blob)
        detections = net.forward()
        print(f"Forward pass successful! Output shape: {detections.shape}")

        return True

    except Exception as e:
        print(f"Error: {e}")
        return False

if __name__ == "__main__":
    print("Testing MobileNet SSD download and loading...")
    success = test_mobilenet_download()
    if success:
        print("✅ Test passed! MobileNet SSD is working.")
    else:
        print("❌ Test failed! Check the error messages above.")
