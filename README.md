# Project Theta

An intelligent study assistant that helps students learn from their course materials through AI-powered analysis and interaction.

---

## Troubleshooting

### Python ImportError: cannot import name 'str' from 'typing'

**Error Message:**
```
ImportError: cannot import name 'str' from 'typing' (/usr/lib/python3.10/typing.py)
```

**Fix:**
- Remove the line `from typing import str` from your code.
- Use the built-in `str` type directly in your type hints.

### shadcn/ui or Tailwind issues
- If you see `Module not found: Error: Can't resolve '@ui/button'`, make sure you have the component files in `src/components/ui/`.
- If the shadcn CLI does not work, copy component code from https://ui.shadcn.com/docs/components.
- For Tailwind issues, ensure `tailwind.config.js` exists and is referenced in your project.

### Node or Python version issues
- Use Node.js 18+ for best compatibility with shadcn and Tailwind.
- Use Python 3.11 for backend.

---

## Features (MVP)

- Upload and parse lecture slides (PDF)
- Transcribe audio lectures
- Extract and store text content
- Search uploaded content with semantic search
- Modern, responsive UI with shadcn/ui and Tailwind
- (Coming soon) Chat with class-specific agent
- (Coming soon) Generate summaries and flashcards

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
