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

class FaceRecognitionService {
  private modelsLoaded = false;
  private knownFaces: KnownFace[] = [];
  private faceMatcher: faceapi.FaceMatcher | null = null;
  private readonly EMBEDDINGS_CACHE_KEY = 'face_embeddings_cache';
  private readonly MODELS_PATH = '/models'; // Serve from public directory
  private readonly KNOWN_FACES_PATH = '/src/assets/known_faces';

  private defaultSettings: DetectionSettings = {
    confidenceThreshold: 0.6,
    enableExpressions: true,
    enableLandmarks: true,
    maxDistance: 0.6
  };

  constructor() {
    this.loadModels();
  }

  /**
   * Load all required face-api.js models
   */
  async loadModels(): Promise<void> {
    if (this.modelsLoaded) return;

    try {
      console.log('🤖 Loading face-api.js models from:', this.MODELS_PATH);
      
      // Test if models are accessible
      const testUrl = `${this.MODELS_PATH}/ssd_mobilenetv1_model-weights_manifest.json`;
      console.log('🔍 Testing model accessibility:', testUrl);
      
      await Promise.all([
        faceapi.nets.ssdMobilenetv1.loadFromUri(this.MODELS_PATH),
        faceapi.nets.faceLandmark68Net.loadFromUri(this.MODELS_PATH),
        faceapi.nets.faceRecognitionNet.loadFromUri(this.MODELS_PATH),
        faceapi.nets.faceExpressionNet.loadFromUri(this.MODELS_PATH),
        faceapi.nets.ageGenderNet.loadFromUri(this.MODELS_PATH)
      ]);

      this.modelsLoaded = true;
      console.log('✅ All face-api.js models loaded successfully');
      
      // Load known faces after models are loaded
      await this.loadKnownFaces();
      
    } catch (error) {
      console.error('❌ Error loading face-api.js models:', error);
      throw new Error('Failed to load face-api.js models: ' + error);
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
      // Get list of known face directories
      const knownFaceNames = ['Vipin']; // Hardcoded for now, replace with actual directory reading
      console.log('Found known faces:', knownFaceNames);

      for (const name of knownFaceNames) {
        try {
          const imagePath = `${this.KNOWN_FACES_PATH}/${name}/${name}.jpg`;
          console.log(`Processing face: ${name} from ${imagePath}`);
          
          // Load image
          const img = await faceapi.fetchImage(imagePath);
          
          // Detect face and generate descriptor
          const detection = await faceapi
            .detectSingleFace(img)
            .withFaceLandmarks()
            .withFaceDescriptor();

          if (detection) {
            knownFaces.push({
              name: name,
              descriptor: detection.descriptor,
              imagePath: imagePath
            });
            console.log(`Successfully processed face: ${name}`);
          } else {
            console.warn(`No face detected in image for ${name}`);
          }
        } catch (error) {
          console.error(`Error processing face ${name}:`, error);
        }
      }

      this.knownFaces = knownFaces;
      
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
      throw new Error('Models not loaded yet');
    }

    if (!this.faceMatcher) {
      throw new Error('Face matcher not initialized');
    }

    const currentSettings = { ...this.defaultSettings, ...settings };
    const results: FaceRecognitionResult[] = [];

    try {
      // Detect all faces with landmarks and descriptors
      let detections;
      
      if (currentSettings.enableLandmarks && currentSettings.enableExpressions) {
        detections = await faceapi
          .detectAllFaces(input, new faceapi.SsdMobilenetv1Options({ 
            minConfidence: currentSettings.confidenceThreshold 
          }))
          .withFaceLandmarks()
          .withFaceDescriptors()
          .withFaceExpressions();
      } else {
        // Simplified: Always use landmarks and descriptors for recognition
        detections = await faceapi
          .detectAllFaces(input, new faceapi.SsdMobilenetv1Options({ 
            minConfidence: currentSettings.confidenceThreshold 
          }))
          .withFaceLandmarks()
          .withFaceDescriptors();
      }

      // Process each detected face
      for (const detection of detections) {
        const bestMatch = this.faceMatcher.findBestMatch(detection.descriptor);
        
        const result: FaceRecognitionResult = {
          name: bestMatch.label !== 'unknown' ? bestMatch.label : 'Unknown',
          confidence: 1 - bestMatch.distance, // Convert distance to confidence
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
          result.expressions = detection.expressions as any; // Type assertion for face-api.js
        }

        results.push(result);
      }

      return results;
    } catch (error) {
      console.error('Error in face detection and recognition:', error);
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
   * Check if models are loaded
   */
  isReady(): boolean {
    return this.modelsLoaded && this.faceMatcher !== null;
  }

  /**
   * Get list of known face names
   */
  getKnownFaceNames(): string[] {
    return this.knownFaces.map(face => face.name);
  }
}

// Export singleton instance
export const faceRecognitionService = new FaceRecognitionService();
export default faceRecognitionService;
