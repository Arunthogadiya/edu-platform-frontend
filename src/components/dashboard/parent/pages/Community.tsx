import React, { useState, useEffect } from 'react';
import { MessageSquare, PieChart, Users, Award, ThumbsUp } from 'lucide-react';
import { communityService } from '../../../../services/communityService';

interface ForumThread {
  id: string;
  title: string;
  description: string;
  author: string;
  replies: number;
  likes: number;
  date: string;
}

interface Poll {
  id: string;
  question: string;
  options: string[];
  votes: number[];
  total_votes: number;
}

interface NewPoll {
  question: string;
  options: string[];
}

const Community: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'forums' | 'polls'>('forums');
  const [threads, setThreads] = useState<ForumThread[]>([]);
  const [polls, setPolls] = useState<Poll[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newThread, setNewThread] = useState({ title: '', content: '' });
  const [showNewThreadForm, setShowNewThreadForm] = useState(false);
  const [showNewPollForm, setShowNewPollForm] = useState(false);
  const [newPoll, setNewPoll] = useState<NewPoll>({
    question: '',
    options: ['', '', ''] // Default 3 options
  });

  useEffect(() => {
    loadCommunityData();
  }, []);

  const loadCommunityData = async () => {
    try {
      const [forumData, pollData] = await Promise.all([
        communityService.getForums(),
        communityService.getPolls()
      ]);
      setThreads(forumData.threads);
      setPolls(pollData.polls);
    } catch (error) {
      console.error('Error loading community data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateThread = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await communityService.createForumThread(newThread);
      setNewThread({ title: '', content: '' });
      setShowNewThreadForm(false);
      loadCommunityData();
    } catch (error) {
      console.error('Error creating thread:', error);
    }
  };

  const handleCreatePoll = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await communityService.createPoll(newPoll);
      setNewPoll({ question: '', options: ['', '', ''] });
      setShowNewPollForm(false);
      loadCommunityData();
    } catch (error) {
      console.error('Error creating poll:', error);
    }
  };

  const addPollOption = () => {
    if (newPoll.options.length < 6) { // Maximum 6 options
      setNewPoll({
        ...newPoll,
        options: [...newPoll.options, '']
      });
    }
  };

  const removePollOption = (index: number) => {
    if (newPoll.options.length > 2) { // Minimum 2 options
      setNewPoll({
        ...newPoll,
        options: newPoll.options.filter((_, i) => i !== index)
      });
    }
  };

  const handleVote = async (pollId: string, option: string) => {
    try {
      await communityService.submitVote(pollId, option);
      loadCommunityData();
    } catch (error) {
      console.error('Error submitting vote:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Parent Community</h1>
        <p className="text-gray-600 mt-2">Connect, discuss, and engage with other parents</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600">Active Discussions</p>
              <p className="text-2xl font-bold text-purple-900">{threads.length}</p>
            </div>
            <MessageSquare className="h-8 w-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600">Active Polls</p>
              <p className="text-2xl font-bold text-blue-900">{polls.length}</p>
            </div>
            <PieChart className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-xl border border-green-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600">Community Members</p>
              <p className="text-2xl font-bold text-green-900">127</p>
            </div>
            <Users className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600">Your Points</p>
              <p className="text-2xl font-bold text-yellow-900">350</p>
            </div>
            <Award className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
      </div>

      {/* Enhanced Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {['forums', 'polls'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as 'forums' | 'polls')}
              className={`
                py-4 px-6 font-medium text-sm rounded-t-lg transition-all duration-200
                ${activeTab === tab
                  ? 'bg-white border-t border-l border-r border-gray-200 text-blue-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}
              `}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'forums' ? (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Discussion Forums</h2>
            <button
              onClick={() => setShowNewThreadForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Start Discussion
            </button>
          </div>

          {showNewThreadForm && (
            <form onSubmit={handleCreateThread} className="bg-white p-6 rounded-lg shadow-sm border mb-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <input
                    type="text"
                    value={newThread.title}
                    onChange={(e) => setNewThread({ ...newThread, title: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Content</label>
                  <textarea
                    value={newThread.content}
                    onChange={(e) => setNewThread({ ...newThread, content: e.target.value })}
                    rows={4}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowNewThreadForm(false)}
                    className="px-4 py-2 border rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Create Thread
                  </button>
                </div>
              </div>
            </form>
          )}

          <div className="space-y-4">
            {threads.map((thread) => (
              <div key={thread.id} className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{thread.title}</h3>
                    <p className="mt-1 text-gray-600">{thread.description}</p>
                  </div>
                  <button className="flex items-center text-gray-400 hover:text-blue-500">
                    <ThumbsUp className="h-5 w-5" />
                    <span className="ml-1 text-sm">{thread.likes}</span>
                  </button>
                </div>
                <div className="mt-4 flex items-center text-sm text-gray-500">
                  <span>{thread.author}</span>
                  <span className="mx-2">•</span>
                  <span>{thread.replies} replies</span>
                  <span className="mx-2">•</span>
                  <span>{thread.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Community Polls</h2>
            <button
              onClick={() => setShowNewPollForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700
                transition-all duration-200 transform hover:scale-105 active:scale-95
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Create New Poll
            </button>
          </div>

          {showNewPollForm && (
            <form onSubmit={handleCreatePoll} className="bg-white p-6 rounded-lg shadow-sm border mb-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Question</label>
                  <input
                    type="text"
                    value={newPoll.question}
                    onChange={(e) => setNewPoll({ ...newPoll, question: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm 
                      focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200"
                    placeholder="Enter your poll question"
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">Options</label>
                  {newPoll.options.map((option, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...newPoll.options];
                          newOptions[index] = e.target.value;
                          setNewPoll({ ...newPoll, options: newOptions });
                        }}
                        className="flex-1 rounded-md border-gray-300 shadow-sm 
                          focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200"
                        placeholder={`Option ${index + 1}`}
                      />
                      {newPoll.options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removePollOption(index)}
                          className="p-2 text-red-600 hover:text-red-700 
                            rounded-md hover:bg-red-50 transition-colors duration-200"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {newPoll.options.length < 6 && (
                  <button
                    type="button"
                    onClick={addPollOption}
                    className="text-sm text-blue-600 hover:text-blue-700 
                      flex items-center space-x-1 px-3 py-1 rounded-md 
                      hover:bg-blue-50 transition-colors duration-200"
                  >
                    <span>+ Add Option</span>
                  </button>
                )}

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowNewPollForm(false)}
                    className="px-4 py-2 border rounded-md hover:bg-gray-50 
                      transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md 
                      hover:bg-blue-700 transition-colors duration-200
                      transform hover:scale-105 active:scale-95
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Create Poll
                  </button>
                </div>
              </div>
            </form>
          )}

          <div className="grid gap-6">
            {polls.map((poll) => (
              <div key={poll.id} className="bg-white p-6 rounded-lg shadow-sm border 
                hover:shadow-md transition-all duration-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">{poll.question}</h3>
                <div className="space-y-3">
                  {poll.options.map((option, index) => {
                    const percentage = (poll.votes[index] / poll.total_votes) * 100 || 0;
                    return (
                      <button
                        key={index}
                        onClick={() => handleVote(poll.id, option)}
                        className="w-full group"
                      >
                        <div className="relative bg-gray-100 rounded-lg h-12 overflow-hidden
                          hover:bg-gray-50 transition-colors duration-200">
                          <div
                            className="absolute left-0 top-0 h-full bg-blue-500 opacity-10
                              group-hover:opacity-20 transition-all duration-200"
                            style={{ width: `${percentage}%` }}
                          />
                          <div className="absolute inset-0 flex items-center justify-between px-4">
                            <span className="text-sm font-medium text-gray-700">{option}</span>
                            <span className="text-sm font-medium text-gray-500 
                              bg-white/80 px-2 py-1 rounded-full">
                              {percentage.toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
                <p className="mt-4 text-sm text-gray-500">
                  {poll.total_votes} total votes
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Community;
