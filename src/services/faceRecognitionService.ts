import * as faceapi from 'face-api.js';

export interface KnownFace {
  name: string;
  descriptor: Float32Array;
  imagePath: string;
}

export interface FaceRecognitionResult {
  name: string;
  confidence: number;
  distance: number;
  box: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  landmarks?: faceapi.FaceLandmarks68;
  expressions?: faceapi.FaceExpressions;
}

export interface DetectionSettings {
  confidenceThreshold: number;
  enableExpressions: boolean;
  enableLandmarks: boolean;
  maxDistance: number;
}

export interface MediaStreamOptions {
  video?: {
    width?: number | { min?: number; ideal?: number; max?: number };
    height?: number | { min?: number; ideal?: number; max?: number };
    frameRate?: number | { min?: number; ideal?: number; max?: number };
    facingMode?: string;
  };
  audio?: boolean;
}

class FaceRecognitionService {
  private modelsLoaded = false;
  private knownFaces: KnownFace[] = [];
  private faceMatcher: faceapi.FaceMatcher | null = null;
  private currentMediaStream: MediaStream | null = null;
  private readonly EMBEDDINGS_CACHE_KEY = 'face_embeddings_cache';
  private readonly MODELS_PATH = '/models'; // Serve from public directory
  private readonly KNOWN_FACES_PATH = '/assets/known_faces'; // Changed to public path

  private defaultSettings: DetectionSettings = {
    confidenceThreshold: 0.6,
    enableExpressions: true,
    enableLandmarks: true,
    maxDistance: 0.6
  };

  private defaultMediaOptions: MediaStreamOptions = {
    video: {
      width: { ideal: 1280, min: 640, max: 1920 },
      height: { ideal: 720, min: 480, max: 1080 },
      frameRate: { ideal: 30, min: 15 },
      facingMode: 'user'
    },
    audio: false
  };

  constructor() {
    this.loadModels();
  }

