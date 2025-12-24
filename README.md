# ML Monorepo: Computer Vision & Multimodal AI Platform

## Overview

This monorepo is an end-to-end platform for computer vision and AI applications, integrating multiple detection modalities with modern web and mobile interfaces. It features **multi-modal detection** (color tracking + object detection), **LLM-powered narration**, and **cross-platform interfaces** for real-time video processing.

Key features:
- **🔍 Multi-Modal Detection** - Color tracking (Red, Blue, Yellow, Green) + Object detection (YOLOv8, MobileNet SSD)
- **🌐 Web Dashboard** - Modern Angular UI for real-time video streaming and control
- **📱 Cross-Platform App** - Flutter app for iOS/Android/Desktop with live video processing
- **⚡ FastAPI Backend** - High-performance API with WebSocket streaming and REST controls
- **🎤 AI Narration** - LLM-generated scene descriptions using Google Gemini
- **📊 Live Analytics** - Real-time detection stats, FPS monitoring, and performance metrics
- **🖥️ CLI Tools** - Local computer vision applications for development
- **📦 Modular Architecture** - Nx workspace with Python and TypeScript components
- **🐍 Poetry Dependency Management** - Consistent Python environments
- **🔧 Extensible LLM Integration** - Support for OpenAI, Anthropic, Google, etc.

---

## Project Structure

```
ml-monorepo/
├── apps/
│   ├── cv-api/                # FastAPI backend server
│   │   ├── api_server.py      # WebSocket + REST API
│   │   ├── llm_service.py      # AI narration service
│   │   └── pyproject.toml
│   ├── object-detection-ui/   # Angular web dashboard
│   │   ├── src/app/components/ # Video display, controls, stats
│   │   └── src/app/services/   # API client, WebSocket
│   ├── color_tracker/         # Flutter cross-platform app
│   │   ├── lib/main.dart       # Material Design UI
│   │   └── pubspec.yaml
│   └── cv-app/                # Python CLI application
│       └── main.py             # Local object detection
├── libs/
│   ├── cv-utils/              # Color tracking utilities
│   │   └── src/cv_utils/tracker.py
│   └── od-models/             # Object detection models
│       └── src/od_models/
│           ├── object_detection_tracker.py  # YOLOv8
│           └── mobilenet_ssd_detector.py     # MobileNet SSD
├── tests/                     # Unit and integration tests
├── Dockerfile                 # Container deployment
├── AGENTS.md                  # Agent specifications
└── ...
```

---

## Quick Start

### Option 1: Web Dashboard (Recommended)

**Modern Angular UI with real-time video streaming**

#### Terminal 1: Start Backend API
```sh
cd apps/cv-api
poetry install
poetry run uvicorn api_server:app --reload
```

#### Terminal 2: Start Frontend
```sh
# From monorepo root
npx nx serve object-detection-ui
```

#### Open Browser
Navigate to **http://localhost:4200**

**Features:**
- 🎥 Live video streaming with detection overlays
- 🎛️ Interactive controls (Start/Stop, color toggles)
- 📊 Real-time statistics dashboard
- ⚙️ Adjustable settings (detection area, camera selection)

---

---

### Option 2: Cross-Platform Flutter App

**Native app for iOS, Android, Windows, macOS, and Linux**

1. **Start the Backend**:
   (Follow 'Terminal 1' steps from Option 1 above)

2. **Run the Flutter App**:
   ```sh
   cd apps/color_tracker
   flutter pub get
   flutter run
   ```

   Or for development with hot reload:
   ```sh
   flutter run --debug
   ```

**Features:**
- 📱 Native performance across all platforms
- 🎥 Real-time video streaming from device camera
- 📊 Live detection statistics and AI narration
- 🎛️ Start/stop tracking controls
- 🔄 WebSocket integration with backend API

**Platform-Specific Setup:**
- **iOS**: `flutter run -d ios`
- **Android**: `flutter run -d android`
- **Desktop**: `flutter run -d macos` (or `windows`, `linux`)

---

### Option 3: CLI Application

**Traditional OpenCV window-based interface**

1. **Set Python version:**
   ```sh
   cd ml-monorepo/apps
   pyenv local 3.10.14  # or your preferred 3.10.x version
   ```

2. **Install dependencies:**
   ```sh
   # Create virtual environment
   python -m venv .venv
   source .venv/bin/activate
   
   # Install with Poetry
   poetry install
   ```

3. **Run the object detection application:**
   ```sh
   poetry run python -m cv-app.main
   ```

   The application will:
   - Open your webcam
   - Detect objects using **YOLOv8** neural network
   - Draw bounding boxes around detected objects (80+ classes)
   - Display class names and confidence scores
   - Press `q` to quit

4. **Run tests:**
   ```sh
   npx nx test cv-app
   ```

### Docker Deployment

1. **Build the Docker image:**
   ```sh
   docker build -t cv-tracker:latest .
   ```

2. **Run with Docker:**
   ```sh
   # For systems with X11 (Linux)
   docker run -it --rm \
     --device=/dev/video0 \
     -e DISPLAY=$DISPLAY \
     -v /tmp/.X11-unix:/tmp/.X11-unix \
     cv-tracker:latest
   
   # For macOS (requires XQuartz)
   # Install XQuartz first: brew install --cask xquartz
   # Then allow connections: xhost +localhost
   docker run -it --rm \
     --device=/dev/video0 \
     -e DISPLAY=host.docker.internal:0 \
     cv-tracker:latest
   ```

---

## Computer Vision Features

### Multi-Color Detection

The application uses OpenCV to detect and track objects of primary colors in real-time:

