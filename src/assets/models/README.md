# Face-API.js Models Directory

**⚠️ IMPORTANT: Models have been moved to `/public/models/` directory**

This directory is no longer used. The face-api.js models are now served from the public directory to avoid Vite build issues.

## Current Model Location
Models are now located in: `/public/models/`

## Required Models
The following models should be in the public/models directory:

### Required Files:
- `ssd_mobilenetv1_model-weights_manifest.json`
- `ssd_mobilenetv1_model-shard1.bin`
- `ssd_mobilenetv1_model-shard2.bin`
- `face_landmark_68_model-weights_manifest.json`
- `face_landmark_68_model-shard1.bin`
- `face_recognition_model-weights_manifest.json`
- `face_recognition_model-shard1.bin`
- `face_recognition_model-shard2.bin`
- `face_expression_model-weights_manifest.json`
- `face_expression_model-shard1.bin`

## Why the Move?
Vite was trying to parse the binary model files as JavaScript, causing build errors. By moving them to the public directory, they are served as static assets instead of being processed by the build system.
