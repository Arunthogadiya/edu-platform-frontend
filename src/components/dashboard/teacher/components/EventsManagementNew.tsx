import React, { useState, useEffect } from 'react';
import { eventService, type Event, type Assessment } from '../../../../services/eventService';
import { 
  Calendar,
  Users, 
  Clock,
  Filter,
  Search,
  Plus,
  Eye,
  X,
  CalendarDays,
  Bell,
  BookOpen,
  Target,
  CheckCircle,
  Sparkles
} from 'lucide-react';

// Simple toast hook replacement
const useToast = () => ({
  toast: ({ title, description, variant }: { title: string; description: string; variant?: string }) => {
    console.log(`${variant === 'destructive' ? 'Error' : 'Success'}: ${title} - ${description}`);
    alert(`${title}: ${description}`);
  }
});

// Custom Modal Component
const Modal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

const EventsManagement: React.FC = () => {
  const [currentClass, setCurrentClass] = useState('');
  const [currentSection, setCurrentSection] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    event_date: '',
    class_value: '',
    section: ''
  });
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [previousEvents, setPreviousEvents] = useState<Event[]>([]);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'previous'>('upcoming');
  const [upcomingAssessments, setUpcomingAssessments] = useState<Assessment[]>([]);
  const [previousAssessments, setPreviousAssessments] = useState<Assessment[]>([]);
  const [activeCategory, setActiveCategory] = useState<'events' | 'assessments'>('events');
  const [assessmentForm, setAssessmentForm] = useState({
    title: '',
    description: '',
    assessment_date: '',
    class_value: '',
    section: ''
  });
  const [showEventForm, setShowEventForm] = useState(false);
  const [showAssessmentForm, setShowAssessmentForm] = useState(false);

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
        setShowEventForm(false);
        await loadData();
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
    
    if (!assessmentForm.title || !assessmentForm.assessment_date) {
      toast({
        title: "Required",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const formattedDate = formatDateForBackend(assessmentForm.assessment_date);
      const result = await eventService.createAssessment({
        ...assessmentForm,
        assessment_date: formattedDate,
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
          assessment_date: '',
          class_value: '',
          section: ''
        });
        setShowAssessmentForm(false);
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

  const isUpcoming = (date: string) => {
    return new Date(date) > new Date();
  };

  const currentItems = activeCategory === 'events' 
    ? (activeTab === 'upcoming' ? upcomingEvents : previousEvents)
    : (activeTab === 'upcoming' ? upcomingAssessments : previousAssessments);

  const filteredItems = currentItems.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const ItemCard = ({ item }: { item: Event | Assessment }) => {
    const dateField = 'event_date' in item ? item.event_date : item.assessment_date;
    const isUpcomingItem = isUpcoming(dateField);
    
    return (
      <div className={`group bg-white rounded-2xl border-2 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${
        isUpcomingItem 
          ? 'border-blue-200 hover:border-blue-300' 
          : 'border-gray-200 hover:border-gray-300'
      }`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              activeCategory === 'events'
                ? 'bg-gradient-to-br from-blue-100 to-cyan-100'
                : 'bg-gradient-to-br from-purple-100 to-indigo-100'
            }`}>
              {activeCategory === 'events' ? (
                <Calendar className={`w-6 h-6 ${isUpcomingItem ? 'text-blue-600' : 'text-gray-600'}`} />
              ) : (
                <BookOpen className={`w-6 h-6 ${isUpcomingItem ? 'text-purple-600' : 'text-gray-600'}`} />
              )}
            </div>
            <div>
              <h3 className={`font-bold text-lg transition-colors ${
                isUpcomingItem 
                  ? 'text-neutral-900 group-hover:text-blue-700' 
                  : 'text-neutral-700 group-hover:text-gray-700'
              }`}>
                {item.title}
              </h3>
              <div className="flex items-center gap-2 text-sm text-neutral-500">
                <Clock className="w-3 h-3" />
                {new Date(dateField).toLocaleDateString('en-US', {
                  weekday: 'short',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isUpcomingItem ? (
              <div className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                Upcoming
              </div>
            ) : (
              <div className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                Completed
              </div>
            )}
            {isUpcomingItem ? (
              <Bell className="w-4 h-4 text-blue-500" />
            ) : (
              <CheckCircle className="w-4 h-4 text-green-500" />
            )}
          </div>
        </div>

        {item.description && (
          <div className={`p-4 rounded-xl border ${
            isUpcomingItem 
              ? 'border-blue-100 bg-blue-50' 
              : 'border-gray-100 bg-gray-50'
          }`}>
            <p className="text-sm leading-relaxed text-gray-700">{item.description}</p>
          </div>
        )}

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                Class {currentClass}{currentSection}
              </span>
            </div>
            {isUpcomingItem && (
              <div className="flex items-center gap-1">
                <Sparkles className="w-4 h-4 text-yellow-500" />
                <span className="text-sm text-gray-600">
                  {Math.ceil((new Date(dateField).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days left
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs text-blue-600 font-medium">
            View Details
            <Eye className="w-3 h-3" />
          </div>
        </div>
      </div>
    );
  };

  if (isLoading && currentItems.length === 0) {
    return (
      <div className="min-h-[500px] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-500 text-lg">Loading events and assessments...</p>
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
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
              <CalendarDays className="w-8 h-8" />
            </div>
            Events Management
          </h1>
          <p className="text-neutral-600 text-lg">
            Schedule and manage class events and assessments efficiently
          </p>
        </div>
        
        {/* Class Selection */}
        <div className="flex gap-4">
          <div className="bg-white border border-neutral-200 rounded-xl p-4 min-w-0">
            <label className="block text-sm font-semibold text-neutral-700 mb-2">Class</label>
            <select
              value={currentClass}
              onChange={(e) => setCurrentClass(e.target.value)}
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
              value={currentSection}
              onChange={(e) => setCurrentSection(e.target.value)}
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

      {/* Category Toggle */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-2">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setActiveCategory('events')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
              activeCategory === 'events'
                ? 'bg-blue-100 text-blue-700 shadow-sm'
                : 'text-neutral-600 hover:bg-neutral-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Calendar className="w-5 h-5" />
              Events
            </div>
          </button>
          <button
            onClick={() => setActiveCategory('assessments')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
              activeCategory === 'assessments'
                ? 'bg-purple-100 text-purple-700 shadow-sm'
                : 'text-neutral-600 hover:bg-neutral-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <BookOpen className="w-5 h-5" />
              Assessments
            </div>
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      {(upcomingEvents.length > 0 || previousEvents.length > 0 || upcomingAssessments.length > 0 || previousAssessments.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-cyan-100 border border-blue-200 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium mb-1">Upcoming Events</p>
                <p className="text-2xl font-bold text-blue-700">{upcomingEvents.length}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-indigo-100 border border-purple-200 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium mb-1">Upcoming Assessments</p>
                <p className="text-2xl font-bold text-purple-700">{upcomingAssessments.length}</p>
              </div>
              <BookOpen className="w-8 h-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-100 border border-green-200 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium mb-1">Completed Events</p>
                <p className="text-2xl font-bold text-green-700">{previousEvents.length}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-orange-100 border border-amber-200 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-600 text-sm font-medium mb-1">Total Scheduled</p>
                <p className="text-2xl font-bold text-amber-700">
                  {upcomingEvents.length + previousEvents.length + upcomingAssessments.length + previousAssessments.length}
                </p>
              </div>
              <Target className="w-8 h-8 text-amber-600" />
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={() => activeCategory === 'events' ? setShowEventForm(true) : setShowAssessmentForm(true)}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all duration-200 transform hover:scale-105 active:scale-95 ${
            activeCategory === 'events'
              ? 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700'
              : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700'
          }`}
        >
          <Plus className="w-5 h-5" />
          Create {activeCategory === 'events' ? 'Event' : 'Assessment'}
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-2">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
              activeTab === 'upcoming'
                ? 'bg-blue-100 text-blue-700 shadow-sm'
                : 'text-neutral-600 hover:bg-neutral-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Bell className="w-5 h-5" />
              Upcoming
            </div>
          </button>
          <button
            onClick={() => setActiveTab('previous')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
              activeTab === 'previous'
                ? 'bg-gray-100 text-gray-700 shadow-sm'
                : 'text-neutral-600 hover:bg-neutral-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Previous
            </div>
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      {currentItems.length > 0 && (
        <div className="bg-white rounded-2xl border border-neutral-200 p-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
              <input
                type="text"
                placeholder={`Search ${activeCategory}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-300 transition-all"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-neutral-400" />
              <span className="text-sm text-neutral-600">{filteredItems.length} items</span>
            </div>
          </div>
        </div>
      )}

      {/* Items Grid */}
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
          {filteredItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-neutral-200">
              {activeCategory === 'events' ? (
                <Calendar className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
              ) : (
                <BookOpen className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
              )}
              <h3 className="text-xl font-semibold text-neutral-700 mb-2">
                No {activeCategory} Found
              </h3>
              <p className="text-neutral-500">
                {currentClass && currentSection ? 
                  `No ${activeTab} ${activeCategory} found for selected class and section` : 
                  'Please select a class and section to view items'}
              </p>
            </div>
          )}
        </>
      )}

      {/* Event Form Modal */}
      <Modal
        isOpen={showEventForm}
        onClose={() => setShowEventForm(false)}
        title="Create New Event"
      >
        <form onSubmit={handleEventSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-3">Event Title</label>
            <input
              type="text"
              value={eventForm.title}
              onChange={(e) => setEventForm(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-300 transition-all"
              placeholder="Enter event title..."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-3">Event Date</label>
            <input
              type="datetime-local"
              value={eventForm.event_date}
              onChange={(e) => setEventForm(prev => ({ ...prev, event_date: e.target.value }))}
              className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-300 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-3">Description (Optional)</label>
            <textarea
              value={eventForm.description}
              onChange={(e) => setEventForm(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-300 transition-all"
              rows={4}
              placeholder="Add event description..."
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !eventForm.title || !eventForm.event_date}
            className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-blue-700 hover:to-cyan-700 transition-all duration-200"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Creating Event...
              </div>
            ) : (
              'Create Event'
            )}
          </button>
        </form>
      </Modal>

      {/* Assessment Form Modal */}
      <Modal
        isOpen={showAssessmentForm}
        onClose={() => setShowAssessmentForm(false)}
        title="Create New Assessment"
      >
        <form onSubmit={handleAssessmentSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-3">Assessment Title</label>
            <input
              type="text"
              value={assessmentForm.title}
              onChange={(e) => setAssessmentForm(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-300 transition-all"
              placeholder="Enter assessment title..."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-3">Assessment Date</label>
            <input
              type="datetime-local"
              value={assessmentForm.assessment_date}
              onChange={(e) => setAssessmentForm(prev => ({ ...prev, assessment_date: e.target.value }))}
              className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-300 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-3">Description (Optional)</label>
            <textarea
              value={assessmentForm.description}
              onChange={(e) => setAssessmentForm(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-300 transition-all"
              rows={4}
              placeholder="Add assessment description..."
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !assessmentForm.title || !assessmentForm.assessment_date}
            className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-purple-700 hover:to-indigo-700 transition-all duration-200"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Creating Assessment...
              </div>
            ) : (
              'Create Assessment'
            )}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default EventsManagement;
