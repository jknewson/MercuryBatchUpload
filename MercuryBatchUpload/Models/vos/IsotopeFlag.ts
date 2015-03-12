
// Class
class IsotopeFlag implements IIsotopeFlag, ISerializable {
    //Properties
    public id: number;
    public isotope_flag: string;
    public description: string;

    // Constructor
    constructor() {
        this.id = -999;
        this.isotope_flag = "";
        this.description = "";
    }

    //Methods
    public Deserialize(json: Object): IsotopeFlag {
        this.id = json.hasOwnProperty("id") ? json["id"] : -9999;
        this.isotope_flag = json.hasOwnProperty("isotope_flag") ? json["isotope_flag"] : "";
        this.description = json.hasOwnProperty("description") ? json["description"] : "";

        return this;
    }
    //Helper Methods
}

export = IsotopeFlag;
