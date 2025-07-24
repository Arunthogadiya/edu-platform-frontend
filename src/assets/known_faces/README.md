# Known Faces Directory

This directory contains known face images for the face recognition system.

## Structure
Each person should have their own directory with the following structure:
```
known_faces/
├── {person_name}/
│   └── {person_name}.jpg
```

## Example
```
known_faces/
├── Vipin/
│   └── Vipin.jpg
├── John/
│   └── John.jpg
├── Sarah/
│   └── Sarah.jpg
```

## Requirements
- Images should be in JPG format
- Images should contain a clear, front-facing photo of the person
- Recommended image size: 300x300 pixels minimum
- Good lighting and clear visibility of facial features
- Only one face per image

## Adding New Faces
1. Create a new directory with the person's name
2. Add a JPG image with the same name as the directory
3. Update the `knownFaceNames` array in `faceRecognitionService.ts` if needed
4. The system will automatically detect and load the face during initialization

## Notes
- The face recognition system uses face-api.js for detection and recognition
- Embeddings are cached in localStorage for performance
- Cache expires after 24 hours and will be regenerated
