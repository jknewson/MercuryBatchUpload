//https://github.com/knockout/knockout/wiki/Asynchronous-Dependent-Observables

// Class
class Result implements IResult {
    // Properties
    public id: number;
    public method: KnockoutObservable<IMethod>;
    public constituent: KnockoutObservable<IConstituent>;
    public unit: KnockoutObservable<IUnitType>;
    public reported_value: KnockoutObservable<number>;
    public daily_detection_limit: KnockoutObservable<number>;
    public analyzed_date: KnockoutObservable<Date>;
    public analysis_comment: KnockoutObservable<string>;
    public qualityAssuranceList: KnockoutObservableArray<IQualityAssuranceType>;
    public isotope_flag: KnockoutObservable<IIsotopeFlag>;
    public massProcess: KnockoutObservable<number>;

    public HasErrors: KnockoutComputed<boolean>;  
    public constituentMethods: KnockoutObservableArray<IMethod>;
    public RemoveQA: (item: IQualityAssuranceType) => void;

    // Constructor
    public constructor(c: IConstituent, m: IMethod, u: IUnitType, vFinal: number,
        ddl: number,mp:number, dt: Date, comment: string, i:IIsotopeFlag, qa: Array<IQualityAssuranceType>, cmethods: Array<IMethod>) {
        this.id = -999;
        this.constituent = ko.observable(c).extend({ nullValidation: {} });
        this.method = ko.observable(m).extend({ nullValidation: {} });
        this.reported_value = ko.observable(vFinal).extend({ nullValidation: {} });
        this.isotope_flag = ko.observable(i).extend({ nullValidation: {} });

        this.daily_detection_limit = ko.observable(ddl).extend({ nullValidation: {msg:"Are you sure you do not want to specify a detection limit?"} });
        this.unit = ko.observable(u).extend({ unitValidation: { method: this.method } });
        this.massProcess = ko.observable(mp).extend({ massProcessValidation: { method: this.method } });
        
        this.analyzed_date = ko.observable(dt).extend({ nullValidation: {} });
        this.analysis_comment = ko.observable(comment);
        this.qualityAssuranceList = ko.observableArray(qa);
        this.constituentMethods = ko.observableArray(cmethods);

        //methods for knockout to work with
        this.RemoveQA = (item: IQualityAssuranceType) => {
            this.qualityAssuranceList.remove(item);
        }
     

        this.HasErrors = ko.computed({
            owner: this,
            read: () => {  
                try {
                    var c: boolean = (<any>this.constituent).hasWarning();
                    var m: boolean = (<any>this.method).hasWarning();
                    var u: boolean = (<any>this.unit).hasWarning();
                    var r: boolean = (<any>this.reported_value).hasWarning();
                    var i: boolean = (<any>this.isotope_flag).hasWarning();
                    var mp: boolean = (<any>this.massProcess).hasWarning();
                    var ad: boolean = (<any>this.analyzed_date).hasWarning();

                    return c || m || u || r || i || mp || ad;
                }
                catch (e){
                    return true;
                }
            }
        })
    }

    //Methods
    public ToSimpleResult(bottleID:string): Object {
        return this.Replacer(bottleID);
    }
    //Helper methods
    private Replacer(bottleID:String): Object {
        var result = {
            "bottle_unique_name": bottleID,
            "constituent": this.constituent().constituent,
            "method_id": this.method().id,
            "raw_value": this.reported_value,
            "isotope_flag_id":this.isotope_flag().id,
            "analyzed_date": (this.analyzed_date().getMonth() + 1) + '/' + this.analyzed_date().getDate() + '/' + this.analyzed_date().getFullYear(),
            "daily_detection_limit": this.daily_detection_limit,
            "quality_assurance": $.map(this.qualityAssuranceList(), (obj) => {return obj.quality_assurance }),
            "analysis_comment": this.analysis_comment,
            "sample_mass_processed":this.massProcess()
        };
        if (result.sample_mass_processed == null) delete result.sample_mass_processed;

        return result;
    }

}
export = Result;
