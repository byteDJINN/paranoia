type Listener = {
  userId: string;
  toUpdate: boolean; // marks if this client is lagging behin the server
  resolve: () => void;
  alive: () => void; // this is always kept open as a signal that the client is still connected
};

export class Broadcaster {
  private listeners: { [userId: string]: Listener } = {};

  broadcast() {
    for (const userId in this.listeners) {
      // if it has resolve and alive
      if (this.listeners[userId].resolve) {
        this.listeners[userId].resolve();
        this.listeners[userId].resolve = null;
      // if it just has alive
      } else {
        this.listeners[userId].toUpdate = true;
      }
    }
  }

  onBroadcast(userId: string, resolve: () => void) {
    if (!(userId in this.listeners)) {
      this.listeners[userId] = {
        userId: userId,
        toUpdate: false,
        resolve: null,
        alive: resolve,
      };
    } else {
      this.listeners[userId].resolve = resolve;
      // immediately resolve if there have been changes between the client's requests
      if (this.listeners[userId].toUpdate) {
        resolve();
        this.listeners[userId].toUpdate = false;
      }
    }
  }

  wait(userId: string): Promise<void> {
    return Promise.race([
      new Promise<void>((resolve) => {
        this.onBroadcast(userId, resolve);
      })
    ]);
  }

  getWaitingUsers(): string[] {
    return Object.keys(this.listeners);
  }
}
