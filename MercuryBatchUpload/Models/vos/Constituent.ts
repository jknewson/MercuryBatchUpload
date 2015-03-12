
// Class
class Constituent implements IConstituent, ISerializable {
    //Properties
    public id: number;
    public constituent: string;
    public description: string;

    // Constructor
    constructor() {
        this.id = -999;
        this.constituent = "";
        this.description = "";
    }

    //Methods
    public Deserialize(json: Object): Constituent {
        this.id = json.hasOwnProperty("id") ? json["id"] : -9999;
        this.constituent = json.hasOwnProperty("constituent") ? json["constituent"] : "";
        this.description = json.hasOwnProperty("description") ? json["description"] : "";

        return this;
    }
    //Helper Methods
}

export = Constituent;
