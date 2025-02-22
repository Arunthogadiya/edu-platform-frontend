import api from './apiConfig';

class CommunityService {
  async getForums() {
    const response = await api.get('/api/community/forums');
    console.log('Raw API Response:', response); // Debug log
    return response.data; // API returns { data: ForumThread[] }
  }

  async createForumThread({ title, content, language }: { title: string; content: string; language: string }) {
    const response = await api.post('/api/community/forums', {
      title,
      content,
      language
    });
    return response.data;
  }

  async getPolls() {
    const response = await api.get('/api/community/polls');
    console.log('Raw Polls Response:', response.data); // Debug log
    return response.data;
  }

  async createPoll({ question, options, parent_id }: { question: string; options: string[]; parent_id: number }) {
    if (!question.trim() || !options || options.length < 2) {
      throw new Error('Invalid poll data');
    }
    
    // Send options directly as array, no JSON.stringify needed
    const response = await api.post('/api/community/polls', {
      question,
      options: options, // Send as plain array
      parent_id
    });
    console.log('Creating poll with data:', { question, options, parent_id }); // Debug log
    return response.data;
  }

  async submitVote(pollId: string, selectedOption: string) {
    const response = await api.post('/api/community/polls', {
      poll_id: pollId,
      selected_option: selectedOption,
      // Add other required fields if needed by your API
      parent_id: 2
    });
    return response.data;
  }

  async createReply(threadId: number, content: string, language: string = 'en') {
    const response = await api.post(`/api/community/forums/${threadId}/replies`, {
      thread_id: threadId,
      content: content,
      is_reply: true,
      language: language
    });
    return response.data;
  }

  async getThreadReplies(threadId: number) {
    const response = await api.get(`/api/community/forums/${threadId}/replies`);
    return response.data;
  }
}

export const communityService = new CommunityService();
