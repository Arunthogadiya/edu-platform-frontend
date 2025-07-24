# Face-API.js Models Directory

This directory contains the pre-trained models for face-api.js that are served as static assets.

## Current Models
The following models are included and ready to use:

### Face Detection Models:
- `ssd_mobilenetv1_model-weights_manifest.json` - Model manifest
- `ssd_mobilenetv1_model-shard1.bin` - Model weights (part 1)
- `ssd_mobilenetv1_model-shard2.bin` - Model weights (part 2)

### Face Landmarks Models:
- `face_landmark_68_model-weights_manifest.json` - 68-point landmarks manifest
- `face_landmark_68_model-shard1.bin` - Landmarks model weights

### Face Recognition Models:
- `face_recognition_model-weights_manifest.json` - Recognition manifest
- `face_recognition_model-shard1.bin` - Recognition weights (part 1)
- `face_recognition_model-shard2.bin` - Recognition weights (part 2)

### Face Expression Models:
- `face_expression_model-weights_manifest.json` - Expression detection manifest
- `face_expression_model-shard1.bin` - Expression model weights

### Additional Models:
- `age_gender_model-weights_manifest.json` - Age/gender detection manifest
- `age_gender_model-shard1` - Age/gender model weights
- `face_landmark_68_tiny_model-weights_manifest.json` - Tiny landmarks manifest
- `face_landmark_68_tiny_model-shard1` - Tiny landmarks weights
- `tiny_face_detector_model-weights_manifest.json` - Tiny detector manifest
- `tiny_face_detector_model-shard1` - Tiny detector weights

## Model Loading
These models are loaded automatically by the face recognition service using:
```typescript
await faceapi.nets.ssdMobilenetv1.loadFromUri('/models')
await faceapi.nets.faceLandmark68Net.loadFromUri('/models')
await faceapi.nets.faceRecognitionNet.loadFromUri('/models')
await faceapi.nets.faceExpressionNet.loadFromUri('/models')
```

## Why Public Directory?
Models are served from the public directory to:
- Avoid Vite build system trying to parse binary files as JavaScript
- Serve as static assets without processing
- Enable proper loading by face-api.js

## File Sizes
- Total size: ~15-20 MB
- SSD MobileNet: ~5.4 MB (face detection)
- Face Recognition: ~6.2 MB (descriptor extraction)
- Face Landmarks: ~350 KB (68-point landmarks)
- Face Expression: ~310 KB (emotion detection)

These models provide the complete face recognition pipeline for the Enhanced Attendance System.
