# Project Theta

An intelligent study assistant that helps students learn from their course materials through AI-powered analysis and interaction.

## Features (MVP)

- Upload and parse lecture slides (PDF)
- Transcribe audio lectures
- Extract and store text content
- (Coming soon) Chat with class-specific agent
- (Coming soon) Generate summaries and flashcards

## Prerequisites

- Python 3.11 (required for package compatibility)
- Homebrew (for macOS)
- Xcode Command Line Tools
- ffmpeg (for audio processing)

## Setup

1. Install Python 3.11:
```bash
# On macOS with Homebrew
brew install python@3.11
```

2. Install required system dependencies:
```bash
# Install Homebrew if you haven't already
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install required build tools and ffmpeg
brew install cmake pkg-config swig ffmpeg
```

3. Clone the repository:
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
