import EventArgs = require("./EventArgs");
import EventHandler = require("./EventHandler");

class Delegate<T extends EventArgs> {
    private _eventHandlers: Array<EventHandler<T>>;

    constructor() {
        this._eventHandlers = new Array<EventHandler<T>>();
    }

    public subscribe(eventHandler: EventHandler<T>): void {
        if (this._eventHandlers.indexOf(eventHandler) == -1) {
            this._eventHandlers.push(eventHandler);
        }
    }

    public unsubscribe(eventHandler: EventHandler<T>): void {
        var i = this._eventHandlers.indexOf(eventHandler);
        if (i != -1) {
            this._eventHandlers.splice(i, 1);
        }
    }

    public raise(sender: any, e: T): void {
        for (var i = 0; i < this._eventHandlers.length; i++) {
            this._eventHandlers[i].handle(sender, e);
        }
    }
}

export = Delegate;