import { ProcessedEarthquake } from '@/types/earthquake';

export interface NotificationService {
  requestPermission(): Promise<NotificationPermission>;
  checkForRecentEarthquakes(earthquakes: ProcessedEarthquake[]): void;
  getWIBTime(): Date;
  isRecentEarthquake(earthquakeTime: Date, currentTime: Date): boolean;
}

class EarthquakeNotificationService implements NotificationService {
  private lastNotificationTime: Date | null = null;
  private notifiedEarthquakeIds: Set<string> = new Set();

  /**
   * Request permission for browser notifications
   */
  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return 'denied';
    }

    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      return permission;
    }

    return Notification.permission;
  }

  /**
   * Get current time in WIB (GMT+7)
   */
  getWIBTime(): Date {
    const now = new Date();
    // Add 7 hours to UTC to get WIB time
    return new Date(now.getTime() + (7 * 60 * 60 * 1000));
  }

  /**
   * Check if an earthquake is recent (within 10 minutes)
   */
  isRecentEarthquake(earthquakeTime: Date, currentTime: Date = this.getWIBTime()): boolean {
    const tenMinutesAgo = new Date(currentTime.getTime() - 10 * 60 * 1000);
    return earthquakeTime >= tenMinutesAgo;
  }

  /**
   * Check for recent earthquakes and send notifications
   */
  checkForRecentEarthquakes(earthquakes: ProcessedEarthquake[]): void {
    if (Notification.permission !== 'granted') {
      return;
    }

    const currentTime = this.getWIBTime();
    
    const recentEarthquakes = earthquakes.filter(earthquake => {
      // Skip if already notified for this earthquake
      if (this.notifiedEarthquakeIds.has(earthquake.id)) {
        return false;
      }

      // Only notify for magnitude 4.0+ earthquakes
      if (earthquake.magnitude < 4.0) {
        return false;
      }

      // Check if the earthquake is recent
      return this.isRecentEarthquake(earthquake.dateTime, currentTime);
    });

    recentEarthquakes.forEach(earthquake => {
      this.sendNotification(earthquake);
      this.notifiedEarthquakeIds.add(earthquake.id);
    });

    // Clean up old notified IDs (keep only last 100)
    if (this.notifiedEarthquakeIds.size > 100) {
      const idsArray = Array.from(this.notifiedEarthquakeIds);
      const oldIds = idsArray.slice(0, idsArray.length - 50);
      oldIds.forEach(id => this.notifiedEarthquakeIds.delete(id));
    }
  }

  /**
   * Send notification for a specific earthquake
   */
  private sendNotification(earthquake: ProcessedEarthquake): void {
    const title = `🚨 Gempa Bumi M${earthquake.magnitude.toFixed(1)}`;
    const body = `${earthquake.location}\n📅 ${earthquake.date} ${earthquake.time}\n📏 Kedalaman: ${earthquake.depth} km`;

    const notification = new Notification(title, {
      body,
      icon: '/earthquake-icon.png',
      badge: '/earthquake-badge.png',
      tag: earthquake.id,
      requireInteraction: true,
      data: {
        earthquakeId: earthquake.id,
        magnitude: earthquake.magnitude,
        location: earthquake.location,
        timestamp: earthquake.dateTime.toISOString(),
      },
    });

    // Auto close notification after 10 seconds
    setTimeout(() => {
      notification.close();
    }, 10000);

    // Handle notification click
    notification.onclick = () => {
      window.focus();
      // Navigate to monitor page with the earthquake selected
      window.location.href = `/monitor?earthquake=${earthquake.id}`;
      notification.close();
    };

    console.log(`Notification sent for earthquake: ${earthquake.id} - M${earthquake.magnitude.toFixed(1)} ${earthquake.location}`);
  }

  /**
   * Format time difference between earthquake time and current time
   */
  getTimeAgo(earthquakeTime: Date, currentTime: Date = this.getWIBTime()): string {
    const diffInMs = currentTime.getTime() - earthquakeTime.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) {
      return 'Baru saja';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} menit yang lalu`;
    } else if (diffInHours < 24) {
      return `${diffInHours} jam yang lalu`;
    } else {
      return `${diffInDays} hari yang lalu`;
    }
  }

  /**
   * Format date and time in Indonesian format with WIB timezone
   */
  formatIndonesianDateTime(date: Date): string {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'Asia/Jakarta',
      timeZoneName: 'short',
    };

    return new Intl.DateTimeFormat('id-ID', options).format(date);
  }

  /**
   * Get notification status information
   */
  getNotificationInfo(): {
    supported: boolean;
    permission: NotificationPermission;
    enabled: boolean;
  } {
    return {
      supported: 'Notification' in window,
      permission: 'Notification' in window ? Notification.permission : 'denied',
      enabled: 'Notification' in window && Notification.permission === 'granted',
    };
  }

  /**
   * Clear all notifications
   */
  clearNotifications(): void {
    this.notifiedEarthquakeIds.clear();
    this.lastNotificationTime = null;
  }
}

// Export singleton instance
export const notificationService = new EarthquakeNotificationService();

// Export utility functions
export const formatTimeAgo = (earthquakeTime: Date, currentTime?: Date): string => {
  return notificationService.getTimeAgo(earthquakeTime, currentTime);
};

export const formatIndonesianDateTime = (date: Date): string => {
  return notificationService.formatIndonesianDateTime(date);
};

export const getWIBTime = (): Date => {
  return notificationService.getWIBTime();
}; 