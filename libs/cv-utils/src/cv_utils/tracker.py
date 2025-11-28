import cv2 as cv
import numpy as np
import time

# -- Configuration Constants --
# Default parameters for the tracker
LOWER_GREEN = np.array([35, 100, 50])
UPPER_GREEN = np.array([85, 255, 255])

def run_color_tracking_stream(lower_bound=LOWER_GREEN, upper_bound=UPPER_GREEN, camera_index=0):
    """
    Initializes the webcam and runs the main loop for real-time color tracking.

    Args:
        lower_bound (np.array): Lower HSV bound for color detection.
        upper_bound (np.array): Upper HSV bound for color detection.
        camera_index (int): Index of the camera to use for video color detection.
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
            time.sleep(1) # Wait a monent before retrying again
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
                (x,y,w,h) = cv.boundingRec(largest_contour)
                

                # Draw the circle and centroid on the frame
                cv.rectangle(frame, (int(x), int(y)), (int(x+w), int(y+h)), (0, 255, 255), 2)
                cv.putText(frame, "Tracking Custom Object", (int(x), int(y)-10), cv.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 255), 2)  
        
        # Display the resulting frame
        cv.imshow("Real-Time Color Tracket", frame)
        cv.imshow("Mask (Debug)", mask)

        # Break the loop on 'q' key press
        if cv.waitKey(1) & 0xFF == ord('q'):
            break
    # Release resources i.e. clean up
    cap.release()
    cv.destroyAllWindows()
    print("Webcam stream ended. Program finished with success!.")