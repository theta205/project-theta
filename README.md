# Project Theta

Project Theta is an intelligent study assistant that helps students learn from their course materials through AI-powered analysis and interaction. It provides a seamless experience for uploading, parsing, searching, and interacting with lecture materials.

---

## Table of Contents
- [Features](#features)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Setup & Installation](#setup--installation)
- [Usage](#usage)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

---

## Features

### Core Capabilities
- **Upload and Parse Documents:** Supports PDF, DOCX, PPTX, TXT, and more (see backend/supported_filetypes.js).
- **Audio Transcription:** Upload audio lectures and transcribe with Whisper.
- **Text Extraction:** Extracts and stores text and metadata from documents.
- **Semantic Search:** Search across all uploaded materials using vector embeddings (ChromaDB).
- **Modern UI:** Built with React, shadcn/ui, and Tailwind CSS.
- **Class & Topic Tagging:** Organize files by class and topic.
- **Cloud Storage:** Files and metadata stored in AWS S3 and DynamoDB.
- **Authentication:** User authentication via Clerk.
- **Robust API:** REST endpoints for upload, search, and health check.
- **Test Suite:** Python and JS tests for parsers and backend.
- **(Coming Soon)** Chat with class-specific agent, summaries, and flashcards.

---

## Architecture

- **Frontend:** React app (frontend/) with shadcn/ui and Tailwind. Handles upload, search, and result display.
- **Backend:** Node.js Express API (backend/) for file handling, parsing orchestration, and integration with AWS/ChromaDB.
- **Parsers:** Python scripts (src/parsers/) for PDF, audio, and other document types. Includes conversion utilities.
- **Storage:**
  - **AWS S3:** Stores uploaded files.
  - **DynamoDB:** Stores file metadata and user associations.
  - **ChromaDB:** Vector database for semantic search.

### Main Components
- **/frontend**: React UI, file upload, search, authentication.
- **/backend**: Express server, REST API, file processing, AWS/ChromaDB integration.
- **/src/parsers**: Python scripts for parsing/conversion.
- **/src/storage**: FileStore abstraction for local/cloud storage.
- **/src/utils**: Utilities (e.g., AWS helpers, text cleaning).
- **/tests**: Unit tests for parsers and backend.

---

## Project Structure

```
project-theta/
├── backend/             # Node.js Express backend
│   ├── src/
│   ├── package.json
│   └── ...
├── frontend/            # React frontend
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
├── src/
│   ├── parsers/         # PDF, audio, and other parsers
│   ├── storage/         # FileStore abstraction
│   ├── utils/           # Utility scripts
│   └── ...
├── tests/               # Test suites
├── requirements.txt     # Python dependencies
├── package.json         # Project-level Node dependencies
├── .env / .env.example  # Environment configs
└── README.md
```

---

## Setup & Installation

### Prerequisites
- Python 3.11
- Node.js 18+
- npm
- ffmpeg (for audio)
- LibreOffice & unoconv (for document conversion)
- AWS credentials (for S3/DynamoDB)

### 1. Clone and Prepare
```bash
git clone https://github.com/yourusername/project-theta.git
cd project-theta
```

### 2. Python Environment
```bash
python3.11 -m venv .venv
source .venv/bin/activate  # On Unix/macOS
# or
.venv\Scripts\activate    # On Windows
pip install --upgrade pip setuptools wheel
pip install -r requirements.txt
```

### 3. Node/Frontend Setup
```bash
cd frontend
npm install
```

### 4. Backend Setup
```bash
cd ../backend
npm install
```

### 5. System Dependencies
- **macOS:**
  ```bash
  brew install --cask libreoffice
  brew install unoconv ffmpeg
  ```
- **Linux:**
  ```bash
  sudo apt install libreoffice unoconv ffmpeg
  ```

### 6. Environment Variables
```bash
cp .env.example .env
# Edit .env and add your AWS and Clerk credentials
```

---

## Usage

### Start Backend
```bash
cd backend
npm run dev
```

### Start Frontend
```bash
cd ../frontend
npm start
```

### Run Parsers/Utilities
- **Convert to PDF:**
  ```bash
  python src/parsers/convert_to_pdf.py <input_file> [output_dir]
  ```
- **Parse PDF:**
  ```bash
  python src/parsers/pdf_parser.py <pdf_file_path>
  ```
- **Transcribe Audio:**
  ```bash
  python src/parsers/audio_parser.py <audio_file_path>
  ```

---

## REST API Endpoints (Backend)
- `POST /api/upload` — Upload and parse a file
- `POST /api/search` — Semantic search over user’s files
- `GET /api/health` — Health check

---

## Troubleshooting

- **Python ImportError:**
  - Remove `from typing import str` and use built-in `str`.
- **shadcn/ui or Tailwind:**
  - Ensure component files and config exist. Copy components from [shadcn/ui docs](https://ui.shadcn.com/docs/components) if needed.
- **Node/Python Version:**
  - Use Node.js 18+ and Python 3.11 for best results.
- **AWS Issues:**
  - Check credentials and permissions for S3/DynamoDB.

---

## Contributing

1. Fork the repo and create a feature branch.
2. Follow code style for Python (PEP8) and JS (Prettier/ESLint).
3. Add/modify tests in `/tests`.
4. Open a pull request with a clear description.

---

## License

MIT License. See [LICENSE](LICENSE) for details.

---

## Credits
- [shadcn/ui](https://ui.shadcn.com/)
- [ChromaDB](https://www.trychroma.com/)
- [Whisper](https://github.com/openai/whisper)
- [Clerk](https://clerk.com/)
- [Tailwind CSS](https://tailwindcss.com/)

---

For questions or support, open an issue or contact the maintainer.

## Prerequisites

- Python 3.11 (required for package compatibility)
- Node.js 18+ and npm (for frontend)
- Homebrew (for macOS)
- Xcode Command Line Tools
- ffmpeg (for audio processing)

## Setup

### 1. Install Python 3.11:
```bash
# On macOS with Homebrew
brew install python@3.11
```

### 2. Install required system dependencies:
```bash
# Install Homebrew if you haven't already
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install required build tools and ffmpeg
brew install cmake pkg-config swig ffmpeg
```

### 3. Clone the repository:
```bash
git clone https://github.com/yourusername/project-theta.git
cd project-theta
```

4. Create and activate a virtual environment:
```bash
# Create virtual environment with Python 3.11
python3.11 -m venv .venv

# Activate the virtual environment
source .venv/bin/activate  # On Unix/macOS
# or
.venv\Scripts\activate  # On Windows
```

5. Install Python dependencies:
```bash
# Upgrade pip and install build tools
python3 -m pip install --upgrade pip setuptools wheel

# Install project dependencies
pip install -r requirements.txt
```

6. Set up environment variables:
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your configuration
# (Add your API keys and other settings)
```

## Project Structure

## Installation

### Python Dependencies
1. Create and activate a virtual environment:
```bash
python3 -m venv .venv
source .venv/bin/activate
```

2. Install Python packages:
```bash
pip install -r requirements.txt
```

### System Dependencies
For PDF and document processing, you'll need to install some system dependencies:

#### macOS
```bash
# Install LibreOffice
brew install --cask libreoffice

# Install unoconv
brew install unoconv
```

#### Linux
```bash
# Install LibreOffice and unoconv
sudo apt install unoconv libreoffice
```

## Usage
