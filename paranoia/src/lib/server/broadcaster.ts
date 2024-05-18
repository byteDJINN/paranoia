export class Broadcaster {
  private listeners: Array<() => void> = [];

  broadcast() {
    this.listeners.forEach(listener => listener());
  }

  onBroadcast(listener: () => void) {
    this.listeners.push(listener);
  }

  wait(): Promise<void> {
    return new Promise((resolve) => {
      this.onBroadcast(() => resolve());
    });
  }
}