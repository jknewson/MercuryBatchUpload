interface ISerializable {
    Deserialize(input: Object):any;
}
interface Action<T> {
    (item: T): void;
}
interface Func<T, TResult> {
    (item: T): TResult;
}
interface IBottle {
    //Bottle Parameters
    id: number;
    bottle_unique_name: string;
    created_date: string;
    description: string;
    tare_weight: number;
    bottle_type: number;
}
interface IConstituent {
    id: number;
    constituent: string;
    description: string;
}
interface IMethod {
    id: number;
    method: string;
    method_code: string;
    preparation: string
    description: string;
    method_detection_limit: number;
    method_detection_limit_unit: number;
    
    //raw_value_unit: number;
    //final_value_unit: number;
    //decimal_places: number;
    //significant_figures: number;
    //standard_operating_procedure: number;
    //nwis_parameter_code: number;
    //nwis_parameter_name: number;
    //nwis_method_code: number;
}
interface IQualityAssuranceType {
    id: number;
    quality_assurance: string;
    description: string;
}
interface IIsotopeFlag {
    id: number;
    isotope_flag: string;
    description: string;
}
interface IResult {
    id: number;
    method: KnockoutObservable<IMethod>;
    constituent: KnockoutObservable<IConstituent>;
    unit: KnockoutObservable<IUnitType>;
    reported_value: KnockoutObservable<number>;
    daily_detection_limit: KnockoutObservable<number>;
    analyzed_date: KnockoutObservable<Date>;
    analysis_comment: KnockoutObservable<string>;
    HasErrors: KnockoutComputed<boolean>;
    constituentMethods: KnockoutObservableArray<IMethod>;
    qualityAssuranceList: KnockoutObservableArray<IQualityAssuranceType>;
    isotope_flag: KnockoutObservable<IIsotopeFlag>;
    ToSimpleResult(bottleID: string): Object
}
interface ISample {
    id:number;
    sample:number;
    bottle:IBottle;
    filter_type: number;
    volume_filtered: number;
    preservation_type: number;
    preservation_volume: number;
    preservation_acid: number;
    preservation_comment: string

    Result: KnockoutObservable<IResult>;
}
interface IUnitType {
    id: number;
    unit: string;
    description: string;
}
interface IProject {
    id: number;
    name: string;
    description: string;
    accounting_code: number;
    cooperator: number;

}
interface ISite {
    id: number;
    name: string;
    usgs_sid: string;
    description: string;
    latitude: number;
    longitude: number;
}

