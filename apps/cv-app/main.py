import cv2 as cv
import sys
import time

# from cv_utils.tracker import run_multi_color_tracking_stream
from od_models.object_dectation_tracker import detect_and_draw


def run_object_detection_stream(camera_index=0):
    """
    Initializes the webcam stream and runs the main loop for the real-time
    object detection using the library
    """
    print("Initializing Camera Stream...")

    # Initialize video capture from the specified webcam index
    cap = cv.VideoCapture(camera_index)

    if not cap.isOpened():
        print("Error: Could not open video stream. Check camera permission/index")
        sys.exit(1)
    
    while True:
        # Read a frame from the webcam
        ret, frame, = cap.read()

        if not ret:
            print("Error: Failed to read frame from webcam")
            time.sleep(1)
            continue
        # Call the detect_and_draw function
        processed_frame = detect_and_draw(frame)

        # Display the result
        cv.imshow("Real-Time Object Detection (YOLOv8)", processed_frame)

        # Break the loop if the q key is pressed
        if cv.waitKey(1) & 0xFF == ord('q'):
            break 
    # Cleanup
    cap.release()
    cv.destroyAllWindows()
    print("Webcam released. Stream finished. ")



def main():
    """
    Main function to run the multi-color tracking application.

    This script utilizes the cv-utils library to perform real-time color tracking
    using OpenCV. It tracks objects of primary colors (Red, Blue, Yellow, Green)
    in a video stream and displays each with a matching colored bounding box.
    """
    print("-- Starting Multi-Color Tracking Application --")
    try:
        # Start the multi-color tracking stream
        #run_multi_color_tracking_stream(camera_index=0)
        run_object_detection_stream(camera_index=0)
    except Exception as e:
        print(f"An error occurred during the color tracking operation: {e}")
        print("Color Tracking Application Terminated.")

if __name__ == "__main__":
    main()