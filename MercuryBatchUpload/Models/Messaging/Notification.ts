//------------------------------------------------------------------------------
//----- Notification ---------------------------------------------------------------
//------------------------------------------------------------------------------

//-------1---------2---------3---------4---------5---------6---------7---------8
//       01234567890123456789012345678901234567890123456789012345678901234567890
//-------+---------+---------+---------+---------+---------+---------+---------+

// copyright:   2015 WiM - USGS

//    authors:  Jeremy K. Newson USGS Wisconsin Internet Mapping
//             
// 
//   purpose:  Represents the Message
//          
//discussion:
//

//Comments
//08.14.2014 jkn - Created
//10.01.2014 jkn - changed to notification and added notification properties 


//Imports"
// Class
export class NotificationArgs {
    //Properties
    public msg: string;
    public type: string;
    public dismissTime: number;
    public ShowWaitCursor: boolean;

    //Constructor
    constructor(m: string, t: NotificationType = 0, waitLevel: number = 1, toggleAction:boolean= undefined) {
        this.msg = m;
        this.type = (t != null) ? this.getNotificationString(t) : 'info';
        this.dismissTime = (waitLevel < 0.2 || waitLevel == null) ? 10000 : waitLevel * 10000;
        this.ShowWaitCursor = (toggleAction != undefined)? toggleAction:undefined;
    }//end constructor

    public static MessageEventArgs(m: string, t: NotificationType = 0, waitLevel: number = 1, toggleAction: boolean = undefined): NotificationArgs{
        return new NotificationArgs(m, t, waitLevel, toggleAction);
    }
    //Helper methods
    private getNotificationString(n: NotificationType):string {
        switch (n) {
            case NotificationType.SUCCESS:
                return "success";
            case NotificationType.ERROR:
                return "error";
            case NotificationType.WARNING:
                return "warning";
            case NotificationType.INFORMATION:
                return "info";
        }//end switch
    }
}//end class
export enum NotificationType {
    INFORMATION = 0,
    SUCCESS = 1,
    WARNING = 2,
    ERROR = 3
}
