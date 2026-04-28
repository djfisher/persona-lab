#!/bin/bash
cd "$(dirname "$0")"

echo "=========================================="
echo "Starting Persona Research Lab..."
echo "=========================================="

# Check if npm is installed
if ! command -v npm &> /dev/null
then
    echo "ERROR: Node.js (npm) is not installed."
    echo "Please read HOW_TO_RUN.txt and install Node.js first from https://nodejs.org/"
    echo ""
    read -p "Press any key to exit..."
    exit 1
fi

echo "Step 1: Installing required files (this may take a minute)..."
npm install

echo ""
echo "Step 2: Launching the app in your browser..."
echo "(Keep this window open while using the app. Close it to stop the server.)"
npm run dev -- --open
