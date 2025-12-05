# Python GenAI Monorepo

## Overview

This monorepo is an end-to-end platform for developing, training, and deploying Large Language Models (LLMs) integrated with Computer Vision (CV) applications. It features a modern **Angular web dashboard** for real-time color tracking with FastAPI backend. The platform leverages Python, Nx for workspace orchestration, and supports modular development across multiple apps and packages.

Key features:
- **🎨 Web Dashboard** - Modern Angular UI for real-time color tracking with live video streaming
- **🎯 Multi-color object tracking** - Real-time detection and tracking of primary colors (Red, Blue, Yellow, Green)
- **⚡ FastAPI Backend** - High-performance API with WebSocket support for video streaming
- **📊 Live Statistics** - Real-time detection counts, FPS monitoring, and interactive controls
- **🔧 LLM and CV integration** - Ready for multimodal AI workflows
- **📦 Modular Nx workspace** - Scalable development with Python and TypeScript
- **🐍 Poetry for dependency management** - Consistent Python environments
- **🔌 Pluggable LLM client** - Support for OpenAI, Anthropic, Google, etc.
- **✅ Automated testing, linting, and CI/CD pipelines**

---

## Project Structure

```
ml-monorepo/
├── apps/
│   ├── color-tracker-ui/      # Angular web dashboard (NEW!)
│   │   ├── src/app/
│   │   │   ├── components/    # Video display, controls, stats
│   │   │   └── services/      # API client, WebSocket
│   │   └── ...
│   ├── cv-api/                # FastAPI backend (NEW!)
│   │   ├── api_server.py      # WebSocket + REST API
│   │   └── pyproject.toml
│   └── cv-app/                # CLI color tracking application
│       ├── main.py            # Main entry point
│       └── ...
├── libs/
│   └── cv-utils/              # Shared computer vision utilities
│       └── src/
│           └── cv_utils/
│               └── tracker.py  # Color tracking implementation
├── tests/                     # Unit and integration tests
├── Dockerfile                 # Docker configuration
├── LICENSE                    # MIT License
├── README.md
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
npx nx serve color-tracker-ui
```

#### Open Browser
Navigate to **http://localhost:4200**

**Features:**
- 🎥 Live video streaming with detection overlays
- 🎛️ Interactive controls (Start/Stop, color toggles)
- 📊 Real-time statistics dashboard
- ⚙️ Adjustable settings (detection area, camera selection)

---

### Option 2: CLI Application

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

3. **Run the multi-color tracker:**
   ```sh
   poetry run python -m cv-app.main
   ```
   
   The application will:
   - Open your webcam
   - Detect objects in **Red, Blue, Yellow, and Green**
   - Draw colored bounding boxes around each detected object
   - Display the color name above each box
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

## LLM Integration

- The repo supports a generic LLM client in `packages/llm_client/client.py`.
- Select your provider via the `LLM_PROVIDER` environment variable.
- API keys and model names are required and should be stored securely (never committed).

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
- Contributions welcome! Please submit PRs with clear descriptions and tests.

---

## Testing & CI

- Unit and integration tests are in `tests/`.
- CI/CD is managed via Nx and GitHub Actions.
- Secrets for integration tests must be set in CI environment.

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