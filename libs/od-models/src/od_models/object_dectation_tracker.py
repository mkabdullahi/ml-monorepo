import cv2 as cv
from ultralytics import YOLO
import numpy as np
import sys
import time

# Load a lightweight pre-trained model (i.e. yolov8n.pt)
MODEL = YOLO('yolov8n.pt')

# Define a function to map class index to a unique color for visualization
def get_color_for_class(class_id):
    """Maps class ID to a consistent color"""
    np.random.seed(class_id * 101) # Use a seed for consistent color per class
    color = np.random.randint(0, 255 ,3).tolist()
    return (int(color[0]), int(color[1]), int(color[2]))

def detect_and_draw(frame: np.ndarray) -> np.ndarray:
    """
    Runs YOLOv8 inference on a frame and draws bounding boxes and labels.

    Args:
        frame (np.ndarray): The input video frame (BGR format)
    
    Returns:
        np.ndarray: The frame with detecntion bounding boxes drawn on it.
    """
    # Run inference on the frame (conf=0.5 for minimum confidence)
    results = MODEL.predict(frame, conf=0.5, verbose=False)

    # Process results (should only be one result object per frame)
    for result in results:

        # Check if there are any dectection in the frame
        if result.boxes is not None and result.boxes.data.numel() > 0:
            # The .data tensor contains [cordinates, conf, cls]
            data = result.boxes.data.cpu().numpy()

            #Extract coordinates
            boxes = data[:, :4].astype(int)

            #Extract confindence scores
            confidences = data[:, 4]

            #Extract class IDs
            class_ids = data[:, 5].astype(int)
        else:
            #If no detection, return the orignal frame
            return frame


        for box, conf, class_id in zip(boxes, confidences, class_ids):
            x1, y1, x2, y2 = box

            # Get the class name and color
            class_name = MODEL.names[class_id]
            color = get_color_for_class(class_id)

            # Draw the bounding box
            cv.rectangle(frame, (x1, y1), (x2, y2), color, 2)

            # Create label text (e.g. "this is a person, confidence: 0.95")
            label = f"This is a {class_name}, confidence: {conf:.2f}"

            # Draw the label backgraound rectangle
            (w, h), _ = cv.getTextSize(label, cv.FONT_HERSHEY_SIMPLEX, 0.7, 2)
            cv.rectangle(frame, (x1, y1 - h - 10), (x1 + w, y1), color, -1)

            # Draw the label text
            cv.putText(frame, label, (x1, y1 - 5), cv.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
    
    return frame
