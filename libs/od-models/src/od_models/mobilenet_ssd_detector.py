import cv2 as cv
import numpy as np
import os
import sys

class MobileNetSSDDetector:
    """
    MobileNet SSD object detector using OpenCV DNN.
    Much faster than YOLOv8n while maintaining good accuracy.
    """

    def __init__(self, model_path=None, config_path=None, confidence_threshold=0.3, nms_threshold=0.4, top_k=10):
        """
        Initialize the MobileNet SSD detector.

        Args:
            model_path: Path to .caffemodel file
            config_path: Path to .prototxt file
            confidence_threshold: Minimum confidence for detections (default: 0.3 for more detections)
            nms_threshold: Non-Maximum Suppression threshold (default: 0.4)
            top_k: Maximum number of detections to keep (default: 10)
        """
        # Default paths (will download if not found)
        if model_path is None:
            model_path = os.path.join(os.path.dirname(__file__), 'MobileNetSSD_deploy.caffemodel')
        if config_path is None:
            config_path = os.path.join(os.path.dirname(__file__), 'MobileNetSSD_deploy.prototxt')

        self.confidence_threshold = confidence_threshold
        self.nms_threshold = nms_threshold
        self.top_k = top_k
        self.input_size = (320, 320)  # Increased from 300x300 for better accuracy

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

        # URLs for the model files (working sources)
        model_urls = [
            "https://raw.githubusercontent.com/chuanqi305/MobileNet-SSD/master/mobilenet_iter_73000.caffemodel",
            "https://pjreddie.com/media/files/MobileNetSSD_deploy.caffemodel"
        ]

        config_urls = [
            "https://raw.githubusercontent.com/chuanqi305/MobileNet-SSD/master/deploy.prototxt",
            "https://raw.githubusercontent.com/opencv/opencv_extra/master/testdata/dnn/MobileNetSSD_deploy.prototxt"
        ]

        try:
            # Download model file
            if not os.path.exists(model_path):
                print("Downloading model file...")
                for url in model_urls:
                    try:
                        print(f"Trying: {url}")
                        urllib.request.urlretrieve(url, model_path)
                        print("Model downloaded successfully")
                        break
                    except Exception as e:
                        print(f"Failed: {e}")
                        continue
                else:
                    raise Exception("Failed to download model from any source")

            # Download config file
            if not os.path.exists(config_path):
                print("Downloading config file...")
                for url in config_urls:
                    try:
                        print(f"Trying: {url}")
                        urllib.request.urlretrieve(url, config_path)
                        print("Config downloaded successfully")
                        break
                    except Exception as e:
                        print(f"Failed: {e}")
                        continue
                else:
                    raise Exception("Failed to download config from any source")

            # Reload the network with downloaded files
            self.net = cv.dnn.readNetFromCaffe(config_path, model_path)
            print("Model files downloaded successfully")

        except Exception as e:
            print(f"Failed to download model files: {e}")
            print("Please download manually and place in the od-models directory")
            raise

    def detect_and_draw(self, frame: np.ndarray) -> tuple[np.ndarray, list[dict]]:
        """
        Detect objects in frame and draw bounding boxes with optimizations.

        Args:
            frame: Input BGR frame

        Returns:
            tuple: (annotated_frame, detections_list)
        """
        # Prepare input blob with optimized size
        blob = cv.dnn.blobFromImage(frame, 0.007843, self.input_size, 127.5)
        self.net.setInput(blob)

        # Forward pass
        detections_output = self.net.forward()

        # Process detections with optimizations
        h, w = frame.shape[:2]
        boxes = []
        confidences = []
        class_ids = []

        # Collect all detections above threshold (excluding background)
        for i in range(detections_output.shape[2]):
            confidence = detections_output[0, 0, i, 2]
            class_id = int(detections_output[0, 0, i, 1])

            # Skip background class (class_id = 0) and low confidence detections
            if class_id == 0 or confidence < self.confidence_threshold:
                continue

            # Get bounding box coordinates
            box = detections_output[0, 0, i, 3:7] * np.array([w, h, w, h])
            x1, y1, x2, y2 = box.astype(int)

            # Ensure coordinates are within frame bounds
            x1, y1 = max(0, x1), max(0, y1)
            x2, y2 = min(w, x2), min(h, y2)

            if x2 <= x1 or y2 <= y1:
                continue

            boxes.append([x1, y1, x2, y2])
            confidences.append(float(confidence))
            class_ids.append(class_id)

        # Apply Non-Maximum Suppression
        if boxes:
            indices = cv.dnn.NMSBoxes(boxes, confidences, self.confidence_threshold, self.nms_threshold)

            # Keep only top-k detections
            if len(indices) > 0:
                indices = indices.flatten()[:self.top_k]  # Limit to top-k
            else:
                indices = []

            detections = []
            for idx in indices:
                x1, y1, x2, y2 = boxes[idx]
                confidence = confidences[idx]
                class_id = class_ids[idx]
                class_name = self.classes[class_id] if class_id < len(self.classes) else f"class_{class_id}"

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
                    'confidence': confidence,
                    'bbox': [x1, y1, x2, y2],
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

        return frame, []

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
