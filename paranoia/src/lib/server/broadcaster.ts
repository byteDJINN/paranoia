type Listener = {
  userId: string;
  resolve: () => void;
};

export class Broadcaster {
  private listeners: Listener[] = [];

  broadcast() {
    this.listeners.forEach(listener => listener.resolve());
    this.listeners = []; // Clear listeners after broadcasting
  }

  onBroadcast(listener: Listener) {
    this.listeners.push(listener);
  }

  wait(userId: string): Promise<void> {
    return new Promise((resolve) => {
      this.onBroadcast({ userId, resolve });
    });
  }

  getWaitingUsers(): string[] {
    return this.listeners.map(listener => listener.userId);
  }
}
