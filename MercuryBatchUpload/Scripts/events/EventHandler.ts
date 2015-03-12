import EventArgs = require("./EventArgs");

class EventHandler<T extends EventArgs> {
    private _handler: { (sender: any, e: T): void };

    constructor(handler: { (sender: any, e: T): void }) {
        this._handler = handler;
    }

    public handle(sender: any, e: T): void {
        this._handler(sender, e);
    }
}

export = EventHandler;