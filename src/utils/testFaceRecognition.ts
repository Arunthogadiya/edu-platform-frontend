/**
 * Test utility to verify face recognition setup
 */
import faceRecognitionService from '../services/faceRecognitionService';

export const testFaceRecognitionSetup = async (): Promise<{
  success: boolean;
  message: string;
  details: any;
}> => {
  try {
    console.log('🧪 Testing face recognition setup...');
    
    // Test 1: Check if models can be loaded
    console.log('📦 Step 1: Loading models...');
    await faceRecognitionService.loadModels();
    console.log('✅ Models loaded successfully');
    
    // Test 2: Check service status
    const status = faceRecognitionService.getStatus();
    console.log('📊 Step 2: Service status:', status);
    
    // Test 3: Check known faces
    const knownFaces = faceRecognitionService.getKnownFaceNames();
    console.log('👥 Step 3: Known faces:', knownFaces);
    
    // Test 4: Check if service is ready
    const isReady = faceRecognitionService.isReady();
    console.log('🎯 Step 4: Service ready:', isReady);
    
    // Test 5: Test image accessibility
    const testPaths = [
      '/models/ssd_mobilenetv1_model-weights_manifest.json',
      '/assets/known_faces/Vipin/Vipin.jpg',
      '/assets/known_faces/Yasaswini/Yasaswini.jpg'
    ];
    
    console.log('🔍 Step 5: Testing file accessibility...');
    const pathTests = await Promise.allSettled(
      testPaths.map(async (path) => {
        const response = await fetch(path);
        return { path, accessible: response.ok, status: response.status };
      })
    );
    
    const pathResults = pathTests.map((result, index) => {
      if (result.status === 'fulfilled') {
        console.log(`${result.value.accessible ? '✅' : '❌'} ${testPaths[index]}: ${result.value.status}`);
        return result.value;
      } else {
        console.log(`❌ ${testPaths[index]}: Error - ${result.reason}`);
        return { path: testPaths[index], accessible: false, error: result.reason };
      }
    });
    
    // Summary
    const allPathsAccessible = pathResults.every(r => r.accessible);
    const summary = {
      modelsLoaded: status.modelsLoaded,
      knownFacesCount: status.knownFacesCount,
      serviceReady: isReady,
      pathsAccessible: allPathsAccessible,
      pathResults
    };
    
    if (isReady && allPathsAccessible) {
      return {
        success: true,
        message: 'Face recognition setup is working correctly!',
        details: summary
      };
    } else {
      return {
        success: false,
        message: 'Face recognition setup has issues. Check the details.',
        details: summary
      };
    }
    
  } catch (error) {
    console.error('❌ Face recognition test failed:', error);
    return {
      success: false,
      message: `Face recognition test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      details: { error }
    };
  }
};

// Export as default for easy import
export default testFaceRecognitionSetup;
