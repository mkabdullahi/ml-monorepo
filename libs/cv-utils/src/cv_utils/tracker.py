import cv2 as cv
import numpy as np
import time

# -- Configuration Constants --
# HSV color ranges for primary colors
# Format: (lower_bound, upper_bound) or tuple of ranges for colors that wrap around HSV spectrum

COLOR_RANGES = {
    'Red': [
        # Red wraps around the HSV spectrum (0-10 and 170-180)
        (np.array([0, 100, 100]), np.array([10, 255, 255])),
        (np.array([170, 100, 100]), np.array([180, 255, 255]))
    ],
    'Blue': [
        (np.array([100, 100, 100]), np.array([130, 255, 255]))
    ],
    'Yellow': [
        (np.array([20, 100, 100]), np.array([30, 255, 255]))
    ],
    'Green': [
        (np.array([35, 100, 50]), np.array([85, 255, 255]))
    ]
}

# Bounding box colors (BGR format for OpenCV)
BOX_COLORS = {
    'Red': (0, 0, 255),
    'Blue': (255, 0, 0),
    'Yellow': (0, 255, 255),
    'Green': (0, 255, 0)
}

# Legacy constants for backward compatibility
LOWER_GREEN = np.array([35, 100, 50])
UPPER_GREEN = np.array([85, 255, 255])


def run_multi_color_tracking_stream(camera_index=0, show_debug_mask=False, min_area=500):
    """
    Initializes the webcam and runs the main loop for real-time multi-color tracking.
    Detects and tracks primary colors (Red, Blue, Yellow, Green) simultaneously.

    Args:
        camera_index (int): Index of the camera to use for video color detection.
        show_debug_mask (bool): Whether to show the debug mask window (default: False).
        min_area (int): Minimum contour area threshold to filter out noise (default: 500).
    """
    print(f"Starting multi-color tracking on webcam index {camera_index}...")
    print("Tracking colors: Red, Blue, Yellow, Green")
    print("Press 'q' to exit.")
    
    # Initialize video capture from the webcam
    cap = cv.VideoCapture(camera_index)

    if not cap.isOpened():
        print("Error: Could not open video stream.")
        return
    
    # Set up kernel for morphological operations (Cleaning up the mask)
    kernel = np.ones((5, 5), np.uint8)

    while True:
        ret, frame = cap.read()
        if not ret:
            print("Error: Could not read frame from video stream.")
            time.sleep(1)  # Wait a moment before retrying again
            continue
    
        # Core CV pipeline for color tracking
        blurred_frame = cv.GaussianBlur(frame, (11, 11), 0)
        hsv_frame = cv.cvtColor(blurred_frame, cv.COLOR_BGR2HSV)

        # Combined mask for debug view (if enabled)
        combined_mask = np.zeros(frame.shape[:2], dtype=np.uint8)

        # Detect each color
        for color_name, ranges in COLOR_RANGES.items():
            # Create mask for this color (combine multiple ranges if needed)
            color_mask = np.zeros(frame.shape[:2], dtype=np.uint8)
            
            for lower_bound, upper_bound in ranges:
                mask = cv.inRange(hsv_frame, lower_bound, upper_bound)
                color_mask = cv.bitwise_or(color_mask, mask)
            
            # Clean up the mask with morphological operations
            color_mask = cv.erode(color_mask, kernel, iterations=2)
            color_mask = cv.dilate(color_mask, kernel, iterations=2)
            
            # Add to combined mask for debug view
            combined_mask = cv.bitwise_or(combined_mask, color_mask)

            # Contour Detection
            contours, _ = cv.findContours(color_mask.copy(), cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)

            if len(contours) > 0:
                # Process each contour that meets the minimum area threshold
                for contour in contours:
                    if cv.contourArea(contour) > min_area:
                        x, y, w, h = cv.boundingRect(contour)
                        
                        # Get the color for this bounding box
                        box_color = BOX_COLORS[color_name]
                        
                        # Draw the rectangle and label on the frame
                        cv.rectangle(frame, (x, y), (x + w, y + h), box_color, 2)
                        cv.putText(frame, f"{color_name}", (x, y - 10), 
                                   cv.FONT_HERSHEY_SIMPLEX, 0.6, box_color, 2)
        
        # Display the resulting frame
        cv.imshow("Real-Time Multi-Color Tracker", frame)
        
        # Optionally show debug mask
        if show_debug_mask:
            cv.imshow("Mask (Debug)", combined_mask)

        # Break the loop on 'q' key press
        if cv.waitKey(1) & 0xFF == ord('q'):
            break
    
    # Release resources i.e. clean up
    cap.release()
    cv.destroyAllWindows()
    print("Webcam stream ended. Program finished with success!")


def run_color_tracking_stream(lower_bound=LOWER_GREEN, upper_bound=UPPER_GREEN, camera_index=0, show_debug_mask=False):
    """
    Initializes the webcam and runs the main loop for real-time single-color tracking.
    This function is maintained for backward compatibility.

    Args:
        lower_bound (np.array): Lower HSV bound for color detection.
        upper_bound (np.array): Upper HSV bound for color detection.
        camera_index (int): Index of the camera to use for video color detection.
        show_debug_mask (bool): Whether to show the debug mask window (default: False).
    """
    print(f"Starting webcam stream index {camera_index}... Press 'q' to exit.")
    
    # Initialize video capture from the webcam
    cap = cv.VideoCapture(camera_index)

    if not cap.isOpened():
        print("Error: Could not open video stream.")
        return
    
    # Set up kernel for morphological operations (Cleaning up the mask)
    kernel = np.ones((5, 5), np.uint8)

    while True:
        ret, frame = cap.read()
        if not ret:
            print("Error: Could not read frame from video stream.")
            time.sleep(1)  # Wait a moment before retrying again
            continue
    
        # Core CV pipeline for color tracking
        blurred_frame = cv.GaussianBlur(frame, (11, 11), 0)
        hsv_frame = cv.cvtColor(blurred_frame, cv.COLOR_BGR2HSV)

        # Masking and Isolation 
        mask = cv.inRange(hsv_frame, lower_bound, upper_bound)
        mask = cv.erode(mask, kernel, iterations=2)
        mask = cv.dilate(mask, kernel, iterations=2)

        # Contour Detection
        contours, _ = cv.findContours(mask.copy(), cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)

        if len(contours) > 0:
            # Find the largest contour and compute its minimum enclosing circle
            largest_contour = max(contours, key=cv.contourArea)
            
            if cv.contourArea(largest_contour) > 500:  # Minimum area threshold
                x, y, w, h = cv.boundingRect(largest_contour)
                
                # Draw the rectangle and centroid on the frame
                cv.rectangle(frame, (int(x), int(y)), (int(x + w), int(y + h)), (0, 255, 255), 2)
                cv.putText(frame, "Tracking Custom Object", (int(x), int(y) - 10), 
                           cv.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 255), 2)  
        
        # Display the resulting frame
        cv.imshow("Real-Time Color Tracker", frame)
        
        # Optionally show debug mask
        if show_debug_mask:
            cv.imshow("Mask (Debug)", mask)

        # Break the loop on 'q' key press
        if cv.waitKey(1) & 0xFF == ord('q'):
            break
    
    # Release resources i.e. clean up
    cap.release()
    cv.destroyAllWindows()
    print("Webcam stream ended. Program finished with success!")