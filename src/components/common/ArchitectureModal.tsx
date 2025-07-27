import React from 'react';
import { X, Download, Maximize2, ZoomIn, ZoomOut } from 'lucide-react';

// Import the architecture image - using Vite's asset handling
import archImage from '../../assets/arch.png';

interface ArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ArchitectureModal: React.FC<ArchitectureModalProps> = ({ isOpen, onClose }) => {
  const [isZoomed, setIsZoomed] = React.useState(false);
  const [zoomLevel, setZoomLevel] = React.useState(1);

  // Handle escape key
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = archImage;
    link.download = 'architecture-diagram.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleFullscreen = () => {
    setIsZoomed(!isZoomed);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-2xl shadow-2xl transition-all duration-300 ${
        isZoomed ? 'w-[95vw] h-[95vh]' : 'w-full max-w-4xl max-h-[90vh]'
      } overflow-hidden`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200 bg-gradient-to-r from-primary-50 to-purple-50">
          <div>
            <h2 className="text-2xl font-display font-bold text-neutral-900">
              System Architecture
            </h2>
            <p className="text-neutral-600 mt-1">
              Complete platform architecture overview
            </p>
          </div>
          
          {/* Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleZoomOut}
              className="p-2 hover:bg-white/80 rounded-lg transition-colors tooltip"
              title="Zoom Out"
              disabled={zoomLevel <= 0.5}
            >
              <ZoomOut className="w-5 h-5 text-neutral-600" />
            </button>
            
            <button
              onClick={handleZoomIn}
              className="p-2 hover:bg-white/80 rounded-lg transition-colors tooltip"
              title="Zoom In"
              disabled={zoomLevel >= 3}
            >
              <ZoomIn className="w-5 h-5 text-neutral-600" />
            </button>
            
            <button
              onClick={handleFullscreen}
              className="p-2 hover:bg-white/80 rounded-lg transition-colors tooltip"
              title={isZoomed ? "Exit Fullscreen" : "Fullscreen"}
            >
              <Maximize2 className="w-5 h-5 text-neutral-600" />
            </button>
            
            <button
              onClick={handleDownload}
              className="p-2 hover:bg-white/80 rounded-lg transition-colors tooltip"
              title="Download"
            >
              <Download className="w-5 h-5 text-neutral-600" />
            </button>
            
            <div className="w-px h-6 bg-neutral-300 mx-1"></div>
            
            <button
              onClick={onClose}
              className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600 tooltip"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto bg-neutral-50">
          <div className="p-6 flex items-center justify-center min-h-full">
            <div 
              className="relative bg-white rounded-xl shadow-lg p-4 transition-all duration-300"
              style={{ transform: `scale(${zoomLevel})` }}
            >
              <img
                src={archImage}
                alt="System Architecture Diagram"
                className="max-w-full h-auto rounded-lg"
                style={{ maxWidth: '100%', height: 'auto' }}
                onLoad={() => console.log('Architecture diagram loaded')}
                onError={() => console.error('Failed to load architecture diagram')}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-neutral-200 bg-neutral-50">
          <div className="flex items-center gap-4 text-sm text-neutral-600">
            <span>Zoom: {Math.round(zoomLevel * 100)}%</span>
            <span>•</span>
            <span>Use mouse wheel to zoom</span>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-neutral-200 text-neutral-700 rounded-lg 
                       hover:bg-neutral-100 transition-colors font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArchitectureModal;
