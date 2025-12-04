from cv_utils.tracker import run_multi_color_tracking_stream

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
        run_multi_color_tracking_stream(camera_index=0)
    except Exception as e:
        print(f"An error occurred during the color tracking operation: {e}")
        print("Color Tracking Application Terminated.")

if __name__ == "__main__":
    main()