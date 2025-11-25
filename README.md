# Python GenAI Monorepo

## Overview

This monorepo is an end-to-end platform for developing, training, and deploying Large Language Models (LLMs) integrated with Computer Vision (CV) applications. It leverages Python, Nx for workspace orchestration, and supports modular development across multiple apps and packages.

Key features:
- LLM and CV integration for multimodal AI workflows
- Modular Nx workspace for scalable development
- Poetry for dependency management
- Pluggable LLM client (OpenAI, Anthropic, Google, etc.)
- Automated testing, linting, and CI/CD pipelines

---

## Project Structure

```
ml-monorepo/
├── apps/
│   └── cv_app/           # Main computer vision + LLM application
│       ├── main.py
│       ├── ...
│   └── project.json      # Nx project configuration
├── packages/
│   └── llm_client/       # Shared LLM client wrapper (generic)
│       ├── client.py
│       ├── ...
├── tests/                # Unit and integration tests
├── .venv/                # Virtual environment (local)
├── README.md
└── ...
```

---

## Quick Start

1. **Install dependencies:**
   ```sh
   cd ml-monorepo
   poetry install
   ```

2. **Set up environment variables:**
   - Copy `.env.example` to `.env` and fill in required values for your chosen LLM provider:
     ```
     LLM_PROVIDER=openai|anthropic|google|custom
     LLM_API_KEY=your-key
     LLM_MODEL=model-name
     ENABLE_LLM=true
     ```

3. **Run the CV+LLM app:**
   ```sh
   npx nx run cv-app
   ```

4. **Run tests:**
   ```sh
   npx nx test cv-app
   ```

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

| Task         | Command                        |
|--------------|-------------------------------|
| Install deps | `poetry install`              |
| Run app      | `npx nx run cv-app`           |
| Test         | `npx nx test cv-app`          |
| Lint         | `npx nx lint cv-app`          |
| Build        | `npx nx build cv-app`         |

---

## Resources

- [Nx Documentation](https://nx.dev)
- [Poetry Documentation](https://python-poetry.org/docs/)
- [OpenAI API](https://platform.openai.com/docs/)
- [Anthropic API](https://docs.anthropic.com/)
- [Google Generative AI](https://ai.google.dev/)

---