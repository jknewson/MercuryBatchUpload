
class Method implements IMethod, ISerializable {
    public id: number;
    public method: string;
    public method_code: string;
    public preparation: string
    public description: string;
    public method_detection_limit: number;
    public method_detection_limit_unit: number;
    public raw_value_unit_string: String;
    public displayMethod: string;

        // Constructor
    public constructor() {
        this.id = -999;
        this.method = "";
        this.method_code = "";
        this.description = "";
        this.preparation = "";
        this.method_detection_limit = -999;
        this.method_detection_limit_unit = -999;
        this.raw_value_unit_string = "";
    }

        //Methods
        public Deserialize (json: Object): Method {
            this.id = json.hasOwnProperty("id") ? Number(json["id"]) : null;
            this.method = json.hasOwnProperty("method") ? json["method"] : null;
            this.method_code = json.hasOwnProperty("id") ? String(json["id"]) : null;
            this.preparation = json.hasOwnProperty("preparation") ? json["preparation"] : null;
            this.description = json.hasOwnProperty("description") ? json["description"] : null;
            this.method_detection_limit = json.hasOwnProperty("method_detection_limit") && json["method_detection_limit"] != null ? Number(json["method_detection_limit"]) : null;
            this.method_detection_limit_unit = json.hasOwnProperty("method_detection_limit_unit") ? Number(json["method_detection_limit_unit"]) : null;
            this.raw_value_unit_string = json.hasOwnProperty("raw_value_unit_string") ? String(json["raw_value_unit_string"]) : null;
            this.displayMethod = "[" + this.method_code + "] " + this.method;
            return this;
        }
        //Helper Methods
    }

export = Method;
