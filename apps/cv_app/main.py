from cv_utils.tracker import run_color_tracking_stream, LOWER_GREEN, UPPER_GREEN

def main():
    """
        Main function to run the color tracking application.

        This script utilizes the cv-utils library to perform real-time color tracking
        using OpenCV. It tracks objects of a specified color range in a video stream.
    """
    print("-- Starting Color Tracking Application --")
    try:
        # Start the color tracking stream
        run_color_tracking_stream(lower_bound=LOWER_GREEN, upper_bound=UPPER_GREEN, camera_index=0)
    except Exception as e:
        print(f"An error occurred during the color tracking operation: {e}")
        print("Color Tracking Application Terminated.")
if __name__ == "__main__":
    main()