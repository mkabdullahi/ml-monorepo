  # Agent Specifications

This document outlines the specifications for all relevant agents in the ML monorepo, which integrates computer vision, large language models, and multi-platform interfaces for real-time object detection and tracking.

## Overview

The system consists of multiple specialized agents that work together to provide end-to-end computer vision and AI capabilities across web, mobile, and desktop platforms.

## 1. Color Tracking Agent

### Purpose

Real-time detection and tracking of primary colors (Red, Blue, Yellow, Green) in video streams using computer vision algorithms.

### Capabilities

- __Multi-color Detection__: Simultaneously tracks 4 primary colors using HSV color space
- __Real-time Processing__: Processes video frames at 30 FPS
- __Noise Reduction__: Applies Gaussian blur, morphological operations (erosion/dilation)
- __Bounding Box Rendering__: Draws colored rectangles around detected objects with labels
- __Configurable Thresholds__: Adjustable minimum contour area (default: 500 pixels)
- __Debug Mode__: Optional mask visualization for development

### Technical Specifications

- __Input__: Video frames from camera/webcam
- __Output__: Annotated video frames with bounding boxes and color labels
- __Algorithm__: HSV color range filtering + contour detection
- __Dependencies__: OpenCV, NumPy
- __Location__: `libs/cv-utils/src/cv_utils/tracker.py`

### API Interface

```python
run_multi_color_tracking_stream(
    camera_index=0,
    show_debug_mask=False,
    min_area=500
)
```

### Performance Metrics

- __Frame Rate__: 30 FPS
- __Accuracy__: HSV-based color detection with morphological cleanup
- __Resource Usage__: CPU-bound, optimized for real-time processing

## 2. Object Detection Agent

### Purpose

General-purpose object detection and classification using YOLOv8 neural network for identifying and labeling objects in video streams.

### Capabilities

- __Object Classification__: Detects 80+ COCO dataset classes
- __Confidence Scoring__: Provides confidence scores for each detection
- __Bounding Box Generation__: Precise rectangular coordinates for detected objects
- __Real-time Inference__: Optimized YOLOv8n model for speed
- __Visual Annotation__: Colored bounding boxes with class labels and confidence scores

### Technical Specifications

- __Model__: YOLOv8 Nano (yolov8n.pt)
- __Input__: RGB video frames
- __Output__: Annotated frames with detection metadata
- __Confidence Threshold__: 0.5 (configurable)
- __Dependencies__: ultralytics YOLO, OpenCV, NumPy
- __Location__: `libs/od-models/src/od_models/object_dectation_tracker.py`

### API Interface

```python
detect_and_draw(frame: np.ndarray) -> np.ndarray
```

### Performance Metrics

- __Inference Speed__: ~20-50ms per frame (depending on hardware)
- __mAP__: YOLOv8 native performance
- __Classes__: 80 COCO classes (person, car, dog, etc.)

## 3. Narration Agent

### Purpose

Generates natural language descriptions of visual scenes using large language models, designed for accessibility and enhanced user experience.

### Capabilities

- __Scene Description__: Converts detected objects into coherent narratives
- __Accessibility Support__: Designed for users with visual impairments
- __Contextual Awareness__: Considers object positions and colors in descriptions
- __Creative Narration__: Generates engaging, concise descriptions
- __Fallback Mode__: Template-based responses when LLM unavailable
- __Multi-provider Support__: Extensible to OpenAI, Anthropic, Google Gemini

### Technical Specifications

- __Primary Provider__: Google Gemini 2.0 Flash
- __Input__: List of detected objects with color and position metadata
- __Output__: Natural language scene description (max 51 tokens)
- __Temperature__: 0.3 (balanced creativity/consistency)
- __System Prompt__: "You are a helpful narrator for a blind user. Describe the scene briefly, using simple and direct language."
- __Dependencies__: aiohttp, asyncio
- __Location__: `apps/cv-api/llm_service.py`

### API Interface

```python
async def generate_narration(valid_objects: List[Dict]) -> str
```

### Performance Metrics

- __Response Time__: ~1-3 seconds per narration
- __Token Limit__: 51 tokens maximum
- __Reliability__: Graceful fallback to mock responses

## 4. API Gateway Agent

### Purpose

Provides REST and WebSocket APIs for controlling computer vision operations, streaming processed video, and managing system state.

### Capabilities

- __Video Streaming__: Real-time WebSocket video feed with annotations
- __Control Interface__: Start/stop tracking, toggle colors, adjust settings
- __Statistics Endpoint__: Real-time detection counts and performance metrics
- __CORS Support__: Configured for Angular frontend and mobile apps
- __State Management__: Global tracker state with thread-safe operations
- __Narration Integration__: Periodic LLM-generated scene descriptions

### Technical Specifications

- __Framework__: FastAPI with async support

- __Endpoints__:

  - `GET /api/status`: Current tracker configuration
  - `POST /api/start`: Initiate tracking
  - `POST /api/stop`: Halt tracking
  - `POST /api/colors/toggle/{color}`: Enable/disable color detection
  - `GET /api/stats`: Detection statistics
  - `POST /api/settings`: Update parameters
  - `WS /ws/video`: Real-time annotated video stream

