import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, 
  Users, 
  CheckCircle, 
  XCircle, 
  Save, 
  Play, 
  Pause, 
  Brain,
  Eye,
  Clock,
  Settings,
  Sparkles,
  Target,
  Activity,
  Smile,
  Frown,
  Meh,
  Check,
  X,
  RefreshCw,
  BarChart3
} from 'lucide-react';
import { studentApi, Student } from '../../../../services/api/studentApi';
import { attendanceApi } from '../../../../services/api/attendanceApi';
import { useTeacher } from '../../../../contexts/TeacherContext';
import SmartAttendanceInsights from './SmartAttendanceInsights';
import faceRecognitionService from '../../../../services/faceRecognitionService';

// Add CSS animations for face recognition scanning
const animationStyles = `
  @keyframes scanVertical {
    0%, 100% { top: 0%; opacity: 0.5; }
    50% { top: 100%; opacity: 1; }
  }
  
  @keyframes scanHorizontal {
    0%, 100% { left: 0%; opacity: 0.5; }
    50% { left: 100%; opacity: 1; }
  }
  
  @keyframes pulseOverlay {
    0% { opacity: 0.1; }
    100% { opacity: 0.3; }
  }
  
  @keyframes slideInRight {
    0% { 
      transform: translateX(100%); 
      opacity: 0; 
    }
    100% { 
      transform: translateX(0); 
      opacity: 1; 
    }
  }
  
  .animate-slide-in-right {
    animation: slideInRight 0.3s ease-out;
  }
`;

// Inject styles into head once
if (typeof document !== 'undefined') {
  const existingStyle = document.querySelector('#face-recognition-animations');
  if (!existingStyle) {
    const styleElement = document.createElement('style');
    styleElement.id = 'face-recognition-animations';
    styleElement.textContent = animationStyles;
    document.head.appendChild(styleElement);
  }
}

interface AttendanceMode {
  id: 'ai' | 'manual' | 'insights';
  title: string;
  description: string;
  icon: any;
}

interface FaceDetection {
  id: string;
  studentId?: number;
  studentName?: string;
  confidence: number;
  timestamp: string;
  x: number;
  y: number;
  width: number;
  height: number;
  emotion?: 'happy' | 'neutral' | 'sad';
  status: 'detected' | 'confirmed' | 'unknown';
}

interface AIAttendanceSettings {
  confidenceThreshold: number;
  autoConfirmDelay: number;
  enableAutoConfirm: boolean;
  enableEmotionDetection: boolean;
  enableLearning: boolean;
}

