import React, { useState, useEffect } from 'react';
import {
  Search,
  HelpCircle,
  FileText,
  MessageSquare,
  Phone,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
  PlayCircle,
  Download,
  ArrowRight,
  CheckCircle
} from 'lucide-react';
import { supportService } from '../../../../services/supportService';

const HelpSupport: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'faq' | 'contact' | 'status' | 'feedback'>('faq');
  const [searchQuery, setSearchQuery] = useState('');
  const [faqs, setFaqs] = useState<any[]>([]);
  const [guides, setGuides] = useState<any[]>([]);
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const [showCallbackForm, setShowCallbackForm] = useState(false);
  const [ticketForm, setTicketForm] = useState({
    title: '',
    description: '',
    category: 'general',
    priority: 'medium'
  });

  useEffect(() => {
    loadSupportData();
  }, []);

  const loadSupportData = async () => {
    try {
      const [faqsData, guidesData, statusData] = await Promise.all([
        supportService.getFAQs(),
        supportService.getGuides(),
        supportService.getSystemStatus()
      ]);
      setFaqs(faqsData);
      setGuides(guidesData);
      setSystemStatus(statusData);
    } catch (error) {
      console.error('Error loading support data:', error);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Help & Support</h1>
        <p className="text-gray-600 mt-2">Find answers, get help, and share feedback</p>
      </div>

      {/* Search Bar */}
      <div className="mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search FAQs, guides, and tutorials..."
            className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'faq', label: 'FAQs & Guides', icon: HelpCircle },
            { id: 'contact', label: 'Contact Support', icon: MessageSquare },
            { id: 'status', label: 'System Status', icon: AlertTriangle },
            { id: 'feedback', label: 'Feedback', icon: ThumbsUp }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`
                group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm
                ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
              `}
            >
              <tab.icon className={`mr-2 h-5 w-5 ${
                activeTab === tab.id ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
              }`} />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content based on active tab */}
      <div className="space-y-6">
        {activeTab === 'faq' && (
          <div className="grid gap-8 md:grid-cols-2">
            {/* FAQs */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Frequently Asked Questions</h2>
              {faqs.map((faq) => (
                <div key={faq.id} className="bg-white p-4 rounded-lg shadow-sm border">
                  <h3 className="font-medium text-gray-900">{faq.question}</h3>
                  <p className="mt-2 text-gray-600 text-sm">{faq.answer}</p>
                  {faq.videoUrl && (
                    <a
                      href={faq.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center text-sm text-blue-600 hover:text-blue-700"
                    >
                      <PlayCircle className="h-4 w-4 mr-1" />
                      Watch Tutorial
                    </a>
                  )}
                </div>
              ))}
            </div>

            {/* Guides */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Step-by-Step Guides</h2>
              {guides.map((guide) => (
                <div key={guide.id} className="bg-white p-4 rounded-lg shadow-sm border">
                  <h3 className="font-medium text-gray-900">{guide.title}</h3>
                  <p className="mt-1 text-sm text-gray-600">{guide.description}</p>
                  <div className="mt-3 space-y-2">
                    {guide.steps.map((step, index) => (
                      <div key={index} className="flex items-start">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">
                          {index + 1}
                        </span>
                        <span className="ml-2 text-sm text-gray-600">{step}</span>
                      </div>
                    ))}
                  </div>
                  {guide.pdfUrl && (
                    <a
                      href={guide.pdfUrl}
                      className="mt-3 inline-flex items-center text-sm text-blue-600 hover:text-blue-700"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download PDF Guide
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'contact' && (
          <div className="grid gap-8 md:grid-cols-2">
            {/* Contact Form */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Submit a Support Ticket</h2>
              <form className="space-y-4">
                {/* Form fields */}
              </form>
            </div>

            {/* Alternative Contact Methods */}
            <div className="space-y-4">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="font-medium text-gray-900">Request a Callback</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Prefer to talk? Schedule a call with our support team.
                </p>
                <button
                  onClick={() => setShowCallbackForm(true)}
                  className="mt-4 inline-flex items-center text-sm text-blue-600 hover:text-blue-700"
                >
                  <Phone className="h-4 w-4 mr-1" />
                  Schedule Call
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'status' && systemStatus && (
          <div className="space-y-6">
            {/* System Status Overview */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">System Status</h2>
                <span className={`px-3 py-1 rounded-full text-sm
                  ${systemStatus.status === 'operational' ? 'bg-green-100 text-green-700' :
                    systemStatus.status === 'degraded' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'}`}>
                  {systemStatus.status.charAt(0).toUpperCase() + systemStatus.status.slice(1)}
                </span>
              </div>
              <div className="mt-6 space-y-4">
                {systemStatus.components.map((component: any) => (
                  <div key={component.name} className="flex items-center justify-between">
                    <span className="text-gray-600">{component.name}</span>
                    <span className={`flex items-center
                      ${component.status === 'operational' ? 'text-green-600' :
                        component.status === 'degraded' ? 'text-yellow-600' :
                        'text-red-600'}`}>
                      <CheckCircle className="h-4 w-4 mr-1" />
                      {component.status.charAt(0).toUpperCase() + component.status.slice(1)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Incidents */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Incidents</h2>
              <div className="space-y-4">
                {systemStatus.incidents.map((incident: any) => (
                  <div key={incident.id} className="border-l-4 border-yellow-400 pl-4">
                    <h3 className="font-medium text-gray-900">{incident.title}</h3>
                    <p className="mt-1 text-sm text-gray-600">
                      Status: {incident.status.charAt(0).toUpperCase() + incident.status.slice(1)}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      Last updated: {new Date(incident.lastUpdate).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'feedback' && (
          <div className="grid gap-8 md:grid-cols-2">
            {/* Feedback Form */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Share Your Feedback</h2>
              <form className="space-y-4">
                {/* Feedback form fields */}
              </form>
            </div>

            {/* Feature Voting */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Vote on Features</h2>
              <div className="space-y-4">
                {/* Feature voting items */}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HelpSupport;
