import React, { useState, useRef, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mic, Square, Upload } from 'lucide-react';
import { learningResourceService } from '@/services/learningResourceService';

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

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  const classes = ['6', '7', '8', '9', '10'];
  const sections = ['A', 'B', 'C'];

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
        // Remove the data:audio/xxx;base64, prefix
        const base64 = base64String.split(',')[1];
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.audio_data || !formData.class_value || !formData.section) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const audioBase64 = await convertFileToBase64(formData.audio_data);

      const result = await learningResourceService.uploadResource({
        title: formData.title,
        description: formData.description,
        audio_data: audioBase64,
        class_value: formData.class_value,
        section: formData.section
      });

      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        });

        // Add the new resource to the existing resources list
        const newResource = {
          id: result.data.id,
          title: formData.title,
          description: formData.description,
          audio_data: audioBase64,
          class_value: formData.class_value,
          section: formData.section,
          created_at: new Date().toISOString()
        };

        // Update resources list if the uploaded resource matches current filter
        if (formData.class_value === selectedClass && formData.section === selectedSection) {
          setResources(prev => [newResource, ...prev]);
        }

        // Reset form
        setFormData({
          title: '',
          description: '',
          audio_data: null,
          class_value: '',
          section: ''
        });
        setAudioURL(null);
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to upload learning resource",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchResources = async () => {
    if (!selectedClass || !selectedSection) return;
    
    setIsLoading(true);
    try {
      const data = await learningResourceService.getResources(selectedClass, selectedSection);
      setResources(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch resources",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [selectedClass, selectedSection]);

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this resource?')) {
      const result = await learningResourceService.deleteResource(id);
      if (result.success) {
        toast({
          title: "Success",
          description: "Resource deleted successfully",
        });
        fetchResources();
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    }
  };

  const getAudioUrl = (base64Data: string): string => {
    return `data:audio/wav;base64,${base64Data}`;
  };

  return (
    <div className="p-6">
      {/* Class and Section Filter */}
      <div className="mb-6 flex gap-4">
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="px-3 py-2 border rounded-md"
        >
          <option value="">Select Class</option>
          {classes.map((cls) => (
            <option key={cls} value={cls}>Class {cls}</option>
          ))}
        </select>

        <select
          value={selectedSection}
          onChange={(e) => setSelectedSection(e.target.value)}
          className="px-3 py-2 border rounded-md"
        >
          <option value="">Select Section</option>
          {sections.map((section) => (
            <option key={section} value={section}>Section {section}</option>
          ))}
        </select>
      </div>

      {/* Resources List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {isLoading ? (
          <div className="col-span-2 flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : resources.length > 0 ? (
          resources.map((resource) => (
            <Card key={resource.id} className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg">{resource.title}</h3>
                <button
                  onClick={() => handleDelete(resource.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  Delete
                </button>
              </div>
              <p className="text-gray-600 text-sm mb-2">{resource.description}</p>
              <div className="text-xs text-gray-500 mb-3">
                <span>Class {resource.class_value} - Section {resource.section}</span>
                <span className="ml-2">•</span>
                <span className="ml-2">
                  {new Date(resource.created_at).toLocaleDateString()}
                </span>
              </div>
              <audio 
                controls 
                className="w-full" 
                src={getAudioUrl(resource.audio_data)}
              >
                Your browser does not support the audio element.
              </audio>
            </Card>
          ))
        ) : (
          <div className="col-span-2 text-center py-8 text-gray-500">
            {selectedClass && selectedSection 
              ? "No resources found for selected class and section" 
              : "Select a class and section to view resources"}
          </div>
        )}
      </div>

      {/* Upload Form */}
      <div className="border-t pt-6">
        <h2 className="text-xl font-semibold mb-4">Upload New Resource</h2>
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
          <Card className="p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <Input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter resource title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-md"
                  rows={4}
                  placeholder="Enter resource description"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Class</label>
                  <select
                    value={formData.class_value}
                    onChange={(e) => setFormData(prev => ({ ...prev, class_value: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md"
                    required
                  >
                    <option value="">Select Class</option>
                    {classes.map((cls) => (
                      <option key={cls} value={cls}>Class {cls}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Section</label>
                  <select
                    value={formData.section}
                    onChange={(e) => setFormData(prev => ({ ...prev, section: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md"
                    required
                  >
                    <option value="">Select Section</option>
                    {sections.map((section) => (
                      <option key={section} value={section}>Section {section}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Audio</label>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Button
                      type="button"
                      onClick={isRecording ? stopRecording : startRecording}
                      variant={isRecording ? "destructive" : "default"}
                    >
                      {isRecording ? (
                        <>
                          <Square className="w-4 h-4 mr-2" />
                          Stop Recording
                        </>
                      ) : (
                        <>
                          <Mic className="w-4 h-4 mr-2" />
                          Start Recording
                        </>
                      )}
                    </Button>

                    <div className="relative">
                      <input
                        type="file"
                        accept="audio/*"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="audio-upload"
                      />
                      <Button
                        type="button"
                        onClick={() => document.getElementById('audio-upload')?.click()}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Audio
                      </Button>
                    </div>
                  </div>

                  {audioURL && (
                    <div className="mt-4">
                      <audio controls src={audioURL} className="w-full" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? 'Uploading...' : 'Upload Resource'}
              </Button>
            </div>
          </Card>
        </form>
      </div>
    </div>
  );
};

export default LearningResources;