- __WebSocket Features__: Base64-encoded frames, detection stats, narration

- __Dependencies__: FastAPI, OpenCV, NumPy, aiohttp

- __Location__: `apps/cv-api/api_server.py`

### Performance Metrics

- __Concurrent Connections__: Supports multiple WebSocket clients
- __Frame Rate__: 30 FPS streaming
- __Latency__: <100ms for REST operations

## 5. Web Dashboard Agent

### Purpose

Modern Angular-based user interface for real-time visualization and control of computer vision operations.

### Capabilities

- __Live Video Display__: Real-time streaming with detection overlays
- __Interactive Controls__: Start/stop, color toggles, camera selection
- __Statistics Dashboard__: Live detection counts and FPS monitoring
- __Narration Display__: LLM-generated scene descriptions
- __Responsive Design__: Works on desktop and tablet devices
- __Real-time Updates__: WebSocket integration for live data

### Technical Specifications

- __Framework__: Angular 17+ with Nx workspace

- __Components__:

  - `app-video-display`: Video streaming component
  - `app-control-panel`: Interactive controls
  - `app-stats-dashboard`: Statistics visualization
  - `app-narrator`: Narration display

- __Styling__: CSS with gradient backgrounds and modern UI

- __Dependencies__: Angular, RxJS, WebSocket API

- __Location__: `apps/color-tracker-ui/`

### API Integration

- __Backend Connection__: `ws://localhost:8000/ws/video`
- __Control Endpoints__: REST API calls to `/api/*`
- __CORS Origin__: `http://localhost:4200`

## 6. Mobile Camera Agent

### Purpose

React Native application that uses device camera for remote computer vision processing via backend API.

### Capabilities

- __Device Camera Access__: iOS camera with front/back switching
- __Remote Processing__: Streams to FastAPI backend for CV processing
- __WebSocket Integration__: Real-time connection status and data
- __Cross-platform__: iOS/Android support via Expo
- __Offline Handling__: Graceful connection management

### Technical Specifications

- __Framework__: React Native with Expo Camera
- __Permissions__: Camera access with user consent
- __WebSocket URL__: `ws://localhost:8000/ws` (configurable for local IP)
- __UI Components__: Camera view, status overlay, control buttons
- __Styling__: Gradient background matching web dashboard
- __Location__: `apps/mobile/`

### Performance Considerations

- __Network Dependency__: Requires WiFi connection to backend
- __Battery Impact__: Continuous camera and network usage
- __Platform Support__: iOS primary, Android compatible

## 7. Cross-Platform Tracker Agent

### Purpose

Flutter application providing native cross-platform computer vision capabilities for mobile and desktop.

### Capabilities

- __Native Performance__: Platform-specific optimizations
- __Camera Integration__: Device camera access across platforms
- __Multi-platform__: iOS, Android, Windows, macOS, Linux
- __UI Consistency__: Material Design with custom theming
- __Backend Integration__: Connects to FastAPI for advanced processing

### Technical Specifications

- __Framework__: Flutter with Dart
- __Platforms__: iOS, Android, Desktop (Windows/macOS/Linux)
- __Camera Plugin__: Platform-specific camera implementations
- __Dependencies__: Flutter SDK, platform channels
- __Location__: `apps/color_tracker/`

### Architecture

- __State Management__: Provider pattern for app state
- __Platform Channels__: Native code integration for camera access
- __UI Components__: Camera preview, controls, status indicators

## Integration Patterns

### Agent Communication

- __API Gateway__ serves as central hub for all agents
- __WebSocket__ for real-time video and data streaming
- __REST APIs__ for control and configuration
- __Shared Libraries__ (`cv-utils`, `od-models`) for consistent CV operations

### Data Flow

1. __Input Agents__ (Mobile, Flutter) capture video
2. __Processing Agents__ (Color Tracking, Object Detection) analyze frames
3. __Enhancement Agent__ (Narration) adds contextual descriptions
4. __Output Agents__ (Web Dashboard, API Gateway) present results

### Deployment Options

- __Monolithic__: All agents in single container (Docker)
- __Microservices__: Separate containers per agent
- __Edge__: Mobile agents with local processing
- __Cloud__: API Gateway with scalable backend

## Future Agent Extensions

### Potential Additions

- __Gesture Recognition Agent__: Detect and interpret hand gestures
- __Face Analysis Agent__: Facial recognition and emotion detection
- __Scene Understanding Agent__: Advanced scene parsing with GPT-4V
- __Action Prediction Agent__: Anticipate object movements
- __Multi-modal Agent__: Combine audio, video, and text inputs

### Integration Opportunities

- __IoT Integration__: Connect with smart cameras and sensors
- __AR/VR Support__: Augmented reality overlays
- __Robotics Control__: Computer vision for autonomous systems
- __Analytics Agent__: Long-term pattern analysis and reporting <task_progress>
- [x] Read AGENTS.md for existing agent definitions
- [x] Explore monorepo structure (apps, libs)
- [x] Analyze key components and functionalities
- [x] Identify potential agents
- [x] Generate specifications for each agent
- [x] Output/update agent specs
