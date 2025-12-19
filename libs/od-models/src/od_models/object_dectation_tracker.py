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

def detect_and_draw(frame: np.ndarray) -> tuple[np.ndarray, list[dict]]:
    """
    Runs YOLOv8 inference on a frame and draws bounding boxes and labels.

    Args:
        frame (np.ndarray): The input video frame (BGR format)

    Returns:
        tuple: (annotated_frame, detections_list)
            - annotated_frame: The frame with detection bounding boxes drawn on it
            - detections_list: List of detection dictionaries with keys: 'class_name', 'confidence', 'bbox', 'position'
    """
    detections = []

    # Run inference on the frame (conf=0.5 for minimum confidence)
    results = MODEL.predict(frame, conf=0.5, verbose=False)

    # Process results (should only be one result object per frame)
    for result in results:

        # Check if there are any detection in the frame
        if result.boxes is not None and result.boxes.data.numel() > 0:
            # The .data tensor contains [coordinates, conf, cls]
            data = result.boxes.data.cpu().numpy()

            # Extract coordinates
            boxes = data[:, :4].astype(int)

            # Extract confidence scores
            confidences = data[:, 4]

            # Extract class IDs
            class_ids = data[:, 5].astype(int)

            for box, conf, class_id in zip(boxes, confidences, class_ids):
                x1, y1, x2, y2 = box

                # Get the class name
                class_name = MODEL.names[class_id]

                # Calculate center position for narration
                center_x = (x1 + x2) // 2
                center_y = (y1 + y2) // 2

                # Simple position calculation
                frame_height, frame_width = frame.shape[:2]
                if center_x < frame_width // 3:
                    h_pos = "left"
                elif center_x > 2 * frame_width // 3:
                    h_pos = "right"
                else:
                    h_pos = "center"

                if center_y < frame_height // 3:
                    v_pos = "top"
                elif center_y > 2 * frame_height // 3:
                    v_pos = "bottom"
                else:
                    v_pos = ""

                position = f"{v_pos} {h_pos}".strip() if v_pos else h_pos

                # Store detection info
                detections.append({
                    'class_name': class_name,
                    'confidence': float(conf),
                    'bbox': [int(x1), int(y1), int(x2), int(y2)],
                    'position': position
                })

                # Get color for visualization
                color = get_color_for_class(class_id)

                # Draw the bounding box
                cv.rectangle(frame, (x1, y1), (x2, y2), color, 2)

                # Create label text (e.g. "person: 0.95")
                label = f"{class_name}: {conf:.2f}"

                # Draw the label background rectangle
                (w, h), _ = cv.getTextSize(label, cv.FONT_HERSHEY_SIMPLEX, 0.6, 2)
                cv.rectangle(frame, (x1, y1 - h - 10), (x1 + w, y1), color, -1)

                # Draw the label text
                cv.putText(frame, label, (x1, y1 - 5), cv.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)

    return frame, detections
