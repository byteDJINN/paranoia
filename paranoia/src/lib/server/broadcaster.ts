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
    return Promise.race([
      new Promise<void>((resolve) => {
        this.onBroadcast({ userId, resolve });
      })
    ]);
  }

  getWaitingUsers(): string[] {
    return this.listeners.map(listener => listener.userId);
  }
}
