# Configurable Module System

This system allows you to configure which face detection and analysis modules are enabled, providing flexibility for different use cases and performance requirements.

## Configuration Overview

The module system has two main levels:

1. **Detection Module** - Core face detection functionality (required)
2. **Analysis Module** - Advanced features like emotion detection, face recognition, etc. (optional)

## How to Configure

Edit the configuration in `src/app/shared/config.ts`:

### Detection Only Mode (Fastest Performance)
```typescript
MODULES: {
  DETECTION_ENABLED: true,
  ANALYSIS_ENABLED: false,
  ANALYSIS_FEATURES: {
    FACE_RECOGNITION: false,
    EMOTION_DETECTION: false,
    AGE_GENDER_DETECTION: false,
    HEART_RATE_MONITORING: false
  }
}
```

### Full Analysis Mode (All Features)
```typescript
MODULES: {
  DETECTION_ENABLED: true,
  ANALYSIS_ENABLED: true,
  ANALYSIS_FEATURES: {
    FACE_RECOGNITION: true,
    EMOTION_DETECTION: true,
    AGE_GENDER_DETECTION: true,
    HEART_RATE_MONITORING: true
  }
}
```

### Custom Configuration (Selective Features)
```typescript
MODULES: {
  DETECTION_ENABLED: true,
  ANALYSIS_ENABLED: true,
  ANALYSIS_FEATURES: {
    FACE_RECOGNITION: true,      // Enable face recognition
    EMOTION_DETECTION: false,    // Disable emotion detection
    AGE_GENDER_DETECTION: true,  // Enable age/gender detection
    HEART_RATE_MONITORING: false // Disable heart rate monitoring
  }
}
```

## Configuration Options

### Detection Module
- **DETECTION_ENABLED**: Must be `true` for any functionality to work
- Loads only the face detector model (tiny or SSD MobileNet)
- Provides basic face bounding boxes and confidence scores

### Analysis Module
- **ANALYSIS_ENABLED**: Enables advanced analysis features
- When `false`, only detection works (fastest performance)
- When `true`, loads additional models based on enabled features

### Individual Analysis Features

#### Face Recognition
- **FACE_RECOGNITION**: `true/false`
- Recognizes known faces from the `assets/known_faces` directory
- Requires face landmarks and face descriptor models
- Loads pre-computed embeddings or computes them from images

#### Emotion Detection
- **EMOTION_DETECTION**: `true/false`
- Detects emotions: happy, sad, angry, fear, surprise, disgust, neutral
- Requires face landmarks and expression models
- Provides emotion probabilities and dominant emotion

#### Age/Gender Detection
- **AGE_GENDER_DETECTION**: `true/false`
- Estimates age (in years) and gender (male/female)
- Requires face landmarks and age/gender models
- Provides estimated age and gender with confidence

#### Heart Rate Monitoring
- **HEART_RATE_MONITORING**: `true/false`
- Monitors heart rate through camera using photoplethysmography (PPG)
- Requires OpenCV.js to be loaded
- Provides real-time heart rate estimates

## Pre-defined Presets

The system includes several pre-defined configurations in `src/app/shared/module-presets.ts`:

1. **Detection Only** - Basic face detection (fastest)
2. **Recognition Only** - Face detection + recognition
3. **Emotion Analysis** - Face detection + emotion recognition
4. **Full Analysis** - All features enabled
5. **Biometric Suite** - Recognition + age/gender + heart rate
6. **Wellness Monitoring** - Emotion + heart rate monitoring

## Runtime Module Loading

The system supports loading analysis modules at runtime:

1. Start with `ANALYSIS_ENABLED: false` for fastest initial load
2. Load only detection models initially
3. Enable analysis modules on demand using the "Enable Analysis" button
4. This provides faster startup while maintaining full functionality when needed

## Performance Considerations

### Model Loading Times
- **Detection Only**: ~1-2 seconds (1 model)
- **With Analysis**: ~3-5 seconds (3-5 models depending on features)
- **Full Suite**: ~5-7 seconds (all models)

### Runtime Performance
- **Detection Only**: ~30-60 FPS (depending on hardware)
- **With Emotion**: ~20-40 FPS
- **Full Analysis**: ~15-25 FPS
- **Heart Rate Monitoring**: Additional ~5-10% CPU overhead

### Memory Usage
- **Detection Only**: ~50-100 MB
- **With Analysis**: ~150-300 MB
- **Full Suite**: ~300-500 MB

## Use Cases

### High Performance Applications
```typescript
// Use detection only for real-time applications requiring high FPS
DETECTION_ENABLED: true
ANALYSIS_ENABLED: false
```

### Security/Access Control
```typescript
// Use face recognition for authentication
DETECTION_ENABLED: true
ANALYSIS_ENABLED: true
ANALYSIS_FEATURES: { FACE_RECOGNITION: true, ... others: false }
```

### Wellness/Health Applications
```typescript
// Monitor emotional state and vital signs
DETECTION_ENABLED: true
ANALYSIS_ENABLED: true
ANALYSIS_FEATURES: { 
  EMOTION_DETECTION: true, 
  HEART_RATE_MONITORING: true,
  ... others: false 
}
```

### Complete Analytics
```typescript
// Full analysis for comprehensive applications
DETECTION_ENABLED: true
ANALYSIS_ENABLED: true
ANALYSIS_FEATURES: { all: true }
```

## Testing Configuration

Use the "Test Configuration" button in the UI to:
- Check current module status
- Verify which features are enabled/loaded
- Debug configuration issues
- Monitor loading states

The test results are logged to the browser console with detailed module status information.

## Troubleshooting

### Models Not Loading
- Check browser console for model loading errors
- Ensure model files exist in `assets/models/`
- Verify network connectivity for model downloads

### Features Not Working
- Confirm feature is enabled in configuration
- Check if analysis module is enabled
- Verify required models are loaded successfully

### Performance Issues
- Disable unused features to improve performance
- Use detection-only mode for maximum speed
- Monitor browser performance tools for bottlenecks

## Dependencies

- **face-api.js**: Face detection and analysis models
- **OpenCV.js**: Required for heart rate monitoring (optional)
- **Browser**: Modern browser with WebRTC camera access
