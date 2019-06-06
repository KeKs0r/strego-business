export = index;
declare class index {
    static defaultMaxListeners: any;
    static init(): void;
    static listenerCount(emitter: any, type: any): any;
    static usingDomains: boolean;
    constructor(options: any);
    qs: any;
    baseUrl: any;
    contact: any;
    contactAddress: any;
    communicationWay: any;
    orderPosition: any;
    order: any;
    invoice: any;
    discounts: any;
    feed: any;
    category: any;
    static: any;
    addListener(type: any, listener: any): any;
    emit(type: any, args: any): any;
    eventNames(): any;
    getMaxListeners(): any;
    listenerCount(type: any): any;
    listeners(type: any): any;
    off(type: any, listener: any): any;
    on(type: any, listener: any): any;
    once(type: any, listener: any): any;
    prependListener(type: any, listener: any): any;
    prependOnceListener(type: any, listener: any): any;
    rawListeners(type: any): any;
    removeAllListeners(type: any, ...args: any[]): any;
    removeListener(type: any, listener: any): any;
    setAuth(options: any): void;
    setMaxListeners(n: any): any;
}
declare namespace index {
    class EventEmitter {
        // Circular reference from index.EventEmitter
        static EventEmitter: any;
        static defaultMaxListeners: any;
        static init(): void;
        static listenerCount(emitter: any, type: any): any;
        static usingDomains: boolean;
        addListener(type: any, listener: any): any;
        emit(type: any, args: any): any;
        eventNames(): any;
        getMaxListeners(): any;
        listenerCount(type: any): any;
        listeners(type: any): any;
        off(type: any, listener: any): any;
        on(type: any, listener: any): any;
        once(type: any, listener: any): any;
        prependListener(type: any, listener: any): any;
        prependOnceListener(type: any, listener: any): any;
        rawListeners(type: any): any;
        removeAllListeners(type: any, ...args: any[]): any;
        removeListener(type: any, listener: any): any;
        setMaxListeners(n: any): any;
    }
}
