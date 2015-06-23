//------------------------------------------------------------------------------
//----- AuthenticationAgent ---------------------------------------------------------------
//------------------------------------------------------------------------------

//-------1---------2---------3---------4---------5---------6---------7---------8
//       01234567890123456789012345678901234567890123456789012345678901234567890
//-------+---------+---------+---------+---------+---------+---------+---------+

// copyright:   2015 WiM - USGS

//    authors:  Jeremy K. Newson USGS Wisconsin Internet Mapping
//             
// 
//   purpose:  The service agent is responsible for initiating service calls, 
//             capturing the data that's returned and forwarding the data back to 
//             the ViewModel.
//          
//discussion:
//
//https://www.sitepen.com/blog/2014/08/22/advanced-typescript-concepts-classes-types/
//http://blog.oio.de/2014/01/31/an-introduction-to-typescript-module-system/

//Comments
//02.26.2014 jkn - Created

//Imports
declare var configuration: any;

import ServiceAgent = require("./ServiceAgent");
import RequestInfo = require("./RequestInfo");
import User = require ("../../vos/User");


// Class
class AuthenticationAgent extends ServiceAgent {
    //Events

    // Properties
    private user: User;
    // Constructor
    constructor(user:User) {
        super(configuration.appSettings['MercuryAuth']);

        this.user = user;
        this.init();
    }

    //Methods
    public GetTokenAuthentication(): string {
        var json: Object
        var token = '';
        this.Execute(new RequestInfo("/login/", false, "POST", this.user.ToJSON(), "json"), x=> json = x, this.HandleOnError); 
        token = json.hasOwnProperty("auth_token") ? json["auth_token"] : "";
        return token;
    }

    //Helper Methods
    private init(): void {
       
    }//end init       

}//end class

export = AuthenticationAgent;
