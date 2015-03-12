
    
// Class
class Bottle implements IBottle, ISerializable {
    //Properties
    public id: number;
    public bottle_unique_name: string;
    public description: string;
    public tare_weight: number;
    public bottle_type: number;
    public created_date: string;
    public bottle_prefix: string;

    public HasError: boolean;
    // Constructor
    public constructor() {
        this.id = -99;
        this.bottle_unique_name = "---";
        this.created_date = "---";
        this.description = "";
        this.tare_weight = -99;
        this.bottle_type = -999
        this.bottle_prefix = null;
        this.HasError = true;
    }
    public LoadDeserializePrefix(json: Object) {
        try {
            if (json.hasOwnProperty("results")) json = json['results'][0];
            this.tare_weight = json.hasOwnProperty("tare_weight") ? json["tare_weight"] : -999;
            this.bottle_type = json.hasOwnProperty("bottle_type") ? json["bottle_type"] : -999;
        }
        catch (e) {
            this.HasError = true;
        }
    }
    public Deserialize(json: Object): Bottle {   
        try {
            if (json.hasOwnProperty("results")) json = json['results'];
            if ((<Array<any>>json).length > 1) throw new Error();
            json = json[0];
            this.id = json.hasOwnProperty("id") ? json["id"] : -9999;
            this.bottle_unique_name = json.hasOwnProperty("bottle_unique_name") ? json["bottle_unique_name"] : "---";
            this.bottle_prefix = json.hasOwnProperty("bottle_prefix") ? json["bottle_prefix"] : null;
            this.description = json.hasOwnProperty("description") ? json["description"] : "---";
            this.created_date = json.hasOwnProperty("created_date") ? json["created_date"] : "---";
            this.HasError = false;
            return this;
        }
        catch(e){
            this.HasError = true;
        }
    }
}

export = Bottle;
