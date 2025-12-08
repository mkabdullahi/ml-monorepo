from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import cv2 as cv
import numpy as np
import asyncio
import base64
import json
from typing import Dict, List, Set
from dataclasses import dataclass, asdict
import sys
import os

# Add the libs directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../../libs/cv-utils/src'))

from cv_utils.tracker import COLOR_RANGES, BOX_COLORS
from llm_service import LLMService

app = FastAPI(title="Color Tracker API", version="1.0.0")

# CORS configuration for Angular frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200", "https://*.netlify.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global state
class TrackerState:
    def __init__(self):
        self.is_running = False
        self.enabled_colors: Set[str] = {"Red", "Blue", "Yellow", "Green"}
        self.camera_index = 0
        self.min_area = 500
        self.cap = None
        self.detection_stats: Dict[str, int] = {color: 0 for color in COLOR_RANGES.keys()}
        self.fps = 0

tracker_state = TrackerState()
llm_service = LLMService()

def get_position_label(x, y, w, h, frame_width, frame_height):
    cx = x + w // 2
    cy = y + h // 2
    
    h_label = ""
    if cx < frame_width // 3:
        h_label = "left"
    elif cx > 2 * frame_width // 3:
        h_label = "right"
    else:
        h_label = "center"
        
    v_label = ""
    if cy < frame_height // 3:
        v_label = "top"
    elif cy > 2 * frame_height // 3:
        v_label = "bottom"
    else:
        v_label = ""
        
    if v_label and h_label:
        return f"{v_label}-{h_label}"
    elif v_label:
        return v_label
    else:
        return h_label

@dataclass
class DetectionStats:
    red: int
    blue: int
    yellow: int
    green: int
    fps: float
    is_running: bool

@app.get("/")
async def root():
    return {"message": "Color Tracker API", "version": "1.0.0"}

@app.get("/api/status")
async def get_status():
    """Get current tracker status"""
    return {
        "is_running": tracker_state.is_running,
        "enabled_colors": list(tracker_state.enabled_colors),
        "camera_index": tracker_state.camera_index,
        "min_area": tracker_state.min_area
    }

@app.post("/api/start")
async def start_tracking():
    """Start color tracking"""
    if tracker_state.is_running:
        return {"message": "Tracker already running"}
    
    tracker_state.cap = cv.VideoCapture(tracker_state.camera_index)
    if not tracker_state.cap.isOpened():
        raise HTTPException(status_code=500, detail="Could not open camera")
    
    tracker_state.is_running = True
    return {"message": "Tracker started", "camera_index": tracker_state.camera_index}

@app.post("/api/stop")
async def stop_tracking():
    """Stop color tracking"""
    if not tracker_state.is_running:
        return {"message": "Tracker not running"}
    
    tracker_state.is_running = False
    if tracker_state.cap:
        tracker_state.cap.release()
        tracker_state.cap = None
    
    return {"message": "Tracker stopped"}

@app.post("/api/colors/toggle/{color}")
async def toggle_color(color: str):
    """Toggle a specific color on/off"""
    color = color.capitalize()
    if color not in COLOR_RANGES:
        raise HTTPException(status_code=400, detail=f"Invalid color: {color}")
    
    if color in tracker_state.enabled_colors:
        tracker_state.enabled_colors.remove(color)
        action = "disabled"
    else:
        tracker_state.enabled_colors.add(color)
        action = "enabled"
    
    return {"color": color, "action": action, "enabled_colors": list(tracker_state.enabled_colors)}

@app.get("/api/stats")
async def get_stats():
    """Get detection statistics"""
    stats = DetectionStats(
        red=tracker_state.detection_stats.get("Red", 0),
        blue=tracker_state.detection_stats.get("Blue", 0),
        yellow=tracker_state.detection_stats.get("Yellow", 0),
        green=tracker_state.detection_stats.get("Green", 0),
        fps=tracker_state.fps,
        is_running=tracker_state.is_running
    )
    return asdict(stats)

