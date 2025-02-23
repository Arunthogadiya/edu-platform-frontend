import React, { useState, useEffect } from 'react';
import { eventService, type Event, type Assessment } from '@/services/eventService';
import { useToast } from '@/components/ui/use-toast';
import { Card } from "@/components/ui/card";
import { Calendar } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const EventsManagement: React.FC = () => {
  const [currentClass, setCurrentClass] = useState('');
  const [currentSection, setCurrentSection] = useState('');
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    event_date: '',
    class_value: '',
    section: ''
  });
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [previousEvents, setPreviousEvents] = useState<Event[]>([]);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [upcomingAssessments, setUpcomingAssessments] = useState<Assessment[]>([]);
  const [previousAssessments, setPreviousAssessments] = useState<Assessment[]>([]);
  const [activeCategory, setActiveCategory] = useState('events'); // 'events' or 'assessments'
  const [assessmentForm, setAssessmentForm] = useState({
    title: '',
    description: '',
    assessment_date: '', // Changed from event_date
    class_value: '',
    section: ''
  });

  const { toast } = useToast();
  const classes = ['6', '7', '8', '9', '10'];
  const sections = ['A', 'B', 'C'];

  const loadData = async () => {
    if (!currentClass || !currentSection) return;
    
    setIsLoading(true);
    try {
      if (activeCategory === 'events') {
        const [upcomingResponse, previousResponse] = await Promise.all([
          eventService.getUpcomingEvents(currentClass, currentSection),
          eventService.getPreviousEvents(currentClass, currentSection)
        ]);
        setUpcomingEvents(upcomingResponse || []);
        setPreviousEvents(previousResponse || []);
      } else {
        const [upcomingResponse, previousResponse] = await Promise.all([
          eventService.getUpcomingAssessments(currentClass, currentSection),
          eventService.getPreviousAssessments(currentClass, currentSection)
        ]);
        setUpcomingAssessments(upcomingResponse || []);
        setPreviousAssessments(previousResponse || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: `Failed to load ${activeCategory}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentClass && currentSection) {
      loadData();
    }
  }, [currentClass, currentSection, activeCategory]);

  const formatDateForBackend = (date: string) => {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}T${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
  };

  const handleEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!eventForm.title || !eventForm.event_date) {
      toast({
        title: "Required",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const formattedDate = formatDateForBackend(eventForm.event_date);
      const result = await eventService.createEvent({
        ...eventForm,
        event_date: formattedDate,
        class_value: currentClass,
        section: currentSection
      });

      if (result.success) {
        toast({
          title: "Success",
          description: "Event created successfully",
        });
        setEventForm({
          title: '',
          description: '',
          event_date: '',
          class_value: '',
          section: ''
        });
        
        // Immediate reload after creating new event
        await loadData();
        
        // Switch to upcoming events tab
        const upcomingTab = document.querySelector('[value="upcoming"]') as HTMLElement;
        if (upcomingTab) {
          upcomingTab.click();
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create event",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssessmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!assessmentForm.title || !assessmentForm.assessment_date) { // Changed from event_date
      toast({
        title: "Required",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const formattedDate = formatDateForBackend(assessmentForm.assessment_date); // Changed from event_date
      const result = await eventService.createAssessment({
        ...assessmentForm,
        assessment_date: formattedDate, // Changed from event_date
        class_value: currentClass,
        section: currentSection
      });

      if (result.success) {
        toast({
          title: "Success",
          description: "Assessment created successfully",
        });
        setAssessmentForm({
          title: '',
          description: '',
          assessment_date: '', // Changed from event_date
          class_value: '',
          section: ''
        });
        await loadData();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create assessment",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const EventCard = ({ event, isPast = false }: { event: Event; isPast?: boolean }) => (
    <Card className={`p-4 hover:shadow-md transition-shadow ${isPast ? 'bg-gray-50' : ''}`}>
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-lg">{event.title}</h3>
          <p className="text-sm text-gray-600 mt-1">{event.description}</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">
            {new Date(event.event_date).toLocaleString('en-US', {
              dateStyle: 'medium',
              timeStyle: 'short'
            })}
          </div>
          {isPast && (
            <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">
              Past Event
            </span>
          )}
        </div>
      </div>
    </Card>
  );

  const AssessmentCard = ({ assessment, isPast = false }: { assessment: Assessment; isPast?: boolean }) => (
    <Card className={`p-4 hover:shadow-md transition-shadow ${isPast ? 'bg-gray-50' : ''}`}>
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-lg">{assessment.title}</h3>
          <p className="text-sm text-gray-600 mt-1">{assessment.description}</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">
            {new Date(assessment.assessment_date).toLocaleString('en-US', {
              dateStyle: 'medium',
              timeStyle: 'short'
            })}
          </div>
          {isPast && (
            <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">
              Past Assessment
            </span>
          )}
        </div>
      </div>
    </Card>
  );

  return (
    <div className="p-6">
      {/* Class and Section Selector */}
      <div className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Class
            </label>
            <select
              value={currentClass}
              onChange={(e) => setCurrentClass(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Class</option>
              {classes.map((cls) => (
                <option key={cls} value={cls}>Class {cls}th</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Section
            </label>
            <select
              value={currentSection}
              onChange={(e) => setCurrentSection(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Section</option>
              {sections.map((section) => (
                <option key={section} value={section}>Section {section}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory} className="mb-6">
        <TabsList>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="assessments">Assessments</TabsTrigger>
        </TabsList>

        <TabsContent value="events">
          {/* Event Form */}
          <Card className="p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Create New Event</h2>
            <form onSubmit={handleEventSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  value={eventForm.title}
                  onChange={(e) => setEventForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-2 border rounded"
                  placeholder="Enter event title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Date & Time</label>
                <input
                  type="datetime-local"
                  value={eventForm.event_date}
                  onChange={(e) => setEventForm(prev => ({ ...prev, event_date: e.target.value }))}
                  className="w-full px-4 py-2 border rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={eventForm.description}
                  onChange={(e) => setEventForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-2 border rounded"
                  rows={3}
                  placeholder="Enter event description"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !currentClass || !currentSection}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
              >
                {isSubmitting ? 'Creating...' : 'Create Event'}
              </button>
            </form>
          </Card>

          {/* Events List with Tabs */}
          <Tabs defaultValue="upcoming" className="mt-6">
            <TabsList>
              <TabsTrigger value="upcoming">Upcoming Events</TabsTrigger>
              <TabsTrigger value="previous">Previous Events</TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming">
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">Upcoming Events</h2>
                {isLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                  </div>
                ) : upcomingEvents?.length > 0 ? (
                  <div className="grid gap-4">
                    {upcomingEvents.map((event, index) => (
                      <EventCard key={index} event={event} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    No upcoming events scheduled
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="previous">
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">Previous Events</h2>
                {isLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                  </div>
                ) : previousEvents?.length > 0 ? (
                  <div className="grid gap-4">
                    {previousEvents.map((event, index) => (
                      <EventCard 
                        key={index} 
                        event={event} 
                        isPast={true}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    No previous events found
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="assessments">
          <Card className="p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Create New Assessment</h2>
            <form onSubmit={handleAssessmentSubmit} className="space-y-4">
              {/* Similar form fields as events */}
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  value={assessmentForm.title}
                  onChange={(e) => setAssessmentForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-2 border rounded"
                  placeholder="Enter assessment title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Date & Time</label>
                <input
                  type="datetime-local"
                  value={assessmentForm.assessment_date}
                  onChange={(e) => setAssessmentForm(prev => ({ ...prev, assessment_date: e.target.value }))}
                  className="w-full px-4 py-2 border rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={assessmentForm.description}
                  onChange={(e) => setAssessmentForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-2 border rounded"
                  rows={3}
                  placeholder="Enter assessment description"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !currentClass || !currentSection}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
              >
                {isSubmitting ? 'Creating...' : 'Create Assessment'}
              </button>
            </form>
          </Card>

          {/* Assessment Lists */}
          <Tabs defaultValue="upcoming" className="mt-6">
            <TabsList>
              <TabsTrigger value="upcoming">Upcoming Assessments</TabsTrigger>
              <TabsTrigger value="previous">Previous Assessments</TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming">
              <div className="space-y-4">
                {isLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                  </div>
                ) : upcomingAssessments?.length > 0 ? (
                  <div className="grid gap-4">
                    {upcomingAssessments.map((assessment, index) => (
                      <AssessmentCard key={index} assessment={assessment} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    No upcoming assessments scheduled
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="previous">
              <div className="space-y-4">
                {isLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                  </div>
                ) : previousAssessments?.length > 0 ? (
                  <div className="grid gap-4">
                    {previousAssessments.map((assessment, index) => (
                      <AssessmentCard 
                        key={index} 
                        assessment={assessment} 
                        isPast={true}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    No previous assessments found
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EventsManagement;
