interface SmartReminder {
  id: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  context: string[];
  frequency: 'once' | 'daily' | 'weekly';
  icon?: string;
}

class SmartReminderManager {
  private static schedules = [
    { 
      time: '08:00', 
      context: 'attendance', 
      message: "Today's schedule and attendance check",
      icon: '📅'
    },
    { 
      time: '15:00', 
      context: 'academics', 
      message: "Check today's homework updates",
      icon: '📚'
    },
    { 
      time: '18:00', 
      context: 'messages', 
      message: "Review teacher messages and updates",
      icon: '💬'
    }
  ];

  private static contextualSuggestions = {
    academics: [
      { message: "Review today's performance?", icon: '📊' },
      { message: "Check upcoming assignments", icon: '📝' }
    ],
    attendance: [
      { message: "View this week's attendance", icon: '📅' },
      { message: "Check upcoming holidays", icon: '🗓' }
    ],
    messages: [
      { message: "Any new teacher updates?", icon: '📨' },
      { message: "Recent important notices", icon: '📢' }
    ]
  };

  static isTimeToShow(schedule: string): boolean {
    const now = new Date();
    const [scheduledHours] = schedule.split(':').map(Number);
    const currentHours = now.getHours();
    
    // Show suggestions 30 minutes before and after the scheduled time
    return Math.abs(currentHours - scheduledHours) <= 1;
  }

  static getContextualReminders(path: string): SmartReminder[] {
    try {
      if (!path) {
        console.warn('SmartReminderManager: No path provided');
        return [];
      }

      const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', hour12: false });
      const reminders: SmartReminder[] = [];
      
      // Add scheduled reminders
      this.schedules
        .filter(schedule => 
          this.isTimeToShow(schedule.time) && 
          (path.includes(schedule.context) || !path.includes('dashboard'))
        )
        .forEach(schedule => {
          reminders.push({
            id: `${schedule.context}-${Date.now()}-${Math.random()}`,
            message: schedule.message,
            priority: 'medium',
            context: [schedule.context],
            frequency: 'daily',
            icon: schedule.icon
          });
        });

      // Add contextual suggestions based on current page
      const context = Object.keys(this.contextualSuggestions).find(key => path.includes(key));
      if (context) {
        this.contextualSuggestions[context as keyof typeof this.contextualSuggestions]
          .forEach(suggestion => {
            reminders.push({
              id: `context-${Date.now()}-${Math.random()}`,
              message: suggestion.message,
              priority: 'low',
              context: [context],
              frequency: 'once',
              icon: suggestion.icon
            });
          });
      }

      return reminders;
    } catch (error) {
      console.error('Error in SmartReminderManager.getContextualReminders:', error);
      return [];
    }
  }

  static getSuggestionForTime(): SmartReminder | null {
    try {
      const hour = new Date().getHours();
      if (hour >= 8 && hour <= 20) {
        const suggestions = {
          morning: {
            message: "Good morning! Let's review today's schedule",
            icon: '🌅'
          },
          afternoon: {
            message: "Time to check homework updates!",
            icon: '📚'
          },
          evening: {
            message: "Review today's academic progress?",
            icon: '📊'
          }
        };
        
        const timeOfDay = 
          hour < 12 ? 'morning' :
          hour < 17 ? 'afternoon' : 'evening';
        
        const suggestion = suggestions[timeOfDay as keyof typeof suggestions];
        return {
          id: `time-${Date.now()}`,
          message: suggestion.message,
          priority: 'low',
          context: ['time'],
          frequency: 'daily',
          icon: suggestion.icon
        };
      }
      return null;
    } catch (error) {
      console.error('Error in SmartReminderManager.getSuggestionForTime:', error);
      return null;
    }
  }
}

export default SmartReminderManager;