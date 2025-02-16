interface BehaviorData {
  date: string;
  category: string;
  score: number;
  notes?: string;
  source: 'school' | 'home';
}

interface BehaviorAnalysis {
  trends: {
    collaboration: number[];
    empathy: number[];
    emotional_regulation: number[];
    dates: string[];
  };
  flags: {
    type: string;
    severity: 'low' | 'medium' | 'high';
    message: string;
  }[];
  suggestions: {
    area: string;
    recommendation: string;
    activities: string[];
  }[];
}

class BehaviorService {
  async getBehaviorAnalysis(childId: string): Promise<BehaviorAnalysis> {
    // Mock behavior analysis data
    return {
      trends: {
        collaboration: [7, 8, 6, 8, 9, 7, 8],
        empathy: [8, 8, 9, 8, 8, 9, 9],
        emotional_regulation: [6, 7, 6, 7, 8, 7, 8],
        dates: Array(7).fill(0).map((_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (6 - i));
          return date.toISOString().split('T')[0];
        })
      },
      flags: [
        {
          type: 'emotional_regulation',
          severity: 'medium',
          message: 'Occasional difficulty managing frustration during challenging tasks'
        }
      ],
      suggestions: [
        {
          area: 'emotional_regulation',
          recommendation: 'Practice calming techniques together',
          activities: [
            'Deep breathing exercises before homework',
            'Create a "calm down corner" at home',
            'Use emotion cards to identify feelings'
          ]
        }
      ]
    };
  }

  async getSchoolBehavior(childId: string): Promise<BehaviorData[]> {
    // Mock school behavior data
    return [
      {
        date: new Date().toISOString().split('T')[0],
        category: 'collaboration',
        score: 8,
        notes: 'Works well in group projects',
        source: 'school'
      },
      {
        date: new Date().toISOString().split('T')[0],
        category: 'empathy',
        score: 9,
        notes: 'Shows great concern for peers',
        source: 'school'
      }
    ];
  }

  async getHomeBehavior(childId: string): Promise<BehaviorData[]> {
    // Mock home behavior data
    return [
      {
        date: new Date().toISOString().split('T')[0],
        category: 'emotional_regulation',
        score: 7,
        notes: 'Better at handling frustration during homework',
        source: 'home'
      }
    ];
  }

  async logBehavior(data: Omit<BehaviorData, 'source'>): Promise<{ success: boolean }> {
    // Mock behavior logging
    console.log('Logging behavior:', data);
    return { success: true };
  }
}

export const behaviorService = new BehaviorService();