  /**
   * Load all required face-api.js models
   */
  async loadModels(): Promise<void> {
    if (this.modelsLoaded) {
      console.log('✅ Models already loaded');
      return;
    }

    try {
      console.log('🤖 Loading face-api.js models from:', this.MODELS_PATH);
      
      // Test if models are accessible first
      const testUrl = `${this.MODELS_PATH}/ssd_mobilenetv1_model-weights_manifest.json`;
      console.log('🔍 Testing model accessibility:', testUrl);
      
      const testResponse = await fetch(testUrl);
      if (!testResponse.ok) {
        throw new Error(`Models not accessible at ${this.MODELS_PATH}. Check if models are in public folder.`);
      }
      console.log('✅ Models are accessible');
      
      // Load all required models
      console.log('⏳ Loading face detection model...');
      await faceapi.nets.ssdMobilenetv1.loadFromUri(this.MODELS_PATH);
      console.log('✅ Face detection model loaded');
      
      console.log('⏳ Loading face landmark model...');
      await faceapi.nets.faceLandmark68Net.loadFromUri(this.MODELS_PATH);
      console.log('✅ Face landmark model loaded');
      
      console.log('⏳ Loading face recognition model...');
      await faceapi.nets.faceRecognitionNet.loadFromUri(this.MODELS_PATH);
      console.log('✅ Face recognition model loaded');
      
      console.log('⏳ Loading face expression model...');
      await faceapi.nets.faceExpressionNet.loadFromUri(this.MODELS_PATH);
      console.log('✅ Face expression model loaded');
      
      console.log('⏳ Loading age-gender model...');
      await faceapi.nets.ageGenderNet.loadFromUri(this.MODELS_PATH);
      console.log('✅ Age-gender model loaded');

      this.modelsLoaded = true;
      console.log('🎉 All face-api.js models loaded successfully');
      
      // Load known faces after models are loaded
      await this.loadKnownFaces();
      
    } catch (error) {
      console.error('❌ Error loading face-api.js models:', error);
      this.modelsLoaded = false;
      throw new Error(`Failed to load face-api.js models: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Load known faces from assets and generate/cache embeddings
   */
  async loadKnownFaces(): Promise<void> {
    try {
      console.log('Loading known faces...');
      
      // Try to load cached embeddings first
      const cachedEmbeddings = this.loadCachedEmbeddings();
      if (cachedEmbeddings && cachedEmbeddings.length > 0) {
        this.knownFaces = cachedEmbeddings;
        this.createFaceMatcher();
        console.log(`Loaded ${this.knownFaces.length} known faces from cache`);
        return;
      }

      // If no cache, generate embeddings from images
      await this.generateEmbeddingsFromImages();
      
    } catch (error) {
      console.error('Error loading known faces:', error);
      throw new Error('Failed to load known faces');
    }
  }

  /**
   * Generate embeddings from known face images
   */
  private async generateEmbeddingsFromImages(): Promise<void> {
    const knownFaces: KnownFace[] = [];
    
    try {
      // List of known face names - in a real app, this could be loaded from an API or config
      const knownFaceNames = ['Vipin', 'Yasaswini']; 
      console.log('🔍 Processing known faces:', knownFaceNames);

      for (const name of knownFaceNames) {
        try {
          const imagePath = `${this.KNOWN_FACES_PATH}/${name}/${name}.jpg`;
          console.log(`🖼️ Processing face: ${name} from ${imagePath}`);
          
          // Test if image is accessible
          const response = await fetch(imagePath);
          if (!response.ok) {
            console.warn(`⚠️ Image not found for ${name} at ${imagePath}`);
            continue;
          }
          
          // Load image using face-api's fetchImage
          const img = await faceapi.fetchImage(imagePath);
          console.log(`✅ Image loaded for ${name}`);
          
          // Detect face and generate descriptor
          const detection = await faceapi
            .detectSingleFace(img, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 }))
            .withFaceLandmarks()
            .withFaceDescriptor();

          if (detection) {
            knownFaces.push({
              name: name,
              descriptor: detection.descriptor,
              imagePath: imagePath
            });
            console.log(`✅ Successfully processed face: ${name} (confidence check passed)`);
          } else {
            console.warn(`❌ No face detected in image for ${name}. Please ensure the image contains a clear face.`);
          }
        } catch (error) {
          console.error(`❌ Error processing face ${name}:`, error);
        }
      }

      this.knownFaces = knownFaces;
      console.log(`🎯 Generated embeddings for ${knownFaces.length} known faces`);
      
      // Cache the embeddings
      this.cacheEmbeddings(knownFaces);
      
      // Create face matcher
      this.createFaceMatcher();
      
      console.log(`Generated embeddings for ${knownFaces.length} known faces`);
    } catch (error) {
      console.error('Error generating embeddings:', error);
      throw error;
    }
  }

  /**
   * Create face matcher from known faces
   */
  private createFaceMatcher(): void {
    if (this.knownFaces.length === 0) {
      console.warn('No known faces available for matching');
      return;
    }

    const labeledDescriptors = this.knownFaces.map(face => 
      new faceapi.LabeledFaceDescriptors(face.name, [face.descriptor])
    );

    this.faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, this.defaultSettings.maxDistance);
    console.log('Face matcher created successfully');
  }

  /**
   * Detect and recognize faces in video/image element
   */
  async detectAndRecognizeFaces(
    input: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement,
    settings: Partial<DetectionSettings> = {}
  ): Promise<FaceRecognitionResult[]> {
    if (!this.modelsLoaded) {
      throw new Error('Face recognition models not loaded yet. Please wait for initialization.');
    }

    if (!this.faceMatcher) {
      console.warn('⚠️ Face matcher not initialized - no known faces available for recognition');
      // Return empty results instead of throwing error to allow detection without recognition
      return [];
    }

    const currentSettings = { ...this.defaultSettings, ...settings };
    const results: FaceRecognitionResult[] = [];

    try {
      console.log('🔍 Starting face detection and recognition...');
      
      // Detect all faces with landmarks and descriptors
      let detections;
      
      if (currentSettings.enableLandmarks && currentSettings.enableExpressions) {
        console.log('🎭 Detecting faces with landmarks and expressions...');
        detections = await faceapi
          .detectAllFaces(input, new faceapi.SsdMobilenetv1Options({ 
            minConfidence: currentSettings.confidenceThreshold 
          }))
          .withFaceLandmarks()
          .withFaceDescriptors()
          .withFaceExpressions();
      } else {
        console.log('👤 Detecting faces with landmarks only...');
        // Simplified: Always use landmarks and descriptors for recognition
        detections = await faceapi
          .detectAllFaces(input, new faceapi.SsdMobilenetv1Options({ 
            minConfidence: currentSettings.confidenceThreshold 
          }))
          .withFaceLandmarks()
          .withFaceDescriptors();
      }

      console.log(`👥 Found ${detections.length} faces in the image/video`);

      // Process each detected face
      for (const detection of detections) {
        const bestMatch = this.faceMatcher.findBestMatch(detection.descriptor);
        
        const confidence = 1 - bestMatch.distance; // Convert distance to confidence
        console.log(`🎯 Face match result: ${bestMatch.label} (confidence: ${(confidence * 100).toFixed(1)}%, distance: ${bestMatch.distance.toFixed(3)})`);
        
        const result: FaceRecognitionResult = {
          name: bestMatch.label !== 'unknown' ? bestMatch.label : 'Unknown',
          confidence: confidence,
          distance: bestMatch.distance,
          box: {
            x: detection.detection.box.x,
            y: detection.detection.box.y,
            width: detection.detection.box.width,
            height: detection.detection.box.height
          }
        };

        // Add landmarks if available
        if ('landmarks' in detection) {
          result.landmarks = detection.landmarks;
        }

        // Add expressions if available
        if ('expressions' in detection) {
          result.expressions = detection.expressions as any;
          const dominantEmotion = this.getDominantEmotion(detection.expressions as faceapi.FaceExpressions);
          console.log(`😊 Dominant emotion: ${dominantEmotion.emotion} (${(dominantEmotion.probability * 100).toFixed(1)}%)`);
        }

        results.push(result);
      }

      console.log(`✅ Face recognition completed. Found ${results.length} results.`);
      return results;
    } catch (error) {
      console.error('❌ Error in face detection and recognition:', error);
      throw error;
    }
  }

  /**
   * Get the dominant emotion from expressions
   */
  getDominantEmotion(expressions: faceapi.FaceExpressions): { emotion: string; probability: number } {
    const emotions = expressions.asSortedArray();
    return {
      emotion: emotions[0].expression,
      probability: emotions[0].probability
    };
  }

  /**
   * Cache embeddings to localStorage
   */
  private cacheEmbeddings(faces: KnownFace[]): void {
    try {
      const cacheData = {
        timestamp: Date.now(),
        faces: faces.map(face => ({
          name: face.name,
          descriptor: Array.from(face.descriptor), // Convert Float32Array to regular array
          imagePath: face.imagePath
        }))
      };
      
      localStorage.setItem(this.EMBEDDINGS_CACHE_KEY, JSON.stringify(cacheData));
      console.log('Embeddings cached successfully');
    } catch (error) {
      console.error('Error caching embeddings:', error);
    }
  }

  /**
   * Load cached embeddings from localStorage
   */
  private loadCachedEmbeddings(): KnownFace[] | null {
    try {
      const cached = localStorage.getItem(this.EMBEDDINGS_CACHE_KEY);
      if (!cached) return null;

      const cacheData = JSON.parse(cached);
      
      // Check if cache is older than 24 hours
      const cacheAge = Date.now() - cacheData.timestamp;
      const maxCacheAge = 24 * 60 * 60 * 1000; // 24 hours
      
      if (cacheAge > maxCacheAge) {
        console.log('Cache expired, will regenerate embeddings');
        return null;
      }

      return cacheData.faces.map((face: any) => ({
        name: face.name,
        descriptor: new Float32Array(face.descriptor), // Convert back to Float32Array
        imagePath: face.imagePath
      }));
    } catch (error) {
      console.error('Error loading cached embeddings:', error);
      return null;
    }
  }

  /**
   * Clear cached embeddings
   */
  clearCache(): void {
    localStorage.removeItem(this.EMBEDDINGS_CACHE_KEY);
    console.log('Embeddings cache cleared');
  }

  /**
   * Add a new known face
   */
  async addKnownFace(name: string, imageElement: HTMLImageElement): Promise<void> {
    if (!this.modelsLoaded) {
      throw new Error('Models not loaded yet');
    }

    try {
      const detection = await faceapi
        .detectSingleFace(imageElement)
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        throw new Error('No face detected in the provided image');
      }

      const newFace: KnownFace = {
        name: name,
        descriptor: detection.descriptor,
        imagePath: '' // Will be set when image is saved
      };

      this.knownFaces.push(newFace);
      this.createFaceMatcher();
      this.cacheEmbeddings(this.knownFaces);

      console.log(`Added new known face: ${name}`);
    } catch (error) {
      console.error(`Error adding known face ${name}:`, error);
      throw error;
    }
  }
  
  /**
   * Capture a single frame from video element for detection
   */
  async captureFrame(videoElement: HTMLVideoElement): Promise<HTMLCanvasElement> {
    if (!videoElement) {
      throw new Error('No video element provided');
    }
    
    // Make sure the video has valid dimensions
    if (videoElement.videoWidth === 0 || videoElement.videoHeight === 0) {
      throw new Error('Video element has invalid dimensions');
    }
    
    // Create a canvas with the same dimensions as the video
    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    
    // Draw the current video frame on the canvas
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }
    
    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    return canvas;
  }
  
  /**
   * Detect faces in a video stream and return results
   */
  async detectFacesInVideo(
    videoElement: HTMLVideoElement,
    settings: Partial<DetectionSettings> = {}
  ): Promise<FaceRecognitionResult[]> {
    try {
      // Capture current video frame
      const canvas = await this.captureFrame(videoElement);
      
      // Run face detection on the captured frame
      return this.detectAndRecognizeFaces(canvas, settings);
    } catch (error) {
      console.error('Error detecting faces in video:', error);
      throw error;
    }
  }

  /**
   * Get recognition statistics
   */
  getStats(): { knownFacesCount: number; modelsLoaded: boolean; cacheSize: string } {
    const cacheSize = localStorage.getItem(this.EMBEDDINGS_CACHE_KEY)?.length || 0;
    return {
      knownFacesCount: this.knownFaces.length,
      modelsLoaded: this.modelsLoaded,
      cacheSize: `${(cacheSize / 1024).toFixed(2)} KB`
    };
  }

  /**
   * Get list of known face names
   */
  getKnownFaceNames(): string[] {
    return this.knownFaces.map(face => face.name);
  }

  /**
   * Check if the service is fully ready for face recognition
   */
  isReady(): boolean {
    return this.modelsLoaded && this.knownFaces.length > 0 && this.faceMatcher !== null;
  }
  
  /**
   * Check if the service is ready for video-based face recognition
   * This includes checking if models are loaded, known faces available, and media stream active
   */
  isReadyForVideoRecognition(): boolean {
    return this.isReady() && this.isMediaStreamActive();
  }

  /**
   * Get service status for debugging
   */
  getStatus(): { modelsLoaded: boolean; knownFacesCount: number; faceMatcherReady: boolean; mediaStreamActive: boolean } {
    return {
      modelsLoaded: this.modelsLoaded,
      knownFacesCount: this.knownFaces.length,
      faceMatcherReady: this.faceMatcher !== null,
      mediaStreamActive: !!this.currentMediaStream?.active
    };
  }

  /**
   * Start webcam stream with specified options
   * @returns Promise with MediaStream if successful
   */
  async startMediaStream(options?: Partial<MediaStreamOptions>): Promise<MediaStream> {
    try {
      console.log('🎥 Starting webcam access...');
      
      // If there's an existing stream, clean it up first
      if (this.currentMediaStream) {
        this.stopMediaStream();
      }
      
      // Merge default options with provided options
      const mediaConstraints = {
        ...this.defaultMediaOptions,
        ...options
      };
      
      console.log('📷 Requesting media with constraints:', mediaConstraints);
      const stream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
      
      console.log('✅ Media stream obtained successfully:', {
        active: stream.active,
        tracks: stream.getTracks().length,
        videoSettings: stream.getVideoTracks()[0]?.getSettings()
      });
      
      // Store reference to stream for cleanup
      this.currentMediaStream = stream;
      
      return stream;
    } catch (error) {
      console.error('❌ Failed to start media stream:', error);
      throw error;
    }
  }

  /**
   * Get the current media stream if it exists
   */
  getMediaStream(): MediaStream | null {
    return this.currentMediaStream;
  }

  /**
   * Check if media stream is active
   */
  isMediaStreamActive(): boolean {
    return !!this.currentMediaStream?.active;
  }

  /**
   * Stop and cleanup the current media stream
   */
  stopMediaStream(): void {
    if (this.currentMediaStream) {
      console.log('🛑 Stopping media stream...');
      
      try {
        const tracks = this.currentMediaStream.getTracks();
        tracks.forEach(track => {
          console.log(`⏹️ Stopping ${track.kind} track - state: ${track.readyState}`);
          track.stop();
        });
        
        console.log('✅ Media stream stopped successfully');
      } catch (error) {
        console.error('❌ Error stopping media stream:', error);
      }
      
      this.currentMediaStream = null;
    }
  }

  /**
   * Start webcam with basic options (fallback)
   * @returns Promise with MediaStream if successful
   */
  async startMediaStreamBasic(): Promise<MediaStream> {
    console.log('🔄 Trying with basic media constraints...');
    return this.startMediaStream({
      video: {
        width: 640,
        height: 480,
        facingMode: 'user'
      },
      audio: false
    });
  }
}

// Export singleton instance
export const faceRecognitionService = new FaceRecognitionService();
export default faceRecognitionService;
