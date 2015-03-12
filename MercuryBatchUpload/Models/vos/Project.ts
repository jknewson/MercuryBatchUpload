// Class
class Project implements IProject {
    //Properties
    public id: number;
    public name: string;
    public description: string;
    public accounting_code: number;
    public cooperator: number;
    // Constructor
    public constructor() {
        this.id = -99;
        this.name = "---";
        this.description = "";
    }

    public static Deserialize(json: Object): Project {
        try {
        var p: Project = new Project();
            if (json.hasOwnProperty("results")) json = json['results'][0];

            p.id = json.hasOwnProperty("id") ? Number(json["id"]) : -9999;
            p.name = json.hasOwnProperty("name") ? json["name"] : "---";
            p.description = json.hasOwnProperty("description") ? json["description"] : "---";
            return p;
        }
        catch (e) {
        }
    }
}

export = Project;