import React, { useRef, useState, useEffect } from 'react';

const VideoTest: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [status, setStatus] = useState<string>('Not started');

  const startCamera = async () => {
    try {
      setStatus('Requesting camera...');
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: false
      });
      
      setStream(mediaStream);
      setStatus('Camera obtained');
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStatus('Video source set');
        
        try {
          await videoRef.current.play();
          setStatus('Video playing');
        } catch (err) {
          setStatus('Play failed: ' + err);
        }
      }
    } catch (error) {
      setStatus('Error: ' + error);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setStatus('Camera stopped');
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Video Test Component</h2>
      
      <div className="mb-4">
        <button
          onClick={startCamera}
          className="bg-green-500 text-white px-4 py-2 rounded mr-2"
        >
          Start Camera
        </button>
        <button
          onClick={stopCamera}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Stop Camera
        </button>
      </div>
      
      <div className="mb-4">
        <strong>Status:</strong> {status}
      </div>
      
      <div className="relative bg-black rounded-lg overflow-hidden" style={{ aspectRatio: '4/3' }}>
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover"
          onLoadedMetadata={() => console.log('Metadata loaded')}
          onCanPlay={() => console.log('Can play')}
          onPlay={() => console.log('Playing')}
          onError={(e) => console.error('Video error:', e)}
        />
        
        {!stream && (
          <div className="absolute inset-0 flex items-center justify-center text-white">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-gray-400 rounded-full mb-2 mx-auto"></div>
              <p>No video stream</p>
            </div>
          </div>
        )}
        
        {stream && (
          <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-sm">
            LIVE
          </div>
        )}
      </div>
      
      <div className="mt-4 text-sm text-gray-600">
        <p>Video ref exists: {videoRef.current ? 'Yes' : 'No'}</p>
        <p>Stream active: {stream?.active ? 'Yes' : 'No'}</p>
        <p>Video dimensions: {videoRef.current?.videoWidth}x{videoRef.current?.videoHeight}</p>
        <p>Ready state: {videoRef.current?.readyState}/4</p>
        <p>Paused: {videoRef.current?.paused ? 'Yes' : 'No'}</p>
      </div>
    </div>
  );
};

export default VideoTest;
