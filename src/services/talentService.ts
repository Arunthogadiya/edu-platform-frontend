interface TalentScore {
  category: string;
  score: number;
  percentile?: number;
  hoursPerWeek?: number;
}

interface PeerComparison {
  category: string;
  studentScore: number;
  averageScore: number;
  percentile: number;
}

interface TalentRecommendation {
  category: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  type: 'course' | 'competition' | 'program' | 'mentorship';
  url?: string;
  deadline?: string;
  cost?: string;
}

class TalentService {
  async getTalentScores(): Promise<TalentScore[]> {
    // Mock data
    return [
      { category: 'Robotics', score: 92, percentile: 95, hoursPerWeek: 8 },
      { category: 'Creative Writing', score: 85, percentile: 78, hoursPerWeek: 4 },
      { category: 'Public Speaking', score: 88, percentile: 82, hoursPerWeek: 3 },
      { category: 'Mathematics', score: 95, percentile: 97, hoursPerWeek: 6 },
      { category: 'Music', score: 78, percentile: 65, hoursPerWeek: 2 },
      { category: 'Leadership', score: 89, percentile: 85, hoursPerWeek: 5 }
    ];
  }

  async getPeerComparison(): Promise<PeerComparison[]> {
    // Mock data
    return [
      {
        category: 'Robotics',
        studentScore: 92,
        averageScore: 75,
        percentile: 95
      },
      {
        category: 'Creative Writing',
        studentScore: 85,
        averageScore: 72,
        percentile: 78
      }
      // ...more categories
    ];
  }

  async getRecommendations(): Promise<TalentRecommendation[]> {
    // Mock data
    return [
      {
        category: 'Robotics',
        title: 'First Robotics Competition',
        description: 'Join the prestigious robotics competition to showcase your skills',
        difficulty: 'advanced',
        type: 'competition',
        url: 'https://www.firstinspires.org/robotics/frc',
        deadline: '2024-06-30',
        cost: '$500'
      },
      {
        category: 'Robotics',
        title: 'Advanced Robotics Summer Camp',
        description: 'Intensive 4-week program with hands-on projects',
        difficulty: 'intermediate',
        type: 'program',
        url: 'https://summercamp.example.com',
        deadline: '2024-05-15',
        cost: '$1200'
      },
      {
        category: 'Mathematics',
        title: 'Math Olympiad Preparation',
        description: 'Structured program for competitive mathematics',
        difficulty: 'advanced',
        type: 'course',
        url: 'https://matholympiad.example.com',
        deadline: '2024-04-01'
      }
    ];
  }

  async getTalentProfile(): Promise<{
    history: Array<{
      date: string;
      scores: TalentScore[];
    }>;
  }> {
    // Mock historical data
    return {
      history: [
        {
          date: '2024-01',
          scores: [
            { category: 'Robotics', score: 85, hoursPerWeek: 6 },
            { category: 'Mathematics', score: 90, hoursPerWeek: 5 }
          ]
        },
        {
          date: '2024-02',
          scores: [
            { category: 'Robotics', score: 92, hoursPerWeek: 8 },
            { category: 'Mathematics', score: 95, hoursPerWeek: 6 }
          ]
        }
      ]
    };
  }
}

export const talentService = new TalentService();
