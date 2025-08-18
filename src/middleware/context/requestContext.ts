import { AsyncLocalStorage } from "async_hooks";

export interface IRequestContext {
  requestId: string;
  requestUrl: string;
  requestMethod: string;
  requestHeaders: Record<string, any>;
  [key: string]: any;
}

export class RequestContext {
  private static storage = new AsyncLocalStorage<IRequestContext>();

  static run<T>(context: IRequestContext, callback: () => T): T {
    return this.storage.run(context, callback);
  }

  static set<T>(key: string, value: T): void {
    const context = this.storage.getStore();
    if (context) {
      context[key] = value;
    }
  }

  static get<T>(key: string): T | undefined {
    const context = this.storage.getStore();
    return context?.[key] as T | undefined;
  }

  static getContext(): IRequestContext | undefined {
    return this.storage.getStore();
  }
}
