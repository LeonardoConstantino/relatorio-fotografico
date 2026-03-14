/**
 * EventBus Tipado para comunicação entre componentes
 */
type Callback<T = any> = (data: T) => void | Promise<void>;

class EventBus {
  private events: Map<string, Set<Callback>> = new Map();

  on<T = any>(event: string, callback: Callback<T>): () => void {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    this.events.get(event)!.add(callback);
    return () => this.off(event, callback);
  }

  off<T = any>(event: string, callback: Callback<T>): void {
    if (!this.events.has(event)) return;
    this.events.get(event)!.delete(callback);
  }

  emit<T = any>(event: string, data?: T): void {
    if (!this.events.has(event)) return;
    this.events.get(event)!.forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        console.error(`[EventBus] Error in listener for "${event}":`, error);
      }
    });
  }
}

export default new EventBus();
