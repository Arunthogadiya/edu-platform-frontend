import React, { useState, useRef, useEffect } from 'react';
import { learningResourceService } from '../../../../services/learningResourceService';
import { 
  Book,
  Upload,
  Play,
  Filter,
  Search,
  Plus,
  Calendar,
  Volume2,
  FileAudio,
  Mic,
  Square,
  BookOpen,
  Library,
  Headphones
} from 'lucide-react';

// Simple toast hook replacement
const useToast = () => ({
  toast: ({ title, description, variant }: { title: string; description: string; variant?: string }) => {
    console.log(`${variant === 'destructive' ? 'Error' : 'Success'}: ${title} - ${description}`);
    alert(`${title}: ${description}`);
  }
});

interface ResourceData {
  id: number;
  title: string;
  description: string;
  audio_data: string; // base64 string
  class_value: string;
  section: string;
  created_at: string;
}

const LearningResources: React.FC = () => {
  const { toast } = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    audio_data: null as File | null,
    class_value: '',
    section: ''
  });
  const [resources, setResources] = useState<ResourceData[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [playingResource, setPlayingResource] = useState<number | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const classes = ['6', '7', '8', '9', '10'];
  const sections = ['A', 'B', 'C'];

  useEffect(() => {
    if (selectedClass && selectedSection) {
      loadResources();
    }
  }, [selectedClass, selectedSection]);

  const loadResources = async () => {
    if (!selectedClass || !selectedSection) return;
    
    setIsLoading(true);
    try {
      const response = await learningResourceService.getResources(selectedClass, selectedSection);
      if (response && Array.isArray(response)) {
        setResources(response);
      }
    } catch (error) {
      console.error('Error loading resources:', error);
      toast({
        title: "Error",
        description: "Failed to load learning resources",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/wav' });
        const audioURL = URL.createObjectURL(blob);
        setAudioURL(audioURL);
        
        const audioFile = new File([blob], 'recording.wav', { type: 'audio/wav' });
        setFormData(prev => ({ ...prev, audio_data: audioFile }));
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        title: "Error",
        description: "Could not access microphone",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, audio_data: file }));
      setAudioURL(URL.createObjectURL(file));
    }
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        const base64 = base64String.split(',')[1];
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.audio_data || !selectedClass || !selectedSection) {
      toast({
        title: "Required",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const base64Audio = await convertFileToBase64(formData.audio_data);
      const submitData = {
        ...formData,
        audio_data: base64Audio,
        class_value: selectedClass,
        section: selectedSection,
      };

      const result = await learningResourceService.uploadResource(submitData);
      if (result.success) {
        toast({
          title: "Success",
          description: "Learning resource uploaded successfully",
        });
        setFormData({
          title: '',
          description: '',
          audio_data: null,
          class_value: '',
          section: ''
        });
        setAudioURL(null);
        await loadResources();
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Error",
        description: "Failed to upload resource",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const playAudio = (resource: ResourceData) => {
    if (playingResource === resource.id) {
      // Stop playing
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setPlayingResource(null);
    } else {
      // Start playing
      if (audioRef.current) {
        audioRef.current.pause();
      }
      
      const audio = new Audio(`data:audio/wav;base64,${resource.audio_data}`);
      audioRef.current = audio;
      audio.play();
      setPlayingResource(resource.id);
      
      audio.onended = () => {
        setPlayingResource(null);
      };
    }
  };

  const filteredResources = resources.filter(resource =>
    resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resource.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const ResourceCard = ({ resource }: { resource: ResourceData }) => {
    const isPlaying = playingResource === resource.id;
    
    return (
      <div className="group bg-white rounded-2xl border border-neutral-200 p-6 hover:shadow-xl hover:border-green-200 transition-all duration-300 transform hover:-translate-y-1">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-neutral-900 group-hover:text-green-700 transition-colors">
                {resource.title}
              </h3>
              <div className="flex items-center gap-2 text-sm text-neutral-500">
                <Calendar className="w-3 h-3" />
                {new Date(resource.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <FileAudio className="w-4 h-4 text-neutral-400" />
          </div>
        </div>

        {resource.description && (
          <p className="text-sm text-neutral-600 mb-4 leading-relaxed">
            {resource.description}
          </p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-neutral-500">
            <Book className="w-4 h-4" />
            <span>Class {resource.class_value}{resource.section}</span>
          </div>
          <button
            onClick={() => playAudio(resource)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
              isPlaying
                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
          >
            {isPlaying ? (
              <>
                <Square className="w-4 h-4" />
                Stop
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Play
              </>
            )}
          </button>
        </div>
      </div>
    );
  };

  if (isLoading && !resources.length) {
    return (
      <div className="min-h-[500px] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-500 text-lg">Loading learning resources...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Enhanced Header */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-neutral-900 tracking-tight flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 text-white">
              <Library className="w-8 h-8" />
            </div>
            Learning Resources
          </h1>
          <p className="text-neutral-600 text-lg">
            Create and manage audio learning materials for your students
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
              <option value="">Select Class</option>
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
              <option value="">Select Section</option>
              {sections.map((section) => (
                <option key={section} value={section}>Section {section}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      {resources.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-green-50 to-emerald-100 border border-green-200 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium mb-1">Total Resources</p>
                <p className="text-2xl font-bold text-green-700">{resources.length}</p>
              </div>
              <BookOpen className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium mb-1">Audio Files</p>
                <p className="text-2xl font-bold text-blue-700">{resources.filter(r => r.audio_data).length}</p>
              </div>
              <Headphones className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-indigo-100 border border-purple-200 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium mb-1">This Month</p>
                <p className="text-2xl font-bold text-purple-700">
                  {resources.filter(r => {
                    const resourceDate = new Date(r.created_at);
                    const currentDate = new Date();
                    return resourceDate.getMonth() === currentDate.getMonth() && 
                           resourceDate.getFullYear() === currentDate.getFullYear();
                  }).length}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>
      )}

      {/* Search and Filter */}
      {resources.length > 0 && (
        <div className="bg-white rounded-2xl border border-neutral-200 p-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search resources by title or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-300 transition-all"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-neutral-400" />
              <span className="text-sm text-neutral-600">{filteredResources.length} resources</span>
            </div>
          </div>
        </div>
      )}

       {/* Resources Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-neutral-200 p-6">
              <div className="animate-pulse">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-neutral-200 rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-neutral-200 rounded w-24"></div>
                    <div className="h-3 bg-neutral-200 rounded w-16"></div>
                  </div>
                </div>
                <div className="h-20 bg-neutral-200 rounded-xl"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {filteredResources.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResources.map((resource) => (
                <ResourceCard key={resource.id} resource={resource} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-neutral-200">
              <Library className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-neutral-700 mb-2">No Resources Found</h3>
              <p className="text-neutral-500">
                {selectedClass && selectedSection ? 
                  'No learning resources found for selected class and section' : 
                  'Please select a class and section to view resources'}
              </p>
            </div>
          )}
        </>
      )}

      {/* Enhanced Resource Creation Form */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 text-white">
            <Plus className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-neutral-900">Create New Resource</h2>
            <p className="text-neutral-600">Upload or record audio learning materials</p>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-3">Resource Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-300 transition-all"
                placeholder="Enter resource title..."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-3">Description (Optional)</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-300 transition-all"
              rows={3}
              placeholder="Describe the learning resource..."
            />
          </div>

          {/* Audio Recording/Upload Section */}
          <div className="space-y-4">
            <label className="block text-sm font-semibold text-neutral-700">Audio Content</label>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Recording Section */}
              <div className="p-4 border-2 border-dashed border-neutral-200 rounded-xl text-center">
                <Mic className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
                <p className="text-sm text-neutral-600 mb-3">Record Audio</p>
                <button
                  type="button"
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    isRecording
                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  {isRecording ? (
                    <>
                      <Square className="w-4 h-4 inline mr-2" />
                      Stop Recording
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4 inline mr-2" />
                      Start Recording
                    </>
                  )}
                </button>
              </div>

              {/* Upload Section */}
              <div className="p-4 border-2 border-dashed border-neutral-200 rounded-xl text-center">
                <Upload className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
                <p className="text-sm text-neutral-600 mb-3">Upload Audio File</p>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="audio-upload"
                />
                <label
                  htmlFor="audio-upload"
                  className="px-4 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg font-medium cursor-pointer transition-all"
                >
                  Choose File
                </label>
              </div>
            </div>

            {/* Audio Preview */}
            {audioURL && (
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3 mb-3">
                  <Volume2 className="w-5 h-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Audio Preview</span>
                </div>
                <audio controls className="w-full">
                  <source src={audioURL} type="audio/wav" />
                  Your browser does not support the audio element.
                </audio>
              </div>
            )}
          </div>
          
          <button
            type="submit"
            disabled={isSubmitting || !formData.title || !formData.audio_data || !selectedClass || !selectedSection}
            className="w-full px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-green-700 hover:to-emerald-700 transition-all duration-200 transform hover:scale-105 active:scale-95"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Uploading Resource...
              </div>
            ) : (
              'Create Resource'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LearningResources;