@app.post("/api/settings")
async def update_settings(min_area: int = 500, camera_index: int = 0):
    """Update tracker settings"""
    tracker_state.min_area = min_area
    
    # If camera index changed and tracker is running, restart with new camera
    if camera_index != tracker_state.camera_index:
        was_running = tracker_state.is_running
        if was_running:
            await stop_tracking()
        
        tracker_state.camera_index = camera_index
        
        if was_running:
            await start_tracking()
    
    return {
        "min_area": tracker_state.min_area,
        "camera_index": tracker_state.camera_index
    }

@app.websocket("/ws/video")
async def video_stream(websocket: WebSocket):
    """WebSocket endpoint for streaming processed video frames"""
    await websocket.accept()
    
    kernel = np.ones((5, 5), np.uint8)
    
    try:
        frame_count = 0
        current_narration = ""
        
        while True:
            if not tracker_state.is_running or tracker_state.cap is None:
                # Send empty frame or status message
                await websocket.send_json({
                    "type": "status",
                    "message": "Tracker not running"
                })
                await asyncio.sleep(0.1)
                continue
            
            ret, frame = tracker_state.cap.read()
            if not ret:
                await websocket.send_json({
                    "type": "error",
                    "message": "Could not read frame"
                })
                await asyncio.sleep(0.1)
                continue
            
            # Process frame with color detection
            blurred_frame = cv.GaussianBlur(frame, (11, 11), 0)
            hsv_frame = cv.cvtColor(blurred_frame, cv.COLOR_BGR2HSV)
            
            # Reset detection stats for this frame
            frame_stats = {color: 0 for color in COLOR_RANGES.keys()}
            detected_objects = []
            
            # Detect each enabled color
            for color_name, ranges in COLOR_RANGES.items():
                if color_name not in tracker_state.enabled_colors:
                    continue
                
                # Create mask for this color
                color_mask = np.zeros(frame.shape[:2], dtype=np.uint8)
                
                for lower_bound, upper_bound in ranges:
                    mask = cv.inRange(hsv_frame, lower_bound, upper_bound)
                    color_mask = cv.bitwise_or(color_mask, mask)
                
                # Clean up the mask
                color_mask = cv.erode(color_mask, kernel, iterations=2)
                color_mask = cv.dilate(color_mask, kernel, iterations=2)
                
                # Contour Detection
                contours, _ = cv.findContours(color_mask.copy(), cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
                
                if len(contours) > 0:
                    for contour in contours:
                        if cv.contourArea(contour) > tracker_state.min_area:
                            x, y, w, h = cv.boundingRect(contour)
                            
                            # Store object info for narration
                            detected_objects.append({
                                "color": color_name,
                                "position": get_position_label(x, y, w, h, frame.shape[1], frame.shape[0])
                            })

                            box_color = BOX_COLORS[color_name]
                            
                            # Draw rectangle and label
                            cv.rectangle(frame, (x, y), (x + w, y + h), box_color, 2)
                            cv.putText(frame, f"{color_name}", (x, y - 10),
                                     cv.FONT_HERSHEY_SIMPLEX, 0.6, box_color, 2)
                            
                            frame_stats[color_name] += 1
            
            # Update global stats
            tracker_state.detection_stats = frame_stats
            
            # Encode frame to base64
            _, buffer = cv.imencode('.jpg', frame, [cv.IMWRITE_JPEG_QUALITY, 80])
            frame_base64 = base64.b64encode(buffer).decode('utf-8')
            
            frame_count += 1
            if frame_count % 90 == 0:  # Every ~3 seconds (assuming 30fps)
                current_narration = await llm_service.generate_narration(detected_objects)

            # Send frame and stats
            await websocket.send_json({
                "type": "frame",
                "data": frame_base64,
                "stats": frame_stats,
                "narration": current_narration,
                "timestamp": asyncio.get_event_loop().time()
            })
            
            # Control frame rate (30 FPS)
            await asyncio.sleep(1/30)
            
    except WebSocketDisconnect:
        print("WebSocket disconnected")
    except Exception as e:
        print(f"Error in video stream: {e}")
        await websocket.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
