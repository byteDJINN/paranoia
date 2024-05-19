import config from "./config";

type Listener = {
  userId: string;
  toUpdate: boolean; // marks if this client is lagging behin the server
  resolve?: () => void;
  lastUpdate: number;
};

export class Broadcaster {
  private listeners: { [userId: string]: Listener } = {};

  private checkAlive() {
    for (const userId in this.listeners) {
      if (Date.now() - this.listeners[userId].lastUpdate > config.CLIENT_TIMEOUT) {
        delete this.listeners[userId];
      }
    }
  }

  broadcast() {
    this.checkAlive();
    for (const userId in this.listeners) {
      if (this.listeners[userId].resolve !== undefined) {
        const resolve = this.listeners[userId].resolve;
        this.listeners[userId].resolve = undefined;
        resolve();
      } else {
        this.listeners[userId].toUpdate = true;
      }
    }
  }

  onBroadcast(userId: string, resolve: () => void) {
    if (userId in this.listeners) {
      // immediately resolve if there have been changes since the client's last update
      if (this.listeners[userId].toUpdate) {
        // take a copy of resolve
        this.listeners[userId].resolve = undefined;
        this.listeners[userId].toUpdate = false;
        resolve();
      } else {
        this.listeners[userId].resolve = resolve;
      }
    } else {
      this.listeners[userId] = {
        userId,
        toUpdate: false,
        resolve,
        lastUpdate: Date.now(),
      };
    }
  }

  wait(userId: string): Promise<void> {
    if (userId in this.listeners) {
      this.listeners[userId].lastUpdate = Date.now();
    }
    return new Promise<void>((resolve) => {
      this.onBroadcast(userId, resolve);
    });
  }

  getWaitingUsers(): string[] {
    return Object.keys(this.listeners);
  }
}
