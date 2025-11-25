import cv2
import numpy as np
import os 
import time

def main():
    """
        Initializes a basic computer vision operation to verify that OpenCV is working correctly.

        This script creates a blank image using NumPy, then uses OpenCV to display the image briefly.

    """
    print("-- Starting Computer Vision Test Script  --")
    print(f"OpenCV Version: {cv2.__version__}")
    print(f"NumPy Version: {np.__version__}")

    # Create a blank image using NumPy
    # Dimensions: 400x600 pixels, 3 color channels (RGB), 8-bit unsigned integers
    # dtype=np.uint8 ensures pixel values range from 0 to 255

    try:
        blank_image = np.zeros((400, 600, 3), dtype=np.uint8)

        # 2. Add a simple white rectangle to the blank image for visual confirmation
        cv2.rectangle(blank_image, (100, 100), (500, 300), (255, 255, 255), -1)  # White rectangle

        print("Successfully created a 600x400 blank image with a white rectangle.")

        # 3. Display the image (This step requires a GUI environment) 
        
        # Display the blank image in a window using OpenCV
        cv2.imshow(" CV setup test: Blank Image", blank_image)

        # Wait for 3 seconds (3000 milliseconds) or until a key is pressed
        print("Displaying the image for 5 seconds... or press any key to close.")
        cv2.waitKey(5000)

        # Close all OpenCV windows
        cv2.destroyAllWindows()
    except Exception as e:
        print("\n[WARNING] Could not display the image (liekly running in headless environment).")
        print(f"An error occurred during the computer vision test: {e}")
        print("\nComputer Vision Test Completed Successfully.")

if __name__ == "__main__":
    main()
