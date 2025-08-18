"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestContext = void 0;
const async_hooks_1 = require("async_hooks");
class RequestContext {
    static run(context, callback) {
        return this.storage.run(context, callback);
    }
    static set(key, value) {
        const context = this.storage.getStore();
        if (context) {
            context[key] = value;
        }
    }
    static get(key) {
        const context = this.storage.getStore();
        return context === null || context === void 0 ? void 0 : context[key];
    }
    static getContext() {
        return this.storage.getStore();
    }
}
exports.RequestContext = RequestContext;
RequestContext.storage = new async_hooks_1.AsyncLocalStorage();
