
// Class
class QualityAssuranceType implements IQualityAssuranceType, ISerializable {
    //Properties
    public id: number;
    public quality_assurance: string;
    public description: string;

    // Constructor
    constructor() {
        this.id = -999;
        this.quality_assurance = "";
        this.description = "";
    }

    //Methods
    public Deserialize(json: Object): QualityAssuranceType {
        this.id = json.hasOwnProperty("id") ? json["id"] : -9999;
        this.quality_assurance = json.hasOwnProperty("quality_assurance") ? json["quality_assurance"] : "";
        this.description = json.hasOwnProperty("description") ? json["description"] : "";

        return this;
    }
    //Helper Methods
}

export = QualityAssuranceType;