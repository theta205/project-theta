#!/bin/bash

set -e  # Stop on first error

echo "🔧 Setting up Python environment..."
python3 -m venv pymupdf-venv
. pymupdf-venv/bin/activate
python -m pip install --upgrade pip
./requirements.sh
echo "✅ Python dependencies installed."

echo "📦 Installing npm dependencies for backend..."
cd backend
npm install
cd ..

echo "📦 Installing npm dependencies for frontend..."
cd frontend
npm install
cd ..

echo "🎉 All dependencies installed successfully!"
