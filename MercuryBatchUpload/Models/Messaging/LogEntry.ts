
// Class
class LogEntry {
    //Properties
    public dateTime: Date;
    public message: string;
    public type: string;

    public displayedMSG: string;

    // Constructor
    constructor(msg:string, t:string) {
        this.dateTime = new Date();
        this.message = msg;
        this.type = t;

        this.displayedMSG = this.dateTime.toLocaleString() + " " + this.type + " " + this.message;
    }

    //Methods
 
    //Helper Methods
}

export = LogEntry;