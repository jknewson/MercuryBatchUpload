//------------------------------------------------------------------------------
//----- AuthenticationVM ---------------------------------------------------------------
//------------------------------------------------------------------------------

//-------1---------2---------3---------4---------5---------6---------7---------8
//       01234567890123456789012345678901234567890123456789012345678901234567890
//-------+---------+---------+---------+---------+---------+---------+---------+

// copyright:   2014 WiM - USGS

//    authors:  Jeremy K. Newson USGS Wisconsin Internet Mapping


//   purpose:  

//discussion:   This is where the majority of your code-behind goes: data access, click events, complex calculations, 
//              business rules validation, etc. ViewModels are typically built to reflect a View. 
//              For example, if a View contains a ListBox of objects, a Selected object, and a Save button, the ViewModel will have an ObservableCollection ObectList, 
//              Model SelectedObject, and SaveCommand.

//Comments
//02.26.2015 jkn - Created

//Imports"
declare var configuration: any;

import User = require("Models/vos/User");
import AuthenticationAgent = require("Models/Utilities/ServiceAgent/AuthenticationAgent");
import EventArgs = require("Scripts/events/EventArgs");
import Delegate = require("Scripts/events/Delegate");

// Class
class AuthenticationViewModel {
    private _onAuthenicated: Delegate<EventArgs>;
    public get onAuthenticated(): Delegate<EventArgs> {
        return this._onAuthenicated;
    }
    //Properties
    //-+-+-+-+-+-+-+-+-+-+-+-
    private isInitialized: boolean;
    
    //Knockout Properties
    //-+-+-+-+-+-+-+-+-+-+-+- 
    public ShowLogin: KnockoutObservable<boolean>;
    public User: User;
    public AuthenticationToken: KnockoutObservable<string>; 
    public LoginMSG: KnockoutObservable<string>;

    //Constructor
    //-+-+-+-+-+-+-+-+-+-+-+-
    constructor() {
        this.User = new User()
        this.AuthenticationToken = ko.observable(null);
        this.ShowLogin = ko.observable(false);
        this.LoginMSG = ko.observable("");
        this.isInitialized = false;
        this._onAuthenicated = new Delegate<EventArgs>();
    }
    //Methods
    //-+-+-+-+-+-+-+-+-+-+-+-
    public Init() {
        this.isInitialized = true;
    }
    public Login() {
        if (this.isInitialized)
            this.ShowLogin(true);
    }
    public AuthenticateUser() {
        var aAgent: AuthenticationAgent = null;
        var tokn: string = null;
        try {
            this.LoginMSG("");
            if (this.User.UserName() == null || this.User.Password() == null) return;

            aAgent = new AuthenticationAgent(this.User);
            tokn= aAgent.GetTokenAuthentication();
            if (tokn != undefined && tokn != null && tokn != '') {
                this.AuthenticationToken(tokn);
                this.ShowLogin(false);
                this.onAuthenticated.raise(this, EventArgs.Empty);
            }
        }
        catch (e) {
            this.LoginMSG('Authentication failed. Please try again');
        }
        finally {
            this.User.Password(null);
            this.User.UserName(null);
            delete aAgent;           
        }
    }
   
    //Helper Methods
    //-+-+-+-+-+-+-+-+-+-+-+-
    
}//end class

export = AuthenticationViewModel;