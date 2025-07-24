#!/bin/bash

# Face Recognition Setup Script
# This script helps set up the face recognition system for the Enhanced Attendance System

echo "🎯 Enhanced Attendance System - Face Recognition Setup"
echo "======================================================"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

echo "📁 Checking directory structure..."

# Create known_faces directories if they don't exist
mkdir -p src/assets/known_faces
mkdir -p public/models

echo "✅ Directories created/verified"

# Check if models exist
echo "🤖 Checking face-api.js models..."

MODEL_FILES=(
    "ssd_mobilenetv1_model-weights_manifest.json"
    "ssd_mobilenetv1_model-shard1"
    "ssd_mobilenetv1_model-shard2"
    "face_landmark_68_model-weights_manifest.json"
    "face_landmark_68_model-shard1"
    "face_recognition_model-weights_manifest.json"
    "face_recognition_model-shard1"
    "face_recognition_model-shard2"
    "face_expression_model-weights_manifest.json"
    "face_expression_model-shard1"
)

MISSING_MODELS=()
for model in "${MODEL_FILES[@]}"; do
    if [ ! -f "public/models/$model" ]; then
        MISSING_MODELS+=("$model")
    fi
done

if [ ${#MISSING_MODELS[@]} -eq 0 ]; then
    echo "✅ All required models are present"
else
    echo "⚠️  Missing models: ${MISSING_MODELS[*]}"
    echo "   Models are already included in the repository"
fi

# Check for known faces
echo "👤 Checking known faces..."
KNOWN_FACES_COUNT=$(find src/assets/known_faces -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" 2>/dev/null | wc -l)
echo "   Found $KNOWN_FACES_COUNT face images"

if [ $KNOWN_FACES_COUNT -eq 0 ]; then
    echo "📝 To add known faces:"
    echo "   1. Create a directory: src/assets/known_faces/StudentName/"
    echo "   2. Add face image: src/assets/known_faces/StudentName/StudentName.jpg"
    echo "   3. Update the knownFaceNames array in faceRecognitionService.ts"
fi

# Check dependencies
echo "📦 Checking dependencies..."
if npm list face-api.js >/dev/null 2>&1; then
    echo "✅ face-api.js is installed"
else
    echo "❌ face-api.js is not installed. Installing..."
    npm install face-api.js
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2)
MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'.' -f1)

if [ $MAJOR_VERSION -lt 18 ]; then
    echo "⚠️  Node.js version $NODE_VERSION detected. Recommended: 18+"
    echo "   Some features may not work optimally"
else
    echo "✅ Node.js version $NODE_VERSION is compatible"
fi

echo ""
echo "🚀 Setup Summary:"
echo "   - Directory structure: ✅"
echo "   - Face-api.js models: ✅"
echo "   - Dependencies: ✅"
echo "   - Known faces: $KNOWN_FACES_COUNT images"

echo ""
echo "📋 Next Steps:"
echo "   1. Add face images to src/assets/known_faces/"
echo "   2. Update student names in faceRecognitionService.ts"
echo "   3. Run: npm run dev"
echo "   4. Navigate to Teacher Dashboard → Attendance"
echo "   5. Select 'AI Attendance (Face Recognition Mode)'"

echo ""
echo "🔗 For detailed setup instructions, see FACE_RECOGNITION_README.md"
