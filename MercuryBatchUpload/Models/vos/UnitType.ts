
// Class
class UnitType implements IUnitType, ISerializable {
    // Properties
    public id: number;
    public unit: string;
    public description: string;
    // Constructor
    constructor() {
        this.id = -999;
        this.unit = "";
        this.description = "";
    }

    //Methods
    public Deserialize(json: Object): UnitType {
            
        this.id = json.hasOwnProperty("id") ? json["id"] : -9999;
        this.unit = json.hasOwnProperty("unit") ? json["unit"] : "";
        this.description = json.hasOwnProperty("description") ? json["description"] : "";

        return this;
    }
    //Helper Methods

}
export = UnitType;