import cv2 as cv
import numpy as np
import os
import sys

class MobileNetSSDDetector:
    """
    MobileNet SSD object detector using OpenCV DNN.
    Much faster than YOLOv8n while maintaining good accuracy.
    """

    def __init__(self, model_path=None, config_path=None, confidence_threshold=0.5):
        """
        Initialize the MobileNet SSD detector.

        Args:
            model_path: Path to .caffemodel file
            config_path: Path to .prototxt file
            confidence_threshold: Minimum confidence for detections
        """
        # Default paths (will download if not found)
        if model_path is None:
            model_path = os.path.join(os.path.dirname(__file__), 'MobileNetSSD_deploy.caffemodel')
        if config_path is None:
            config_path = os.path.join(os.path.dirname(__file__), 'MobileNetSSD_deploy.prototxt')

        self.confidence_threshold = confidence_threshold

        # COCO class names for MobileNet SSD
        self.classes = [
            "background", "aeroplane", "bicycle", "bird", "boat",
            "bottle", "bus", "car", "cat", "chair", "cow", "diningtable",
            "dog", "horse", "motorbike", "person", "pottedplant", "sheep",
            "sofa", "train", "tvmonitor"
        ]

        # Load the model
        self.net = cv.dnn.readNetFromCaffe(config_path, model_path)

        # Try to download model files if they don't exist
        if not os.path.exists(model_path) or not os.path.exists(config_path):
            self._download_models(model_path, config_path)

    def _download_models(self, model_path, config_path):
        """Download MobileNet SSD model files if not present."""
        import urllib.request

        print("Downloading MobileNet SSD model files...")

        # URLs for the model files (using OpenCV's official samples)
        model_url = "https://github.com/opencv/opencv/raw/4.x/samples/data/MobileNetSSD_deploy.caffemodel"
        config_url = "https://github.com/opencv/opencv/raw/4.x/samples/data/MobileNetSSD_deploy.prototxt"

        try:
            if not os.path.exists(model_path):
                print(f"Downloading model from {model_url}")
                urllib.request.urlretrieve(model_url, model_path)

            if not os.path.exists(config_path):
                print(f"Downloading config from {config_url}")
                urllib.request.urlretrieve(config_url, config_path)

            # Reload the network with downloaded files
            self.net = cv.dnn.readNetFromCaffe(config_path, model_path)
            print("Model files downloaded successfully")

        except Exception as e:
            print(f"Failed to download model files: {e}")
            print("Please download manually and place in the od-models directory")
            raise

    def detect_and_draw(self, frame: np.ndarray) -> tuple[np.ndarray, list[dict]]:
        """
        Detect objects in frame and draw bounding boxes.

        Args:
            frame: Input BGR frame

        Returns:
            tuple: (annotated_frame, detections_list)
        """
        detections = []

        # Prepare input blob
        blob = cv.dnn.blobFromImage(frame, 0.007843, (300, 300), 127.5)
        self.net.setInput(blob)

        # Forward pass
        detections_output = self.net.forward()

        # Process detections
        h, w = frame.shape[:2]

        for i in range(detections_output.shape[2]):
            confidence = detections_output[0, 0, i, 2]

            if confidence > self.confidence_threshold:
                class_id = int(detections_output[0, 0, i, 1])
                class_name = self.classes[class_id] if class_id < len(self.classes) else f"class_{class_id}"

                # Get bounding box coordinates
                box = detections_output[0, 0, i, 3:7] * np.array([w, h, w, h])
                x1, y1, x2, y2 = box.astype(int)

                # Ensure coordinates are within frame bounds
                x1, y1 = max(0, x1), max(0, y1)
                x2, y2 = min(w, x2), min(h, y2)

                if x2 <= x1 or y2 <= y1:
                    continue

                # Calculate position for narration
                center_x = (x1 + x2) // 2
                center_y = (y1 + y2) // 2

                if center_x < w // 3:
                    h_pos = "left"
                elif center_x > 2 * w // 3:
                    h_pos = "right"
                else:
                    h_pos = "center"

                if center_y < h // 3:
                    v_pos = "top"
                elif center_y > 2 * h // 3:
                    v_pos = "bottom"
                else:
                    v_pos = ""

                position = f"{v_pos} {h_pos}".strip() if v_pos else h_pos

                # Store detection
                detections.append({
                    'class_name': class_name,
                    'confidence': float(confidence),
                    'bbox': [int(x1), int(y1), int(x2), int(y2)],
                    'position': position
                })

                # Get color for visualization
                color = self._get_color_for_class(class_id)

                # Draw bounding box
                cv.rectangle(frame, (x1, y1), (x2, y2), color, 2)

                # Draw label
                label = f"{class_name}: {confidence:.2f}"
                (text_w, text_h), _ = cv.getTextSize(label, cv.FONT_HERSHEY_SIMPLEX, 0.6, 2)
                cv.rectangle(frame, (x1, y1 - text_h - 10), (x1 + text_w, y1), color, -1)
                cv.putText(frame, label, (x1, y1 - 5), cv.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)

        return frame, detections

    def _get_color_for_class(self, class_id):
        """Get consistent color for class visualization."""
        np.random.seed(class_id * 101)
        color = np.random.randint(0, 255, 3).tolist()
        return (int(color[0]), int(color[1]), int(color[2]))


# Convenience function for backward compatibility
def detect_and_draw(frame: np.ndarray) -> tuple[np.ndarray, list[dict]]:
    """
    Convenience function using MobileNet SSD detector.
    Maintains same interface as YOLO detector.
    """
    detector = MobileNetSSDDetector()
    return detector.detect_and_draw(frame)