const EnhancedAttendanceSystem: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { selectedClass, selectedSection, setSelectedClass, setSelectedSection } = useTeacher();
  
  // Core state
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceMode, setAttendanceMode] = useState<'ai' | 'manual' | 'insights'>('ai');
  const [isLoading, setIsLoading] = useState(false);
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Manual attendance state
  const [manualAttendance, setManualAttendance] = useState<{ [key: number]: 'present' | 'absence' }>({});
  const [notes, setNotes] = useState<{ [key: number]: string }>({});
  const [saveStatus, setSaveStatus] = useState<{ [key: number]: 'idle' | 'saving' | 'saved' | 'error' }>({});
  
  // AI attendance state
  const [isAIActive, setIsAIActive] = useState(false);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const [faceDetections, setFaceDetections] = useState<FaceDetection[]>([]);
  const [aiAttendance, setAiAttendance] = useState<{ [key: number]: 'present' | 'absence' }>({});
  const [detectionLog, setDetectionLog] = useState<Array<{
    id: string;
    studentName: string;
    timestamp: string;
    status: 'confirmed' | 'flagged' | 'unknown';
    confidence: number;
  }>>([]);
  const [aiSettings, setAiSettings] = useState<AIAttendanceSettings>({
    confidenceThreshold: 50, // Lowered from 75 to 50 for testing
    autoConfirmDelay: 5,
    enableAutoConfirm: true,
    enableEmotionDetection: true,
    enableLearning: false
  });
  const [autoConfirmTimer, setAutoConfirmTimer] = useState<number | null>(null);
  const [sessionStats, setSessionStats] = useState({
    detectedCount: 0,
    confirmedCount: 0,
    unknownCount: 0,
    sessionDuration: 0
  });
  
  // Face recognition service state
  const [faceServiceInitialized, setFaceServiceInitialized] = useState(false);
  const [faceServiceError, setFaceServiceError] = useState<string | null>(null);
  const [processingInterval, setProcessingInterval] = useState<NodeJS.Timeout | null>(null);
  
  // Camera selection state
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [showCameraSelector, setShowCameraSelector] = useState(false);
  
  // Video dimensions for bbox calculation
  const [videoDimensions, setVideoDimensions] = useState({ width: 1280, height: 720 });
  
  // Attendance notifications
  const [attendanceNotifications, setAttendanceNotifications] = useState<Array<{
    id: string;
    studentName: string;
    timestamp: number;
  }>>([]);

  const classes = ['6', '7', '8', '9', '10'];
  const sections = ['A', 'B', 'C'];

  const attendanceModes: AttendanceMode[] = [
    {
      id: 'ai',
      title: 'AI Attendance',
      description: 'Face recognition powered by smart AI',
      icon: Brain
    },
    {
      id: 'manual',
      title: 'Manual Attendance',
      description: 'Traditional attendance with smart assistance',
      icon: Users
    },
    {
      id: 'insights',
      title: 'Smart Analytics',
      description: 'AI-powered patterns and insights',
      icon: BarChart3
    }
  ];

  useEffect(() => {
    if (selectedClass && selectedSection) {
      loadStudents();
    }
  }, [selectedClass, selectedSection]);

  useEffect(() => {
    if (attendanceDate && selectedClass && selectedSection) {
      loadExistingAttendance();
    }
  }, [attendanceDate, selectedClass, selectedSection]);

  // Load available cameras on component mount
  useEffect(() => {
    loadAvailableCameras();
  }, []);

  // Close camera selector when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showCameraSelector) {
        const target = event.target as Element;
        if (!target.closest('.camera-selector')) {
          setShowCameraSelector(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCameraSelector]);

  const loadAvailableCameras = async () => {
    try {
      console.log('🎥 Loading available cameras...');
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      
      console.log('📹 Found cameras:', videoDevices.length);
      setAvailableCameras(videoDevices);
      
      // Set default camera (first one found)
      if (videoDevices.length > 0 && !selectedCameraId) {
        setSelectedCameraId(videoDevices[0].deviceId);
        console.log('📱 Default camera selected:', videoDevices[0].label || 'Camera 1');
      }
    } catch (error) {
      console.error('❌ Failed to enumerate cameras:', error);
    }
  };

  // Initialize face recognition service
  useEffect(() => {
    const initializeFaceService = async () => {
      try {
        setFaceServiceError(null);
        console.log('🔄 Initializing face recognition service...');
        
        // Add a small delay to ensure DOM is ready
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        await faceRecognitionService.loadModels();
        setFaceServiceInitialized(true);
        console.log('🎉 Face recognition service initialized successfully');
        
        // Log known faces for debugging
        const knownFaces = faceRecognitionService.getKnownFaceNames();
        const serviceStatus = faceRecognitionService.getStatus();
        console.log('👥 Known faces loaded:', knownFaces);
        console.log('📊 Service status:', serviceStatus);
        
        if (knownFaces.length === 0) {
          console.warn('⚠️ No known faces loaded. Face recognition will only detect faces without identification.');
        }
        
      } catch (error) {
        console.error('❌ Failed to initialize face recognition service:', error);
        setFaceServiceError(error instanceof Error ? error.message : 'Failed to initialize face recognition');
        setFaceServiceInitialized(false);
      }
    };

    initializeFaceService();
  }, []);

  // Comprehensive cleanup and stream monitoring
  useEffect(() => {
    let streamMonitor: NodeJS.Timeout | null = null;
    
    // Monitor stream health
    if (mediaStream && isVideoPlaying) {
      streamMonitor = setInterval(() => {
        const tracks = mediaStream.getTracks();
        const videoTrack = tracks.find(track => track.kind === 'video');
        
        if (!videoTrack || videoTrack.readyState === 'ended' || !videoTrack.enabled) {
          console.log('🚨 Stream track ended or disabled, attempting recovery...');
          setIsVideoPlaying(false);
          setCameraError('Camera stream interrupted. Please restart.');
        }
      }, 1000);
    }
    
    return () => {
      if (streamMonitor) {
        clearInterval(streamMonitor);
      }
    };
  }, [mediaStream, isVideoPlaying]);

  // Cleanup on unmount with proper track stopping
  useEffect(() => {
    return () => {
      // Stop all media streams properly
      if (mediaStream) {
        console.log('🧹 Cleaning up media stream on unmount');
        mediaStream.getTracks().forEach(track => {
          console.log(`⏹️ Stopping ${track.kind} track:`, track.readyState);
          track.stop();
        });
      }
      
      // Clear all intervals
      if (processingInterval) {
        clearInterval(processingInterval);
      }
      
      // Clear any auto-confirm timers
      if (autoConfirmTimer) {
        clearTimeout(autoConfirmTimer);
      }
    };
  }, []);

  const loadStudents = async () => {
    try {
      setIsLoading(true);
      const data = await studentApi.getStudents(selectedClass, selectedSection);
      console.log(`👨‍🎓 Loaded ${data.length} students:`, data.map(s => ({ id: s.student_id, name: s.student_name })));
      setStudents(data);
      
      // Initialize attendance states - set all to 'absence' initially
      const initialAttendance = data.reduce((acc: { [key: number]: 'present' | 'absence' }, student: Student) => {
        acc[student.student_id] = 'absence'; // Changed from 'present' to 'absence'
        return acc;
      }, {} as { [key: number]: 'present' | 'absence' });
      
      console.log(`📝 Initial attendance state:`, initialAttendance);
      setManualAttendance(initialAttendance);
      setAiAttendance(initialAttendance);
    } catch (error) {
      console.error('Error loading students:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadExistingAttendance = async () => {
    try {
      setIsLoading(true);
      const response = await attendanceApi.getAttendanceByDate(
        attendanceDate,
        selectedClass,
        selectedSection
      );
      
      const records = Array.isArray(response) ? response : [];

      const attendanceMap: { [key: number]: 'present' | 'absence' } = {};
      const notesMap: { [key: number]: string } = {};

      records.forEach((record: any) => {
        if (record && record.student_id) {
          attendanceMap[record.student_id] = record.status;
          notesMap[record.student_id] = record.notes || '';
          setSaveStatus(prev => ({
            ...prev,
            [record.student_id]: 'saved'
          }));
        }
      });

      setManualAttendance(attendanceMap);
      setAiAttendance(attendanceMap);
      setNotes(notesMap);
    } catch (error) {
      console.error('Error loading existing attendance:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startAIAttendance = async () => {
    try {
      console.log('🎥 Starting camera access...');
      setCameraError(null);
      setIsVideoPlaying(false);
      setIsAIActive(false);
      
      // Comprehensive cleanup of existing streams and listeners
      if (mediaStream) {
        console.log('🧹 Cleaning up existing stream...');
        mediaStream.getTracks().forEach(track => {
          console.log(`⏹️ Stopping existing ${track.kind} track`);
          track.stop();
        });
        setMediaStream(null);
      }
      
      // Clean up video element without cloneNode to avoid state loss
      if (videoRef.current) {
        const video = videoRef.current;
        
        console.log('🧹 Cleaning up video element...');
        
        // Remove existing event listeners if cleanup function exists
        if ((video as any).cleanup) {
          (video as any).cleanup();
          console.log('✅ Video event listeners cleaned up');
        }
        
        // Reset video element properly
        video.pause();
        video.srcObject = null;
        video.load(); // Reset the video element state
        
        // Remove any existing src attributes
        if (video.src) {
          URL.revokeObjectURL(video.src);
          video.removeAttribute('src');
        }
        
        console.log('🔄 Video element cleaned up without cloneNode');
      }
      
      // Request camera permissions with better constraints and specific camera
      const constraints = {
        video: {
          deviceId: selectedCameraId ? { exact: selectedCameraId } : undefined,
          width: { ideal: 1280, min: 640, max: 1920 },
          height: { ideal: 720, min: 480, max: 1080 },
          frameRate: { ideal: 30, min: 15, max: 60 },
          facingMode: selectedCameraId ? undefined : 'user' // Don't specify facingMode if we have a specific device
        },
        audio: false
      };
      
      console.log('📱 Requesting user media with constraints:', constraints);
      console.log('🎯 Selected camera ID:', selectedCameraId);
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      console.log('✅ Camera stream obtained successfully');
      const settings = stream.getVideoTracks()[0]?.getSettings();
      console.log('📹 Stream details:', {
        active: stream.active,
        tracks: stream.getVideoTracks().length,
        trackSettings: settings
      });
      
      // Update video dimensions based on actual stream settings
      if (settings) {
        setVideoDimensions({
          width: settings.width || 1280,
          height: settings.height || 720
        });
        console.log('📐 Video dimensions set to:', settings.width, 'x', settings.height);
      }
      
      // Verify stream tracks are active
      const videoTrack = stream.getVideoTracks()[0];
      if (!videoTrack || videoTrack.readyState === 'ended') {
        throw new Error('Video track is not active');
      }
      
      // Set stream state
      setMediaStream(stream);
      
      // Set up video element with comprehensive event handling
      if (videoRef.current) {
        const video = videoRef.current;
        
        // Configure video element properties
        video.muted = true;
        video.playsInline = true;
        video.autoplay = true;
        video.controls = false;
        
        // State management flags to prevent race conditions
        let videoLoaded = false;
        let playStarted = false;
        
        // Define event handlers with proper cleanup tracking
        const eventHandlers = {
          loadstart: () => {
            console.log('📹 Video load started');
          },
          
          loadedmetadata: () => {
            console.log('📺 Video metadata loaded:', {
              width: video.videoWidth,
              height: video.videoHeight,
              readyState: video.readyState,
              duration: video.duration
            });
            videoLoaded = true;
          },
          
          loadeddata: () => {
            console.log('📊 Video data loaded, attempting to play...');
            if (videoLoaded && !playStarted) {
              playStarted = true;
              video.play().catch(error => {
                console.error('❌ Auto play failed:', error);
                setCameraError('Video play failed. Click to start manually.');
                playStarted = false;
              });
            }
          },
          
          canplay: () => {
            console.log('▶️ Video can play');
            if (!playStarted) {
              playStarted = true;
              video.play().catch(error => {
                console.error('❌ Auto play failed on canplay:', error);
                setCameraError('Video play failed. Click to start manually.');
                playStarted = false;
              });
            }
          },
          
          play: () => {
            console.log('� Video play event fired');
            setIsVideoPlaying(true);
            setIsAIActive(true);
            setCameraError(null);
            
            // Start face detection after video is stable
            setTimeout(() => {
              startFaceDetection();
            }, 1000);
          },
          
          playing: () => {
            console.log('🎬 Video playing event - stream is stable');
            setIsVideoPlaying(true);
            setIsAIActive(true);
          },
          
          pause: () => {
            console.log('⏸️ Video pause event fired');
            setIsVideoPlaying(false);
          },
          
          ended: () => {
            console.log('🏁 Video ended event fired');
            setIsVideoPlaying(false);
            setCameraError('Video stream ended unexpectedly');
          },
          
          error: (e: any) => {
            console.error('❌ Video error:', e, video.error);
            setCameraError(`Video error: ${video.error?.message || 'Unknown error'}`);
            setIsVideoPlaying(false);
            setIsAIActive(false);
          },
          
          stalled: () => {
            console.warn('⚠️ Video stalled');
            setCameraError('Video stream stalled. Checking connection...');
          },
          
          waiting: () => {
            console.log('⏳ Video waiting for data');
          },
          
          abort: () => {
            console.warn('🚫 Video loading aborted');
            setCameraError('Video loading was interrupted');
          }
        };
        
        // Add all event listeners
        Object.entries(eventHandlers).forEach(([event, handler]) => {
          video.addEventListener(event, handler);
        });
        
        // Store cleanup function on video element for later use
        (video as any).cleanup = () => {
          console.log('🧹 Cleaning up video event listeners');
          Object.entries(eventHandlers).forEach(([event, handler]) => {
            video.removeEventListener(event, handler);
          });
          
          // Also cleanup sync mechanism
          if ((video as any).syncCleanup) {
            (video as any).syncCleanup();
          }
        };
        
        // Set the stream - this should trigger the event cascade
        video.srcObject = stream;
        console.log('📹 Video srcObject set, waiting for events...');
        
        // Ensure mediaStream state stays synchronized with video element
        const syncStreamState = () => {
          const currentStream = video.srcObject as MediaStream;
          if (currentStream && currentStream !== mediaStream) {
            console.log('🔄 Synchronizing mediaStream state with video element');
            setMediaStream(currentStream);
          }
        };
        
        // Sync immediately and set up periodic sync
        syncStreamState();
        const syncInterval = setInterval(syncStreamState, 1000);
        
        // Store sync cleanup
        (video as any).syncCleanup = () => {
          if (syncInterval) {
            clearInterval(syncInterval);
          }
        };
        
        // Monitor stream tracks for unexpected endings
        videoTrack.addEventListener('ended', () => {
          console.log('🚨 Video track ended unexpectedly');
          setCameraError('Camera was disconnected or stopped by another application');
          setIsVideoPlaying(false);
          setIsAIActive(false);
        });
        
        // Fallback timeout to detect issues
        setTimeout(() => {
          if (!playStarted && !cameraError) {
            console.log('⏰ Fallback: Attempting manual play after timeout');
            video.play().catch(error => {
              console.error('❌ Fallback play failed:', error);
              setCameraError('Video failed to start. Click to play manually.');
            });
          }
        }, 3000);
      }
      
    } catch (error) {
      console.error('❌ Camera access failed:', error);
      let errorMessage = 'Unknown camera error';
      
      if (error instanceof Error) {
        switch (error.name) {
          case 'NotAllowedError':
            errorMessage = 'Camera access denied. Please allow camera permissions and try again.';
            break;
          case 'NotFoundError':
            errorMessage = 'No camera found. Please connect a camera and try again.';
            break;
          case 'NotSupportedError':
            errorMessage = 'Camera not supported by this browser.';
            break;
          case 'NotReadableError':
            errorMessage = 'Camera is already in use by another application.';
            break;
          case 'OverconstrainedError':
            errorMessage = 'Camera constraints could not be satisfied. Trying with basic settings...';
            // Retry with basic constraints
            setTimeout(() => startAIAttendanceWithBasicConstraints(), 1000);
            return;
          default:
            errorMessage = `Camera error: ${error.message}`;
        }
      }
      
      setCameraError(errorMessage);
      setIsAIActive(false);
      setIsVideoPlaying(false);
      setMediaStream(null);
    }
  };

  // Fallback function with basic constraints
  const startAIAttendanceWithBasicConstraints = async () => {
    try {
      console.log('🔄 Retrying with basic camera constraints...');
      const basicConstraints = {
        video: {
          deviceId: selectedCameraId ? { exact: selectedCameraId } : undefined,
          width: 640,
          height: 480,
          facingMode: selectedCameraId ? undefined : 'user'
        },
        audio: false
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(basicConstraints);
      const settings = stream.getVideoTracks()[0]?.getSettings();
      
      // Update video dimensions for basic constraints
      if (settings) {
        setVideoDimensions({
          width: settings.width || 640,
          height: settings.height || 480
        });
      }
      
      setMediaStream(stream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      setCameraError(null);
    } catch (error) {
      console.error('❌ Basic constraints also failed:', error);
      setCameraError('Camera initialization failed completely. Please check your camera.');
    }
  };

  const handleManualPlay = async () => {
    const video = videoRef.current;
    const currentStream = video?.srcObject as MediaStream;
    const activeStream = mediaStream || currentStream;

    if (!video || !activeStream) {
      console.error('❌ Video or stream not available for manual play:', {
        video: !!video,
        mediaStream: !!mediaStream,
        currentStream: !!currentStream,
        videoSrcObject: !!video?.srcObject
      });
      setCameraError('Video or camera stream not available');
      return;
    }

    try {      
      console.log('🎮 Manual play initiated');
      console.log('📊 Stream state:', {
        active: activeStream.active,
        tracks: activeStream.getTracks().length,
        videoTrackState: activeStream.getVideoTracks()[0]?.readyState
      });
      
      // Update mediaStream state if it was lost
      if (!mediaStream && currentStream) {
        console.log('🔄 Recovering lost mediaStream state');
        setMediaStream(currentStream);
      }
      
      // Verify stream is still active
      const videoTrack = activeStream.getVideoTracks()[0];
      if (!videoTrack || videoTrack.readyState === 'ended') {
        throw new Error('Video track is no longer active');
      }
      
      // Ensure stream is properly set
      if (video.srcObject !== activeStream) {
        console.log('🔄 Resetting video srcObject');
        video.srcObject = activeStream;
      }
      
      // Configure video properties
      video.muted = true;
      video.playsInline = true;
      video.controls = false;
      
      // Check if video is already playing
      if (!video.paused) {
        console.log('▶️ Video is already playing');
        setIsVideoPlaying(true);
        setIsAIActive(true);
        setCameraError(null);
        return;
      }
      
      // Attempt to play with comprehensive error handling
      console.log('▶️ Attempting manual video play...');
      await video.play();
      
      console.log('✅ Manual play successful');
      setIsVideoPlaying(true);
      setIsAIActive(true);
      setCameraError(null);
      
      // Start face detection
      setTimeout(() => {
        startFaceDetection();
      }, 500);
      
    } catch (error) {
      console.error('❌ Manual play failed:', error);
      
      let errorMessage = 'Could not start video playback';
      if (error instanceof Error) {
        switch (error.name) {
          case 'NotAllowedError':
            errorMessage = 'Video play not allowed. Please enable autoplay or try again.';
            break;
          case 'AbortError':
            errorMessage = 'Video play was interrupted. Please try again.';
            break;
          case 'NotSupportedError':
            errorMessage = 'Video format not supported.';
            break;
          default:
            errorMessage = `Video play error: ${error.message}`;
        }
      }
      
      setCameraError(errorMessage);
      setIsVideoPlaying(false);
      setIsAIActive(false);
    }
  };

  const stopAIAttendance = () => {
    console.log('🛑 Stopping AI attendance with comprehensive cleanup');
    
    // Stop processing intervals first
    if (processingInterval) {
      clearInterval(processingInterval);
      setProcessingInterval(null);
      console.log('⏹️ Stopped face detection interval');
    }
    
    if (autoConfirmTimer) {
      clearTimeout(autoConfirmTimer);
      setAutoConfirmTimer(null);
      console.log('⏹️ Cleared auto-confirm timer');
    }
    
    // Stop media stream tracks properly
    if (mediaStream) {
      console.log('🧹 Stopping media stream tracks...');
      const tracks = mediaStream.getTracks();
      tracks.forEach(track => {
        console.log(`⏹️ Stopping ${track.kind} track - readyState: ${track.readyState}`);
        if (track.readyState !== 'ended') {
          track.stop();
        }
      });
      setMediaStream(null);
    }
    
    // Clean up video element thoroughly
    if (videoRef.current) {
      const video = videoRef.current;
      
      console.log('🧹 Cleaning up video element...');
      
      // Remove all event listeners using stored cleanup function
      if ((video as any).cleanup) {
        (video as any).cleanup();
        console.log('✅ Video event listeners cleaned up');
      }
      
      // Reset video element
      video.pause();
      video.srcObject = null;
      video.load(); // Reset the video element state
      
      // Additional cleanup
      if (video.src) {
        URL.revokeObjectURL(video.src);
        video.removeAttribute('src');
      }
      
      console.log('✅ Video element reset complete');
    }
    
    // Reset all states
    setIsAIActive(false);
    setIsVideoPlaying(false);
    setFaceDetections([]);
    setCameraError(null);
    
    // Reset session stats
    setSessionStats({
      detectedCount: 0,
      confirmedCount: 0,
      unknownCount: 0,
      sessionDuration: 0
    });
    
    console.log('✅ AI attendance stopped and cleaned up completely');
  };

  const startFaceDetection = () => {
    // Clear any existing intervals to prevent duplicates
    if (processingInterval) {
      console.log('🧹 Clearing existing face detection interval');
      clearInterval(processingInterval);
      setProcessingInterval(null);
    }
    
    // Get current video element and its stream
    const video = videoRef.current;
    const currentStream = video?.srcObject as MediaStream;
    
    // Check prerequisites with better stream detection
    if (!faceServiceInitialized || !video || (!mediaStream && !currentStream)) {
      console.log('❌ Face detection prerequisites not met:', {
        faceServiceInitialized,
        videoElement: !!video,
        mediaStream: !!mediaStream,
        currentStream: !!currentStream,
        videoSrcObject: !!video?.srcObject,
        serviceReady: faceRecognitionService.isReady(),
        serviceStatus: faceRecognitionService.getStatus()
      });
      return;
    }
    
    // Use the stream from video srcObject if mediaStream state is lost
    const streamToUse = mediaStream || currentStream;
    if (!streamToUse) {
      console.log('❌ No stream available for face detection');
      setCameraError('No camera stream available');
      return;
    }
    
    // Update mediaStream state if it was lost but stream exists in video
    if (!mediaStream && currentStream) {
      console.log('🔄 Recovering lost mediaStream state from video element');
      setMediaStream(currentStream);
    }
    
    // Verify video and stream are ready
    const videoTrack = streamToUse.getVideoTracks()[0];
    
    if (!videoTrack || videoTrack.readyState === 'ended') {
      console.log('❌ Video track not ready for face detection');
      setCameraError('Camera track is not active');
      return;
    }
    
    if (video.readyState < 3) { // HAVE_FUTURE_DATA
      console.log('⏳ Video not ready yet, waiting...');
      setTimeout(() => startFaceDetection(), 1000);
      return;
    }
    
    
    let consecutiveErrors = 0;
    const maxConsecutiveErrors = 5;
    
    const interval = setInterval(async () => {
      try {
        // Get current video and stream state
        const video = videoRef.current;
        const currentStream = video?.srcObject as MediaStream;
        const activeStream = mediaStream || currentStream;
        
        // Health check before processing - more robust stream checking
        if (!activeStream || !video || !isAIActive) {
          console.log('🛑 Face detection stopped - prerequisites no longer met:', {
            activeStream: !!activeStream,
            mediaStream: !!mediaStream,
            currentStream: !!currentStream,
            video: !!video,
            isAIActive
          });
          clearInterval(interval);
          setProcessingInterval(null);
          return;
        }
        
        const currentVideoTrack = activeStream.getVideoTracks()[0];
        if (!currentVideoTrack || currentVideoTrack.readyState === 'ended') {
          console.log('🚨 Video track ended during face detection');
          setCameraError('Camera track ended unexpectedly');
          clearInterval(interval);
          setProcessingInterval(null);
          return;
        }
        
        if (video.paused || video.ended || video.readyState < 3) {
          console.log('⚠️ Video not in playable state, skipping detection');
          return;
        }
        
        // Update mediaStream state if it was lost
        if (!mediaStream && currentStream) {
          setMediaStream(currentStream);
        }
        
        // Perform face recognition
        await performFaceRecognition();
        consecutiveErrors = 0; // Reset error count on success
        
      } catch (error) {
        consecutiveErrors++;
        console.error(`❌ Face detection error (${consecutiveErrors}/${maxConsecutiveErrors}):`, error);
        
        if (consecutiveErrors >= maxConsecutiveErrors) {
          console.log('🚨 Too many consecutive face detection errors, stopping');
          setFaceServiceError(`Face detection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
          clearInterval(interval);
          setProcessingInterval(null);
        }
      }
    }, 1000); // Check every second
    
    setProcessingInterval(interval);
    console.log('✅ Face detection interval started');
  };

  // Helper function to validate and recover stream state
  const validateAndRecoverStreamState = (): MediaStream | null => {
    const video = videoRef.current;
    const currentStream = video?.srcObject as MediaStream;
    
    // If we have a stream in mediaStream state, verify it's still active
    if (mediaStream) {
      const videoTrack = mediaStream.getVideoTracks()[0];
      if (videoTrack && videoTrack.readyState !== 'ended') {
        return mediaStream;
      } else {
        console.log('⚠️ mediaStream has ended tracks');
      }
    }
    
    // If video element has a stream, use that and sync state
    if (currentStream) {
      const videoTrack = currentStream.getVideoTracks()[0];
      if (videoTrack && videoTrack.readyState !== 'ended') {
        console.log('🔄 Recovering stream from video element');
        setMediaStream(currentStream);
        return currentStream;
      }
    }
    
    console.log('❌ No valid stream found');
    return null;
  };

  // Real face detection using face-api.js
  const performFaceRecognition = async () => {
    if (!isAIActive || !faceServiceInitialized || !videoRef.current) {
      console.log('⚠️ Skipping face recognition - prerequisites not met:', {
        isAIActive,
        faceServiceInitialized,
        videoElement: !!videoRef.current
      });
      return;
    }

    // Validate and recover stream state before processing
    const activeStream = validateAndRecoverStreamState();
    if (!activeStream) {
      console.log('⚠️ No valid stream for face recognition');
      setFaceServiceError('Camera stream not available');
      return;
    }

    // Check if we have known faces loaded
    const knownFaces = faceRecognitionService.getKnownFaceNames();
    console.log('👥 Known faces in service:', knownFaces);
    
    if (knownFaces.length === 0) {
      console.warn('⚠️ No known faces loaded in face recognition service!');
      // You may want to continue anyway to at least detect unknown faces
    }

    try {
      console.log('🔍 Performing face recognition...');
      console.log('🎯 AI Settings:', {
        confidenceThreshold: aiSettings.confidenceThreshold,
        enableAutoConfirm: aiSettings.enableAutoConfirm,
        enableEmotionDetection: aiSettings.enableEmotionDetection
      });
      
      // Perform face recognition on the video element
      const recognitionResults = await faceRecognitionService.detectAndRecognizeFaces(
        videoRef.current,
        {
          confidenceThreshold: aiSettings.confidenceThreshold / 100, // Convert percentage to decimal
          enableLandmarks: true,
          enableExpressions: aiSettings.enableEmotionDetection
        }
      );

      console.log(`👥 Face recognition returned ${recognitionResults.length} results`);
      console.log('🔍 Raw recognition results:', recognitionResults);
      console.log(`👨‍🎓 Available students:`, students.map(s => ({ id: s.student_id, name: s.student_name })));

      // Convert face-api.js results to our FaceDetection format
      const detections: FaceDetection[] = recognitionResults.map(result => {
        console.log(`🔍 Processing face recognition result:`, { name: result.name, confidence: result.confidence });
        
        // Find matching student by name
        const matchingStudent = students.find(s => 
          s.student_name.toLowerCase().includes(result.name.toLowerCase()) ||
          result.name.toLowerCase().includes(s.student_name.toLowerCase())
        );

        console.log(`🎯 Matching logic for "${result.name}":`, {
          foundMatch: !!matchingStudent,
          matchedStudent: matchingStudent ? { id: matchingStudent.student_id, name: matchingStudent.student_name } : null
        });

        const confidence = Math.round(result.confidence * 100);
        
        console.log(`🎯 Processing detection: ${result.name} -> ${matchingStudent?.student_name || 'No match'} (${confidence}%)`);
        
        // Get video element dimensions for proper bbox scaling
        const video = videoRef.current!;
        const videoRect = video.getBoundingClientRect();
        const scaleX = videoRect.width / videoDimensions.width;
        const scaleY = videoRect.height / videoDimensions.height;
        
        // Account for mirrored video (scaleX(-1) transform)
        // Mirror the x-coordinate: flipped_x = video_width - (original_x + box_width)
        const scaledWidth = result.box.width * scaleX;
        const mirroredX = videoRect.width - ((result.box.x * scaleX) + scaledWidth);
        
        const detection: FaceDetection = {
          id: Date.now().toString() + Math.random(),
          studentId: matchingStudent?.student_id,
          studentName: matchingStudent?.student_name || result.name,
          confidence,
          timestamp: new Date().toLocaleTimeString(),
          // Scale and mirror bbox coordinates to match displayed video
          x: mirroredX,
          y: result.box.y * scaleY,
          width: scaledWidth,
          height: result.box.height * scaleY,
          emotion: getEmotionFromExpressions(result.expressions),
          status: confidence >= aiSettings.confidenceThreshold ? 'detected' : 'unknown'
        };

        return detection;
      });

      // Update face detections state
      console.log(`📊 Generated ${detections.length} detections:`, detections.map(d => ({
        id: d.id,
        studentName: d.studentName,
        studentId: d.studentId,
        confidence: d.confidence,
        status: d.status
      })));
      setFaceDetections(detections);

      // Process confirmed detections and automatically mark attendance
      console.log(`🔄 Processing ${detections.length} detections for automatic attendance...`);
      for (const detection of detections) {
        console.log(`🔍 Processing detection: ${detection.studentName}, Status: ${detection.status}, StudentID: ${detection.studentId}, Confidence: ${detection.confidence}%`);
        
        if (detection.status === 'detected' && detection.studentId) {
          // Check if this student hasn't been marked present yet
          const currentAttendanceStatus = aiAttendance[detection.studentId];
          console.log(`👤 Current attendance status for ${detection.studentName} (ID: ${detection.studentId}): ${currentAttendanceStatus}`);
          
          if (currentAttendanceStatus !== 'present') {
            console.log(`✅ Auto-marking attendance for: ${detection.studentName} (ID: ${detection.studentId})`);
            
            // Immediately mark attendance when face is detected with high confidence
            setAiAttendance(prev => {
              const newAttendance = {
                ...prev,
                [detection.studentId!]: 'present' as const
              };
              console.log(`📝 Updated attendance state:`, newAttendance);
              return newAttendance;
            });
            
            // Add notification
            const notificationId = Date.now().toString();
            setAttendanceNotifications(prev => [{
              id: notificationId,
              studentName: detection.studentName || 'Unknown Student',
              timestamp: Date.now()
            }, ...prev.slice(0, 4)]); // Keep only last 5 notifications
            
            // Remove notification after 5 seconds
            setTimeout(() => {
              setAttendanceNotifications(prev => prev.filter(n => n.id !== notificationId));
            }, 5000);
            
            // Add to detection log
            addToDetectionLog(detection);
            
            // Update session stats
            setSessionStats(prev => ({
              ...prev,
              confirmedCount: prev.confirmedCount + 1
            }));
            
            // Auto-save attendance if enabled
            if (aiSettings.enableAutoConfirm) {
              console.log(`💾 Auto-saving attendance for ${detection.studentName}`);
              setTimeout(() => {
                saveAttendance(detection.studentId!);
              }, 1000); // Save after 1 second delay
            }
          } else {
            console.log(`⏭️ Student ${detection.studentName} already marked as present, skipping`);
          }
        } else {
          console.log(`❌ Detection not processed - Status: ${detection.status}, StudentID: ${detection.studentId || 'undefined'}`);
          if (detection.status !== 'detected') {
            console.log(`🔍 Detection confidence ${detection.confidence}% below threshold ${aiSettings.confidenceThreshold}%`);
          }
        }

        setSessionStats(prev => ({
          ...prev,
          detectedCount: prev.detectedCount + 1,
          unknownCount: detection.status === 'unknown' ? prev.unknownCount + 1 : prev.unknownCount
        }));
      }

    } catch (error) {
      console.error('Face recognition error:', error);
      setFaceServiceError(error instanceof Error ? error.message : 'Face recognition failed');
    }
  };

  // Helper function to convert face-api.js expressions to our emotion format
  const getEmotionFromExpressions = (expressions: any): 'happy' | 'neutral' | 'sad' => {
    if (!expressions) return 'neutral';
    
    // Find the expression with highest confidence
    const expressionEntries = Object.entries(expressions) as [string, number][];
    const topExpression = expressionEntries.reduce((max, [expr, confidence]) => 
      confidence > max.confidence ? { expression: expr, confidence } : max
    , { expression: 'neutral', confidence: 0 });

    // Map face-api.js expressions to our simplified emotions
    switch (topExpression.expression) {
      case 'happy':
      case 'surprised':
        return 'happy';
      case 'sad':
      case 'angry':
      case 'disgusted':
      case 'fearful':
        return 'sad';
      default:
        return 'neutral';
    }
  };

  const addToDetectionLog = (detection: FaceDetection) => {
    const logEntry = {
      id: detection.id,
      studentName: detection.studentName || 'Unknown',
      timestamp: detection.timestamp,
      status: 'confirmed' as const,
      confidence: detection.confidence
    };

    setDetectionLog(prev => {
      // Remove any existing entries with the same student name
      const filteredLog = prev.filter(log => log.studentName !== logEntry.studentName);
      // Add the new entry at the beginning and keep only 10 entries
      return [logEntry, ...filteredLog.slice(0, 9)];
    });
  };

  const confirmDetection = (detection: FaceDetection) => {
    if (detection.studentId) {
      setAiAttendance(prev => ({
        ...prev,
        [detection.studentId!]: 'present'
      }));

      setSessionStats(prev => ({
        ...prev,
        confirmedCount: prev.confirmedCount + 1
      }));

      setDetectionLog(prev => prev.map(log => 
        log.id === detection.id 
          ? { ...log, status: 'confirmed' as const }
          : log
      ));

      setFaceDetections(prev => prev.filter(d => d.id !== detection.id));
    }
  };

  const handleManualAttendanceChange = (studentId: number, status: 'present' | 'absence') => {
    setManualAttendance(prev => ({
      ...prev,
      [studentId]: status
    }));
    setSaveStatus(prev => ({ ...prev, [studentId]: 'idle' }));
  };

  const handleNotesChange = (studentId: number, value: string) => {
    setNotes(prev => ({
      ...prev,
      [studentId]: value
    }));
    setSaveStatus(prev => ({ ...prev, [studentId]: 'idle' }));
  };

  const saveAttendance = async (studentId: number) => {
    try {
      setSaveStatus(prev => ({ ...prev, [studentId]: 'saving' }));
      
      const attendanceData = attendanceMode === 'ai' ? aiAttendance : manualAttendance;
      
      const data = {
        student_id: studentId,
        attendance_date: attendanceDate,
        status: attendanceData[studentId],
        notes: notes[studentId] || '',
        class_value: selectedClass,
        section: selectedSection
      };

      await attendanceApi.submitAttendance(data);
      setSaveStatus(prev => ({ ...prev, [studentId]: 'saved' }));
    } catch (error) {
      console.error('Error saving attendance:', error);
      setSaveStatus(prev => ({ ...prev, [studentId]: 'error' }));
    }
  };

  const getEmotionIcon = (emotion?: string) => {
    switch (emotion) {
      case 'happy': return <Smile className="w-4 h-4 text-green-600" />;
      case 'sad': return <Frown className="w-4 h-4 text-red-600" />;
      default: return <Meh className="w-4 h-4 text-gray-600" />;
    }
  };

  const renderAIAttendanceView = () => (
    <div className="space-y-6">
      {/* AI Controls Header */}
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-xl">
              <Brain className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">AI-Powered Attendance</h2>
              <p className="text-purple-100">Face recognition with smart learning</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Camera Selection Button */}
            {availableCameras.length > 1 && !isAIActive && (
              <div className="relative camera-selector">
                <button
                  onClick={() => setShowCameraSelector(!showCameraSelector)}
                  className="flex items-center gap-2 px-4 py-2 bg-white/20 text-white rounded-xl hover:bg-white/30 transition-all"
                >
                  <Camera className="w-4 h-4" />
                  <span>Camera ({availableCameras.findIndex(c => c.deviceId === selectedCameraId) + 1})</span>
                </button>
                
                {showCameraSelector && (
                  <div className="absolute top-full mt-2 right-0 bg-white rounded-xl shadow-lg border border-gray-200 py-2 min-w-64 z-50">
                    <div className="px-3 py-2 text-sm font-semibold text-gray-700 border-b border-gray-100">
                      Select Camera
                    </div>
                    {availableCameras.map((camera, index) => (
                      <button
                        key={camera.deviceId}
                        onClick={() => {
                          setSelectedCameraId(camera.deviceId);
                          setShowCameraSelector(false);
                          console.log(`📷 Camera selected: ${camera.label || `Camera ${index + 1}`}`);
                        }}
                        className={`w-full text-left px-3 py-2 hover:bg-gray-50 transition-colors ${
                          selectedCameraId === camera.deviceId ? 'bg-purple-50 text-purple-700' : 'text-gray-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Camera className="w-4 h-4" />
                          <div>
                            <div className="font-medium">
                              {camera.label || `Camera ${index + 1}`}
                            </div>
                            <div className="text-xs text-gray-500">
                              {camera.deviceId === selectedCameraId ? 'Currently selected' : 'Available'}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {/* Debug button for testing face recognition */}
            {isVideoPlaying && (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    console.log('🧪 Manual face recognition test triggered');
                    performFaceRecognition();
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-yellow-500/20 text-white rounded-xl hover:bg-yellow-500/30 transition-all"
                >
                  <Eye className="w-4 h-4" />
                  <span>Test Recognition</span>
                </button>
                
                <button
                  onClick={() => {
                    console.log('🧪 Testing automatic attendance with dummy data');
                    if (students.length > 0) {
                      const testStudent = students[0];
                      console.log('📝 Test marking attendance for:', testStudent.student_name);
                      setAiAttendance(prev => ({
                        ...prev,
                        [testStudent.student_id]: 'present' as const
                      }));
                      
                      // Add test notification
                      const notificationId = Date.now().toString();
                      setAttendanceNotifications(prev => [{
                        id: notificationId,
                        studentName: testStudent.student_name,
                        timestamp: Date.now()
                      }, ...prev.slice(0, 4)]);
                      
                      setTimeout(() => {
                        setAttendanceNotifications(prev => prev.filter(n => n.id !== notificationId));
                      }, 5000);
                    }
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-white rounded-xl hover:bg-green-500/30 transition-all"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Test Auto-Mark</span>
                </button>
              </div>
            )}
            
            {!faceServiceInitialized && (
              <div className="flex items-center gap-2 px-3 py-2 bg-yellow-100 text-yellow-800 rounded-lg text-sm">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Loading Face Recognition...</span>
              </div>
            )}
            {!isAIActive ? (
              <button
                onClick={startAIAttendance}
                disabled={isLoading || !faceServiceInitialized}
                className="flex items-center gap-2 px-6 py-3 bg-white text-purple-600 rounded-xl font-semibold hover:bg-purple-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Play className="w-5 h-5" />
                {!faceServiceInitialized ? 'Please Wait...' : 'Start AI Attendance'}
              </button>
            ) : (
              <button
                onClick={stopAIAttendance}
                className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-all"
              >
                <Pause className="w-5 h-5" />
                Stop Session
              </button>
            )}
          </div>
        </div>

        {/* Session Stats */}
        {isAIActive && (
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold">{sessionStats.detectedCount}</div>
              <div className="text-sm text-purple-100">Detected</div>
            </div>
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold">{sessionStats.confirmedCount}</div>
              <div className="text-sm text-purple-100">Confirmed</div>
            </div>
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold">{sessionStats.unknownCount}</div>
              <div className="text-sm text-purple-100">Unknown</div>
            </div>
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold">{Math.floor(sessionStats.sessionDuration / 60)}</div>
              <div className="text-sm text-purple-100">Minutes</div>
            </div>
          </div>
        )}
      </div>

      {/* Attendance Notifications */}
      {attendanceNotifications.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {attendanceNotifications.map((notification) => (
            <div
              key={notification.id}
              className="bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-slide-in-right"
            >
              <CheckCircle className="w-5 h-5" />
              <div>
                <div className="font-semibold">Attendance Marked</div>
                <div className="text-sm text-green-100">{notification.studentName} - Present</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* AI Detection Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Camera Feed */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-lg">
            <div className="p-4 border-b border-neutral-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Camera className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-blue-900">Live Camera Feed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    isVideoPlaying ? 'bg-red-500 animate-pulse' : 
                    mediaStream ? 'bg-yellow-500' : 'bg-gray-400'
                  }`}></div>
                  <span className={`text-sm font-medium ${
                    isVideoPlaying ? 'text-red-600' : 
                    mediaStream ? 'text-yellow-600' : 'text-gray-600'
                  }`}>
                    {isVideoPlaying ? 'LIVE' : mediaStream ? 'READY' : 'OFFLINE'}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Error Display */}
            {(cameraError || faceServiceError) && (
              <div className="p-4 bg-red-50 border-b border-red-200">
                {cameraError && (
                  <div className="flex items-center gap-2 text-red-700 mb-2">
                    <X className="w-4 h-4" />
                    <span className="text-sm font-medium">Camera Error:</span>
                  </div>
                )}
                {cameraError && <p className="text-sm text-red-600 mb-2">{cameraError}</p>}
                
                {faceServiceError && (
                  <div className="flex items-center gap-2 text-red-700 mb-2">
                    <X className="w-4 h-4" />
                    <span className="text-sm font-medium">Face Recognition Error:</span>
                  </div>
                )}
                {faceServiceError && <p className="text-sm text-red-600">{faceServiceError}</p>}
              </div>
            )}
            
            <div className="relative bg-gray-900 aspect-video overflow-hidden">
              {/* Video Element */}
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
                style={{ 
                  transform: 'scaleX(-1)', // Mirror effect
                  backgroundColor: '#000' // Ensure black background
                }}
                onLoadStart={() => console.log('📹 Video load started')}
                onLoadedData={() => console.log('📊 Video data loaded')}
                onCanPlay={() => console.log('▶️ Video can play')}
              />
              
              {/* Overlay when no stream */}
              {!mediaStream && (
                <div className="absolute inset-0 flex items-center justify-center text-white bg-gray-800">
                  <div className="text-center">
                    <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium mb-2">Camera Ready</p>
                    <p className="text-sm opacity-70">Click "Start AI Attendance" to begin</p>
                  </div>
                </div>
              )}
              
              {/* Manual play button */}
              {mediaStream && !isVideoPlaying && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-30">
                  <button
                    onClick={handleManualPlay}
                    className="flex items-center gap-2 bg-white/90 hover:bg-white text-gray-900 px-6 py-3 rounded-full font-medium transition-all transform hover:scale-105 shadow-lg"
                  >
                    <Play className="w-5 h-5" />
                    Click to Start Video
                  </button>
                </div>
              )}
              
              {/* Stream status indicator with debug info */}
              {mediaStream && (
                <div className="absolute top-4 left-4 z-20">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 bg-green-500/90 text-white px-3 py-1 rounded-full text-sm">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      <span>CONNECTED</span>
                    </div>
                    
                    {/* Debug info panel */}
                    <div className="bg-black/70 text-white text-xs p-2 rounded-lg backdrop-blur-sm max-w-64">
                      <div>Stream: {mediaStream.active ? '✅ Active' : '❌ Inactive'}</div>
                      <div>Tracks: {mediaStream.getTracks().length}</div>
                      <div>Video: {isVideoPlaying ? '▶️ Playing' : '⏸️ Paused'}</div>
                      <div>AI: {isAIActive ? '🤖 Active' : '😴 Inactive'}</div>
                      <div>Dimensions: {videoDimensions.width}x{videoDimensions.height}</div>
                      {videoRef.current && (
                        <>
                          <div>Ready State: {videoRef.current.readyState}</div>
                          <div>Display: {videoRef.current.videoWidth}x{videoRef.current.videoHeight}</div>
                        </>
                      )}
                      {availableCameras.length > 0 && (
                        <div className="mt-1 pt-1 border-t border-white/20">
                          <div>Camera: {availableCameras.findIndex(c => c.deviceId === selectedCameraId) + 1}/{availableCameras.length}</div>
                          <div className="truncate">
                            {availableCameras.find(c => c.deviceId === selectedCameraId)?.label || 'Unknown Camera'}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Cool Face Recognition Animation */}
              {isVideoPlaying && isAIActive && (
                <div className="absolute inset-0 pointer-events-none z-10">
                  {/* Scanning lines animation */}
                  <div className="absolute inset-0">
                    {/* Horizontal scanning line */}
                    <div 
                      className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-80"
                      style={{
                        animation: 'scanVertical 3s ease-in-out infinite',
                        top: '0%'
                      }}
                    />
                    
                    {/* Vertical scanning line */}
                    <div 
                      className="absolute top-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-cyan-400 to-transparent opacity-80"
                      style={{
                        animation: 'scanHorizontal 4s ease-in-out infinite',
                        left: '0%'
                      }}
                    />
                  </div>

                  {/* Corner brackets */}
                  <div className="absolute top-8 left-8 w-8 h-8 border-l-2 border-t-2 border-cyan-400 opacity-80"></div>
                  <div className="absolute top-8 right-8 w-8 h-8 border-r-2 border-t-2 border-cyan-400 opacity-80"></div>
                  <div className="absolute bottom-8 left-8 w-8 h-8 border-l-2 border-b-2 border-cyan-400 opacity-80"></div>
                  <div className="absolute bottom-8 right-8 w-8 h-8 border-r-2 border-b-2 border-cyan-400 opacity-80"></div>

                  {/* Center recognition indicator */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="flex items-center gap-3 bg-black/70 backdrop-blur-sm px-4 py-2 rounded-full">
                      <div className="relative">
                        <div className="w-6 h-6 border-2 border-cyan-400 rounded-full animate-spin border-t-transparent"></div>
                        <div className="absolute inset-1 w-4 h-4 bg-cyan-400/20 rounded-full animate-pulse"></div>
                      </div>
                      <span className="text-cyan-400 font-medium text-sm animate-pulse">
                        Recognizing faces...
                      </span>
                    </div>
                  </div>

                  {/* Pulsing overlay effect */}
                  <div 
                    className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-transparent to-purple-500/5"
                    style={{
                      animation: 'pulseOverlay 2s ease-in-out infinite alternate'
                    }}
                  />
                </div>
              )}
              
              {/* Face Detection Overlays */}
              {faceDetections.map((detection) => (
                <div
                  key={detection.id}
                  className="absolute border-2 border-green-400 bg-green-400/20 rounded-lg animate-pulse z-15"
                  style={{
                    left: `${detection.x}px`,
                    top: `${detection.y}px`,
                    width: `${detection.width}px`,
                    height: `${detection.height}px`
                  }}
                >
                  <div className="absolute -top-12 left-0 bg-green-400 text-black px-2 py-1 rounded-lg text-sm font-semibold flex items-center gap-1 whitespace-nowrap">
                    <span>{detection.studentName}</span>
                    <span className="text-xs">({detection.confidence}%)</span>
                    {getEmotionIcon(detection.emotion)}
                    {detection.studentId && aiAttendance[detection.studentId] === 'present' && (
                      <span className="text-xs bg-green-600 text-white px-1 rounded ml-1">✓ MARKED</span>
                    )}
                  </div>
                  
                  {!aiSettings.enableAutoConfirm && (
                    <div className="absolute -bottom-12 left-0 flex gap-1">
                      <button
                        onClick={() => confirmDetection(detection)}
                        className="bg-green-500 text-white p-1 rounded text-xs hover:bg-green-600"
                      >
                        <Check className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => setFaceDetections(prev => prev.filter(d => d.id !== detection.id))}
                        className="bg-red-500 text-white p-1 rounded text-xs hover:bg-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Detection Log Sidebar */}
        <div className="space-y-4">
          {/* Settings Panel */}
          <div className="bg-white rounded-xl border border-neutral-200 p-4">
            <div className="flex items-center gap-2 mb-4">
              <Settings className="w-4 h-4 text-gray-600" />
              <span className="font-semibold text-gray-900">AI Settings</span>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confidence Threshold: {aiSettings.confidenceThreshold}%
                </label>
                <input
                  type="range"
                  min="50"
                  max="95"
                  value={aiSettings.confidenceThreshold}
                  onChange={(e) => setAiSettings(prev => ({ ...prev, confidenceThreshold: parseInt(e.target.value) }))}
                  className="w-full"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Auto-confirm</span>
                <button
                  onClick={() => setAiSettings(prev => ({ ...prev, enableAutoConfirm: !prev.enableAutoConfirm }))}
                  className={`w-10 h-6 rounded-full transition-colors ${
                    aiSettings.enableAutoConfirm ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                    aiSettings.enableAutoConfirm ? 'translate-x-5' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              {aiSettings.enableAutoConfirm && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Auto-confirm delay: {aiSettings.autoConfirmDelay}s
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={aiSettings.autoConfirmDelay}
                    onChange={(e) => setAiSettings(prev => ({ ...prev, autoConfirmDelay: parseInt(e.target.value) }))}
                    className="w-full"
                  />
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Emotion Detection</span>
                <button
                  onClick={() => setAiSettings(prev => ({ ...prev, enableEmotionDetection: !prev.enableEmotionDetection }))}
                  className={`w-10 h-6 rounded-full transition-colors ${
                    aiSettings.enableEmotionDetection ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                    aiSettings.enableEmotionDetection ? 'translate-x-5' : 'translate-x-1'
                  }`} />
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Learning Mode</span>
                <button
                  onClick={() => setAiSettings(prev => ({ ...prev, enableLearning: !prev.enableLearning }))}
                  className={`w-10 h-6 rounded-full transition-colors ${
                    aiSettings.enableLearning ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                    aiSettings.enableLearning ? 'translate-x-5' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>
          </div>

          {/* Detection Log */}
          <div className="bg-white rounded-xl border border-neutral-200 p-4">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-4 h-4 text-gray-600" />
              <span className="font-semibold text-gray-900">Detection Log</span>
            </div>
            
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {detectionLog.map((log) => (
                <div key={log.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                  <div className={`w-2 h-2 rounded-full ${
                    log.status === 'confirmed' ? 'bg-green-500' :
                    log.status === 'flagged' ? 'bg-yellow-500' : 'bg-red-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-gray-900 truncate">
                      {log.studentName}
                    </div>
                    <div className="text-xs text-gray-500">
                      {log.timestamp} • {log.confidence}%
                    </div>
                  </div>
                  <div className={`text-xs px-2 py-1 rounded-full ${
                    log.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                    log.status === 'flagged' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {log.status === 'confirmed' ? 'Present' : 
                     log.status === 'flagged' ? 'Review' : 'Unknown'}
                  </div>
                </div>
              ))}
              
              {detectionLog.length === 0 && (
                <div className="text-center py-4 text-gray-500 text-sm">
                  Detection log will appear here
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* AI Attendance Results */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <div className="p-6 border-b border-neutral-200 bg-gradient-to-r from-green-50 to-emerald-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Target className="w-6 h-6 text-green-600" />
              <div>
                <h3 className="text-lg font-bold text-green-900">AI Attendance Results</h3>
                <p className="text-green-700">Review and confirm AI detections</p>
              </div>
            </div>
            <button
              onClick={() => {
                // Save all AI attendance
                Object.keys(aiAttendance).forEach(studentId => {
                  saveAttendance(parseInt(studentId));
                });
              }}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Save className="w-4 h-4" />
              Save All
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
          {students.map((student) => (
            <div 
              key={student.student_id}
              className={`p-4 rounded-xl border-2 transition-all ${
                aiAttendance[student.student_id] === 'present' 
                  ? 'border-green-200 bg-green-50' 
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                  aiAttendance[student.student_id] === 'present' ? 'bg-green-500' : 'bg-gray-400'
                }`}>
                  {student.student_name.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">{student.student_name}</div>
                  <div className="text-sm text-gray-500">ID: {student.student_id}</div>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  aiAttendance[student.student_id] === 'present' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {aiAttendance[student.student_id] === 'present' ? 'Present' : 'Absent'}
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setAiAttendance(prev => ({ ...prev, [student.student_id]: 'present' }))}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                    aiAttendance[student.student_id] === 'present'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-green-100'
                  }`}
                >
                  Present
                </button>
                <button
                  onClick={() => setAiAttendance(prev => ({ ...prev, [student.student_id]: 'absence' }))}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                    aiAttendance[student.student_id] === 'absence'
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-red-100'
                  }`}
                >
                  Absent
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderManualAttendanceView = () => (
    <div className="space-y-6">
      {/* Enhanced Manual Header */}
      <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white/20 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Manual Attendance</h2>
            <p className="text-blue-100">Traditional attendance with smart assistance</p>
          </div>
        </div>
      </div>

      {/* Enhanced Manual Attendance Table */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-lg">
        <div className="p-6 border-b border-neutral-200 bg-gradient-to-r from-gray-50 to-slate-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-blue-600" />
              <div>
                <h3 className="text-lg font-bold text-gray-900">Mark Attendance</h3>
                <p className="text-gray-600">Class {selectedClass}{selectedSection} • {students.length} students</p>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              {new Date(attendanceDate).toLocaleDateString()}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Notes
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {students.map((student, index) => (
                <tr key={student.student_id} className={`hover:bg-gray-50 transition-colors ${
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                }`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                        {student.student_name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{student.student_name}</div>
                        <div className="text-sm text-gray-500">ID: {student.student_id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleManualAttendanceChange(student.student_id, 'present')}
                        className={`p-3 rounded-xl transition-all ${
                          manualAttendance[student.student_id] === 'present'
                            ? 'bg-green-100 text-green-700 shadow-lg scale-110'
                            : 'bg-gray-100 text-gray-500 hover:bg-green-50 hover:text-green-600'
                        }`}
                      >
                        <CheckCircle className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleManualAttendanceChange(student.student_id, 'absence')}
                        className={`p-3 rounded-xl transition-all ${
                          manualAttendance[student.student_id] === 'absence'
                            ? 'bg-red-100 text-red-700 shadow-lg scale-110'
                            : 'bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-600'
                        }`}
                      >
                        <XCircle className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <input
                      type="text"
                      value={notes[student.student_id] || ''}
                      onChange={(e) => handleNotesChange(student.student_id, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-300 transition-all"
                      placeholder="Add notes..."
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {saveStatus[student.student_id] === 'saving' ? (
                        <button className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg flex items-center gap-2" disabled>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Saving...
                        </button>
                      ) : saveStatus[student.student_id] === 'saved' ? (
                        <span className="px-4 py-2 bg-green-100 text-green-800 rounded-lg flex items-center gap-2">
                          <CheckCircle className="h-4 w-4" />
                          Saved
                        </span>
                      ) : saveStatus[student.student_id] === 'error' ? (
                        <span className="px-4 py-2 bg-red-100 text-red-800 rounded-lg flex items-center gap-2">
                          <XCircle className="h-4 w-4" />
                          Failed
                        </span>
                      ) : (
                        <button
                          onClick={() => saveAttendance(student.student_id)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2"
                        >
                          <Save className="w-4 h-4" />
                          Save
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderInsightsView = () => (
    <SmartAttendanceInsights 
      attendanceData={students} 
      classId={selectedClass} 
      section={selectedSection} 
    />
  );

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading attendance system...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Enhanced Header */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">
            Attendance Management
          </h1>
          <p className="text-neutral-600 text-lg">
            Advanced attendance system for Class {selectedClass}{selectedSection} • {students.length} students
          </p>
        </div>
        
        {/* Class Selection */}
        <div className="flex gap-4">
          <div className="bg-white border border-neutral-200 rounded-xl p-4 min-w-0">
            <label className="block text-sm font-semibold text-neutral-700 mb-2">Class</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="bg-transparent border-0 focus:ring-0 font-bold text-neutral-900 cursor-pointer text-lg appearance-none pr-8"
            >
              {classes.map((cls) => (
                <option key={cls} value={cls}>Class {cls}th</option>
              ))}
            </select>
          </div>
          
          <div className="bg-white border border-neutral-200 rounded-xl p-4 min-w-0">
            <label className="block text-sm font-semibold text-neutral-700 mb-2">Section</label>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="bg-transparent border-0 focus:ring-0 font-bold text-neutral-900 cursor-pointer text-lg appearance-none pr-8"
            >
              {sections.map((section) => (
                <option key={section} value={section}>Section {section}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Mode Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {attendanceModes.map((mode) => (
          <button
            key={mode.id}
            onClick={() => setAttendanceMode(mode.id)}
            className={`p-6 rounded-2xl border-2 transition-all duration-300 text-left ${
              attendanceMode === mode.id
                ? mode.id === 'ai' 
                  ? 'border-purple-300 bg-gradient-to-br from-purple-50 to-indigo-50 shadow-lg scale-105'
                  : mode.id === 'manual'
                  ? 'border-blue-300 bg-gradient-to-br from-blue-50 to-cyan-50 shadow-lg scale-105'
                  : 'border-green-300 bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg scale-105'
                : 'border-neutral-200 bg-white hover:border-neutral-300 hover:shadow-md'
            }`}
          >
            <div className="flex items-center gap-4 mb-3">
              <div className={`p-3 rounded-xl ${
                attendanceMode === mode.id
                  ? mode.id === 'ai'
                    ? 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white'
                    : mode.id === 'manual'
                    ? 'bg-gradient-to-br from-blue-500 to-cyan-600 text-white'
                    : 'bg-gradient-to-br from-green-500 to-emerald-600 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                <mode.icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-neutral-900">{mode.title}</h3>
                <p className="text-neutral-600">{mode.description}</p>
              </div>
            </div>
            
            {mode.id === 'ai' && (
              <div className="flex items-center gap-2 text-sm">
                <Sparkles className="w-4 h-4 text-purple-500" />
                <span className="text-purple-700 font-medium">Face Recognition • Real-time Detection</span>
              </div>
            )}
            
            {mode.id === 'manual' && (
              <div className="flex items-center gap-2 text-sm">
                <Eye className="w-4 h-4 text-blue-500" />
                <span className="text-blue-700 font-medium">Quick Mark • Smart Assistance</span>
              </div>
            )}

            {mode.id === 'insights' && (
              <div className="flex items-center gap-2 text-sm">
                <Target className="w-4 h-4 text-green-500" />
                <span className="text-green-700 font-medium">Pattern Analysis • Predictions</span>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Date Selection */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <div className="flex items-center gap-4">
          <Clock className="w-5 h-5 text-gray-500" />
          <label className="block text-sm font-semibold text-gray-700">
            Attendance Date
          </label>
          <input
            type="date"
            value={attendanceDate}
            onChange={(e) => setAttendanceDate(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-300 transition-all"
          />
        </div>
      </div>

      {/* Render Selected Mode */}
      {attendanceMode === 'ai' ? renderAIAttendanceView() : 
       attendanceMode === 'manual' ? renderManualAttendanceView() :
       renderInsightsView()}
    </div>
  );
};

export default EnhancedAttendanceSystem;