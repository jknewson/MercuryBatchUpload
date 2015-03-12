// Class
class Site {
    //Properties
    public id: number;
    public name: string;
    public usgs_sid: string;
    public description: string;
    public latitude: number;
    public longitude: number;


    // Constructor
    public constructor() {
        this.id = -99;
        this.name = "---";
        this.usgs_sid = "";
        this.description = "";
        this.latitude = NaN;
        this.longitude = NaN;
    }
    
    public static Deserialize(json: Object): ISite {
        try {
            if (json.hasOwnProperty("results")) json = json['results'][0];

            var s: Site = new Site();
            s.id = json.hasOwnProperty("id") ? json["id"] : -9999;
            s.name = json.hasOwnProperty("name") ? json["name"] : "---";
            s.usgs_sid = json.hasOwnProperty("usgs_sid")? json["usgs_sid"]:"";
            s.description = json.hasOwnProperty("description") ? json["description"] : "---";
            s.latitude = json.hasOwnProperty("latitude") ? json["latitude"] : NaN;
            s.longitude = json.hasOwnProperty("longitude") ? json["longitude"] : NaN;
            return s;
        }
        catch (e) {
            return null;
        }
    }
}

export = Site;