import React, { useState, useEffect } from 'react';
import { MessageSquare, PieChart, Users, Award, ThumbsUp, MessageCircle, Calendar, User, Globe, MoreVertical } from 'lucide-react';
import { communityService } from '../../../../services/communityService';

interface ForumThread {
  id: number;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  is_anonymous: boolean;
  is_reply: boolean;
  language: string;
  parent_id: number | null;
  student_id: number;
  parent_name?: string;  // Add parent name
  student_name?: string; // Add student name
}

// Update Poll interface to include parent and student names
interface Poll {
  id: number;
  question: string;
  options: string;  // JSON string
  votes: string;    // JSON string
  created_at: string;
  updated_at: string;
  parent_id: number;
  student_id: number;
  parent_name?: string;
  student_name?: string;
}

interface NewPoll {
  question: string;
  options: string[];
}

interface Reply {
  id: number;
  content: string;
  created_at: string;
  updated_at: string;
  is_anonymous: boolean;
  is_reply: boolean;
  language: string;
  parent_id: number;
  student_id: number;
  parent_name?: string;
  student_name?: string;
}

const ThreadCard: React.FC<{ 
  thread: ForumThread; 
  onClick: () => void; 
  selected: boolean;
  replies: Reply[];
  onReply: (content: string, language: string) => void;
}> = ({ thread, onClick, selected, replies, onReply }) => {
  const [newReply, setNewReply] = useState({ content: '', language: 'en' });

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="p-6">
        <div className="cursor-pointer" onClick={onClick}>
          <div className="flex items-start justify-between">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium">
                  {thread.title.charAt(0).toUpperCase()}
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {thread.title}
                </h3>
                <p className="mt-2 text-gray-600 line-clamp-2">{thread.content}</p>
                <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <User size={16} />
                    {thread.is_anonymous ? 'Anonymous' : 
                      <span className="text-gray-700">
                        {thread.parent_name || 'Parent'} 
                        {thread.student_name && <span className="text-gray-500"> (Parent of {thread.student_name})</span>}
                      </span>
                    }
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar size={16} />
                    {new Date(thread.created_at).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <Globe size={16} />
                    {thread.language.toUpperCase()}
                  </div>
                </div>
              </div>
            </div>
            <button className="p-2 hover:bg-gray-50 rounded-full">
              <MoreVertical size={20} className="text-gray-400" />
            </button>
          </div>
        </div>

        {/* Show replies section when selected */}
        {selected && (
          <div className="mt-6 border-t pt-4">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MessageSquare className="text-blue-500" />
              Replies ({replies?.length || 0})
            </h4>
            
            <div className="space-y-4 mb-6">
              {replies?.map((reply) => (
                <ReplyCard key={reply.id} reply={reply} />
              ))}
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <select
                  value={newReply.language}
                  onChange={(e) => setNewReply(prev => ({ ...prev, language: e.target.value }))}
                  className="rounded-md border-gray-300 text-sm"
                >
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                </select>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newReply.content}
                  onChange={(e) => setNewReply(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Write your reply..."
                  className="flex-1 rounded-md border-gray-300"
                />
                <button
                  onClick={() => {
                    if (newReply.content.trim()) {
                      onReply(newReply.content, newReply.language);
                      setNewReply({ content: '', language: 'en' });
                    }
                  }}
                  disabled={!newReply.content.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700
                    disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <MessageCircle size={18} />
                  Reply
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ReplyCard: React.FC<{ reply: Reply }> = ({ reply }) => (
  <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
    <p className="text-gray-700">{reply.content}</p>
    <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
      <div className="flex items-center gap-1">
        <User size={14} />
        {reply.is_anonymous ? 'Anonymous' : 
          <span>
            {reply.parent_name || 'Parent'} 
            {reply.student_name && <span className="text-gray-400"> (Parent of {reply.student_name})</span>}
          </span>
        }
      </div>
      <div className="flex items-center gap-1">
        <Calendar size={14} />
        {new Date(reply.created_at).toLocaleDateString()}
      </div>
      <div className="flex items-center gap-1">
        <Globe size={14} />
        {reply.language.toUpperCase()}
      </div>
    </div>
  </div>
);

// Update PollCard display
const PollCard: React.FC<{ poll: Poll; onVote: (option: string) => void }> = ({ poll, onVote }) => {
  try {
    // Parse the double-stringified options
    let options: string[];
    try {
      const parsedOnce = JSON.parse(poll.options);
      options = JSON.parse(parsedOnce);
    } catch {
      // Try parsing once if double parsing fails
      options = JSON.parse(poll.options);
    }

    // Initialize votes object
    const defaultVotes = options.reduce((acc, opt) => ({
      ...acc,
      [opt]: 0
    }), {});

    // Parse votes or use default
    let votesObj: Record<string, number>;
    try {
      votesObj = JSON.parse(poll.votes);
    } catch {
      votesObj = defaultVotes;
    }

    // Debug logs
    console.log('Poll parsing:', {
      rawOptions: poll.options,
      parsedOptions: options,
      rawVotes: poll.votes,
      parsedVotes: votesObj
    });

    const totalVotes = Object.values(votesObj).reduce((sum, count) => sum + count, 0);

    return (
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900">{poll.question}</h3>
            <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
              <User size={14} />
              <span>
                {poll.parent_name || 'Parent'}
                {poll.student_name && <span className="text-gray-400"> (Parent of {poll.student_name})</span>}
              </span>
              <span className="mx-2">•</span>
              <span>{new Date(poll.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        <div className="space-y-3">
          {options.map((option) => {
            const voteCount = votesObj[option] || 0;
            const percentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0;
            
            return (
              <button
                key={option}
                onClick={() => onVote(option)}
                className="w-full group"
              >
                <div className="relative bg-gray-100 rounded-lg h-12 overflow-hidden hover:bg-gray-50 transition-colors duration-200">
                  <div
                    className="absolute left-0 top-0 h-full bg-blue-500 opacity-10 group-hover:opacity-20 transition-all duration-200"
                    style={{ width: `${percentage}%` }}
                  />
                  <div className="absolute inset-0 flex items-center justify-between px-4">
                    <span className="text-sm font-medium text-gray-700">{option}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">{voteCount} votes</span>
                      <span className="text-sm font-medium text-gray-500 bg-white/80 px-2 py-1 rounded-full">
                        {percentage.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
        <div className="mt-4 flex items-center justify-end text-sm text-gray-500">
          <span>Total votes: {totalVotes}</span>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error parsing poll data:', error, poll);
    return (
      <div className="bg-red-50 p-4 rounded-lg border border-red-100">
        <p className="text-red-600">Error displaying poll</p>
      </div>
    );
  }
};

const Community: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'forums' | 'polls'>('forums');
  const [threads, setThreads] = useState<ForumThread[]>([]);
  const [polls, setPolls] = useState<Poll[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newThread, setNewThread] = useState({ title: '', content: '', language: 'en' });
  const [showNewThreadForm, setShowNewThreadForm] = useState(false);
  const [showNewPollForm, setShowNewPollForm] = useState(false);
  const [newPoll, setNewPoll] = useState<NewPoll>({
    question: '',
    options: ['', '', ''] // Default 3 options
  });
  const [selectedThread, setSelectedThread] = useState<number | null>(null);
  const [replies, setReplies] = useState<Record<number, Reply[]>>({});
  const [newReply, setNewReply] = useState({ content: '', language: 'en' });

  useEffect(() => {
    loadCommunityData();
  }, []);

  const loadCommunityData = async () => {
    try {
      const [forumData, pollData] = await Promise.all([
        communityService.getForums(),
        communityService.getPolls()
      ]);
      console.log('Raw poll data:', pollData); // Debug log
      setThreads(Array.isArray(forumData) ? forumData : []);
      setPolls(Array.isArray(pollData) ? pollData : pollData?.polls || []);
    } catch (error) {
      console.error('Error loading community data:', error);
      setThreads([]);
      setPolls([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateThread = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await communityService.createForumThread(newThread);
      setNewThread({ title: '', content: '', language: 'en' });
      setShowNewThreadForm(false);
      loadCommunityData();
    } catch (error) {
      console.error('Error creating thread:', error);
    }
  };

  const handleCreatePoll = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validOptions = newPoll.options
      .map(opt => opt.trim())
      .filter(opt => opt !== '');

    if (validOptions.length < 2) {
      alert('Please add at least 2 options');
      return;
    }

    try {
      await communityService.createPoll({
        question: newPoll.question.trim(),
        options: validOptions, // Pass directly as array
        parent_id: 2
      });
      
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
      console.log('Submitting vote:', { pollId, option }); // Debug log
      await communityService.submitVote(pollId, option);
      await loadCommunityData(); // Reload polls after voting
    } catch (error) {
      console.error('Error submitting vote:', error);
    }
  };

  const handleThreadClick = async (threadId: number) => {
    if (selectedThread === threadId) {
      setSelectedThread(null);
      return;
    }
    setSelectedThread(threadId);
    try {
      const response = await communityService.getThreadReplies(threadId);
      console.log('Replies:', response); // Debug log
      setReplies(prev => ({ ...prev, [threadId]: response }));
    } catch (error) {
      console.error('Error loading replies:', error);
    }
  };

  const handleReplySubmit = async (threadId: number, content: string, language: string) => {
    try {
      await communityService.createReply(threadId, content, language);
      const response = await communityService.getThreadReplies(threadId);
      setReplies(prev => ({ ...prev, [threadId]: response }));
      setNewReply({ content: '', language: 'en' });
    } catch (error) {
      console.error('Error submitting reply:', error);
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
              <p className="text-2xl font-bold text-purple-900">{threads?.length || 0}</p>
            </div>
            <MessageSquare className="h-8 w-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600">Active Polls</p>
              <p className="text-2xl font-bold text-blue-900">{polls?.length || 0}</p>
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
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Discussion Forums</h2>
              <p className="text-gray-500 mt-1">Join the conversation with other parents</p>
            </div>
            <button
              onClick={() => setShowNewThreadForm(true)}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700
                transition-all duration-200 transform hover:scale-105 flex items-center gap-2"
            >
              <MessageCircle size={20} />
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
                  <label className="block text-sm font-medium text-gray-700">Language</label>
                  <select
                    value={newThread.language}
                    onChange={(e) => setNewThread({ ...newThread, language: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="hi">Hindi</option>
                  </select>
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

          <div className="grid gap-6">
            {threads.map((thread) => (
              <ThreadCard
                key={thread.id}
                thread={thread}
                onClick={() => handleThreadClick(thread.id)}
                selected={selectedThread === thread.id}
                replies={replies[thread.id] || []}
                onReply={(content, language) => handleReplySubmit(thread.id, content, language)}
              />
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
                    required
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Options (minimum 2 required)
                  </label>
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
                        required={index < 2} // First two options are required
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
              <PollCard
                key={poll.id}
                poll={poll}
                onVote={(option) => handleVote(poll.id.toString(), option)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Community;
