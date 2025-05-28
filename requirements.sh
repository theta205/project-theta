#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Installing Python dependencies...${NC}"
pip install boto3==1.34.34
pip install python-dotenv==1.0.1
pip install openai==1.12.0
pip install chromadb==0.4.22
pip install numpy==1.24.3
pip install pymupdf==1.23.26
pip install langchain==0.1.9
pip install tiktoken==0.6.0
pip install pydantic==2.6.1
pip install openai-whisper==20231117

echo -e "${BLUE}Installing backend Node.js dependencies...${NC}"
cd backend
npm install aws-sdk@2.1550.0
npm install cors@2.8.5
npm install dotenv@16.4.1
npm install express@4.18.2
npm install multer@1.4.5-lts.1
npm install uuid@9.0.1
npm install nodemon@3.0.3 --save-dev
pip install boto3
cd ..

echo -e "${BLUE}Installing frontend dependencies (React, Tailwind, shadcn/ui)...${NC}"
cd frontend
npm install
# Tailwind and shadcn/ui dependencies should be in package.json
# If shadcn CLI fails, add component files manually to src/components/ui/
cd ..

echo -e "${GREEN}All dependencies installed successfully!${NC}"
