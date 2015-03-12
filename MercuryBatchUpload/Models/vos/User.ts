
    
// Class
class User {
    //Properties
    public UserName: KnockoutObservable<string>;
    public Password: KnockoutObservable<string>;

    // Constructor
    public constructor() {
        this.UserName = ko.observable(null).extend({ validUserName: {} });
        this.Password = ko.observable(null).extend({ validPassword: {} });
    }

    public ToJSON(): string {
        return ko.toJSON(this.Replacer());
    }
    //Helper methods
    private Replacer(): Object {
        return {
            "username": this.UserName,
            "password": this.Password
        };
    }
}

export = User;