- **Red** - Detected with red bounding box
- **Blue** - Detected with blue bounding box  
- **Yellow** - Detected with yellow bounding box
- **Green** - Detected with green bounding box

**Technical Details:**
- Uses HSV color space for robust color detection
- Morphological operations (erosion/dilation) to reduce noise
- Contour detection with minimum area threshold (500 pixels)
- Handles red color wraparound in HSV spectrum

**Customization:**
Edit `libs/cv-utils/src/cv_utils/tracker.py` to:
- Adjust HSV color ranges for different lighting conditions
- Change minimum detection area threshold
- Enable debug mask view: `run_multi_color_tracking_stream(show_debug_mask=True)`

---

## AI & Multimodal Features

### LLM-Powered Narration
- **Scene Descriptions**: AI-generated natural language descriptions of detected scenes
- **Accessibility**: Designed for users with visual impairments
- **Provider Support**: Google Gemini 2.0 Flash with extensible architecture for OpenAI, Anthropic
- **Smart Timing**: Narration updates based on detection mode and frame rate
- **Fallback Mode**: Graceful degradation when LLM unavailable

### Multi-Modal Detection Modes
The system supports three detection modes that can be switched dynamically:

1. **Color Tracking**: HSV-based detection of primary colors (Red, Blue, Yellow, Green)
2. **Object Detection (MobileNet SSD)**: Fast detection of 20 COCO classes
3. **Object Detection (YOLOv8)**: Accurate detection of 80+ COCO classes

**Mode Selection**: Switch between modes via API or web interface for different use cases.

---

## Environment Variables

| Variable      | Description                                 |
|---------------|---------------------------------------------|
| LLM_PROVIDER  | LLM provider (e.g., openai, anthropic, etc) |
| LLM_API_KEY   | API key for the selected provider           |
| LLM_MODEL     | Model name (e.g., gpt-4, gemini-pro, etc)   |
| ENABLE_LLM    | Enable LLM integration (true/false)         |

See `.env.example` for details.

---

## Development & Contribution

- Use Poetry for dependency management.
- Use Nx for running, building, and testing apps.
- Lint code with:
  ```sh
  npx nx lint cv-app
  ```
- Run E2E tests for the Angular dashboard:
  ```sh
  npx nx e2e object-detection-ui
  ```
- Contributions welcome! Please submit PRs with clear descriptions and tests.

---

## Testing & CI

### Unit Tests
- Unit and integration tests are in `tests/`.
- Run Python tests: `cd apps && poetry run pytest`
- Run Angular unit tests: `npx nx test object-detection-ui`

### E2E Tests
- Comprehensive Cypress e2e tests for the Angular dashboard
- Tests cover UI interactions, API integration, and user workflows
- Includes WebSocket simulation and multi-modal detection validation

```bash
# Run e2e tests
npx nx e2e object-detection-ui

# Run in interactive mode
npx nx e2e object-detection-ui --watch

# Run in CI mode
npx nx e2e object-detection-ui --configuration=ci
```

**E2E Test Coverage:**
- ✅ Dashboard UI and component interactions
- ✅ API endpoint integration and error handling
- ✅ Real-time WebSocket communication
- ✅ Multi-modal detection mode switching
- ✅ AI narration display and updates
- ✅ Cross-browser compatibility (Chrome, Firefox, Electron)
- ✅ Performance and accessibility validation

### CI/CD
- Automated testing via GitHub Actions (`.github/workflows/ci-e2e.yml`)
- Multi-browser testing with parallel execution
- Test recording and artifact upload on failures
- Performance monitoring with Lighthouse audits
- Secrets management for integration tests

---

## Security

- Never commit API keys or sensitive data.
- Use `.env` for local secrets and GitHub Secrets for CI.

---

## Useful Commands

| Task              | Command                                    |
|-------------------|--------------------------------------------|
| Install deps      | `cd apps && poetry install`                |
| Run app (local)   | `cd apps && poetry run python -m cv-app.main` |
| Run app (Nx)      | `npx nx run cv-app`                        |
| Test              | `npx nx test cv-app`                       |
| Lint              | `npx nx lint cv-app`                       |
| Build Docker      | `docker build -t cv-tracker:latest .`      |
| Run Docker        | `docker run -it --rm --device=/dev/video0 -e DISPLAY=$DISPLAY -v /tmp/.X11-unix:/tmp/.X11-unix cv-tracker:latest` |
| Rebuild Docker    | `docker build --no-cache -t cv-tracker:latest .` |

---

## Updating Docker Image

When you add new features or update code:

1. **Rebuild the image** (with cache for faster builds):
   ```sh
   docker build -t cv-tracker:latest .
   ```

2. **Force rebuild** (without cache, if dependencies changed):
   ```sh
   docker build --no-cache -t cv-tracker:latest .
   ```

3. **Tag with version** (recommended for production):
   ```sh
   docker build -t cv-tracker:v1.1.0 -t cv-tracker:latest .
   ```

4. **Verify the new image**:
   ```sh
   docker images | grep cv-tracker
   ```

5. **Run the updated image**:
   ```sh
   docker run -it --rm \
     --device=/dev/video0 \
     -e DISPLAY=$DISPLAY \
     -v /tmp/.X11-unix:/tmp/.X11-unix \
     cv-tracker:latest
   ```

**Note:** The Docker image includes all your latest code changes. Simply rebuild to update!

---

## Resources

- [Nx Documentation](https://nx.dev)
- [Poetry Documentation](https://python-poetry.org/docs/)
- [OpenAI API](https://platform.openai.com/docs/)
- [Anthropic API](https://docs.anthropic.com/)
- [Google Generative AI](https://ai.google.dev/)

---

## License

MIT License

Copyright (c) 2025 Color Tracker Project

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

---
