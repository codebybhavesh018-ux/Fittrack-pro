
export const notificationService = {
  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications.');
      return 'denied';
    }
    
    const permission = await Notification.requestPermission();
    return permission;
  },

  async sendNotification(title: string, options?: NotificationOptions) {
    if (!('Notification' in window)) return;
    
    if (Notification.permission === 'granted') {
      new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options,
      });
    } else if (Notification.permission !== 'denied') {
      const permission = await this.requestPermission();
      if (permission === 'granted') {
        new Notification(title, options);
      }
    }
  },

  scheduleHabitReminder(habitName: string, minutes: number = 30) {
    console.log(`Scheduling reminder for ${habitName} in ${minutes} minutes`);
    // Local simulation for demo purposes
    setTimeout(() => {
      this.sendNotification('Habit Reminder!', {
        body: `It's time to check in on your habit: ${habitName}`,
        tag: 'habit-reminder',
      });
    }, minutes * 60000);
  }
};
