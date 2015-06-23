//------------------------------------------------------------------------------
//----- MercuryServiceAgent ---------------------------------------------------------------
//------------------------------------------------------------------------------

//-------1---------2---------3---------4---------5---------6---------7---------8
//       01234567890123456789012345678901234567890123456789012345678901234567890
//-------+---------+---------+---------+---------+---------+---------+---------+

// copyright:   2015 WiM - USGS

//    authors:  Jeremy K. Newson USGS Wisconsin Internet Mapping
//             
// 
//   purpose:  The service agent is responsible for initiating service calls, 
//             capturing the data that's returned and forwarding the data back to 
//             the ViewModel.
//          
//discussion:
//
//https://www.sitepen.com/blog/2014/08/22/advanced-typescript-concepts-classes-types/
//http://blog.oio.de/2014/01/31/an-introduction-to-typescript-module-system/

//Comments
//08.14.2014 jkn - Created

//Imports
declare var configuration: any;

import XLSXReader = require("../XLSXOps/XLSXReader");
import ServiceAgent = require("./ServiceAgent");
import RequestInfo = require("./RequestInfo");
import Constituent = require("../../vos/Constituent");
import IsotopeFlag = require("../../vos/IsotopeFlag");
import QualityAssurance = require("../../vos/QualityAssuranceType");
import Bottle = require("../../vos/Bottle");
import Method = require("../../vos/Method");
import Result = require("../../vos/Result");
import UnitType = require("../../vos/UnitType");
import Sample = require("../../vos/Sample");
import Project = require("../../vos/Project");
import Site = require("../../vos/Site");

import EventArgs = require("Scripts/events/EventArgs");
import EventHandler = require("Scripts/events/EventHandler");
import Delegate = require("Scripts/events/Delegate");

import MSG = require("../../Messaging/Notification");


// Class
class MercuryServiceAgent extends ServiceAgent {
    //Events
    private _onFileLoadedHandler: EventHandler<EventArgs>;
    private _onLoadComplete: Delegate<EventArgs>;
    public get onLoadComplete(): Delegate<EventArgs> {
        return this._onLoadComplete;
    }
    private _onSubmitComplete: Delegate<EventArgs>;
    public get onSubmitComplete(): Delegate<EventArgs> {
        return this._onSubmitComplete;
    }
    private _onMsg: Delegate<EventArgs>;
    public get onMsg(): Delegate<EventArgs> {
        return this._onMsg;
    }
    
    // Properties
    public ConstituentList: Array<Constituent>;
    public QualityAssuranceList: Array<QualityAssurance>;
    public IsotopeList: Array<IsotopeFlag>;
    public UnitList:Array<UnitType>;
    public SampleList: Array<ISample>;
    public FileValid: boolean;

    private sheetDirectory: {[index:string]:string};
    private sheetResults: Array<{ [index: string]: string }>;
        
    // Constructor
    constructor(init:boolean = true) {
        super(configuration.appSettings['MercuryService']);
        if (init) {
            this._onLoadComplete = new Delegate<EventArgs>();
            this._onSubmitComplete = new Delegate<EventArgs>();
            this._onMsg = new Delegate<MSG.NotificationArgs>();
            this.init();
        }//end if
    }

    //Methods
    public LoadWorksheet(f: File) { 
        var fExtension: string = ""; 
        try {
            this.sm("Loading file " + f.name);
            fExtension = f.name.split('.').pop();
            if (fExtension !== 'xlsm' && fExtension !== 'xlsx') throw Error('Invalid file type. File must be xlsm or xlsx');
            var reader = new XLSXReader(f);
            this._onFileLoadedHandler = new EventHandler<EventArgs>((sender: any, e: EventArgs) => {
                this.onFileLoaded(sender, reader);
            });
            reader.onLoadComplete.subscribe(this._onFileLoadedHandler);
            reader.LoadFile();
        }
        catch (e) {
            this.sm(e.message, MSG.NotificationType.ERROR,false);
        }  
    }
    public GetConstituentMethodList(c: Number): Array<IMethod> {
        var methodList: Array<Method> = [];
        this.Execute(new RequestInfo("/methods/?constituent=" + c, false), x=> this.HandleOnSerializableComplete(Method, x, methodList), this.HandleOnError); 

        return methodList;
    }
    public SubmitSamples(samples: Array<ISample>) {
        var resultsArray: Array<Object> = [];
        
        for (var i = 0; i < samples.length; i++) {
            var sample = samples[i];
            resultsArray.push(sample.Result().ToSimpleResult(sample.bottle.bottle_unique_name))
        }//next

        this.Execute(new RequestInfo("/batchupload", true,"POST", ko.toJSON(resultsArray)), this.HandleSubmitComplete, this.HandleOnSubmitError); 
    }

     //Helper Methods
    private init(): void {        
        this.ConstituentList = [];
        this.UnitList = [];
        this.SampleList = [];
        this.QualityAssuranceList = [];
        this.IsotopeList = [];
        this.FileValid = false;
            
        this.Execute(new RequestInfo("/constituents/", true), x=> this.HandleOnSerializableComplete(Constituent, x, this.ConstituentList), this.HandleOnError);  
        this.Execute(new RequestInfo("/isotopeflags/", true), x=> this.HandleOnSerializableComplete(IsotopeFlag, x, this.IsotopeList), this.HandleOnError);   
        this.Execute(new RequestInfo("/units/", true), x=> this.HandleOnSerializableComplete(UnitType, x, this.UnitList), this.HandleOnError);  
        this.Execute(new RequestInfo("/qualityassurancetypes/", true), x=> this.HandleOnSerializableComplete(QualityAssurance, x, this.QualityAssuranceList), this.HandleOnError); 
                    
    }//end init       

    private onFileLoaded(reader: XLSXReader, e: EventArgs) {
        try {
            //unsubscribe from event
            reader.onLoadComplete.unsubscribe(this._onFileLoadedHandler);
            var x: Array<{ [index: string]: string }> = reader.GetData("Results");
            if (x.length <= 0) throw new Error("File is invalid. Select a valid results file.");
            this.sheetDirectory = this.TransformDictionary(x.slice(1, 2)[0]);
            this.sheetResults = x.slice(2);

            this.sheetResults.forEach(row=> this.getSample(row));
            this.FileValid = true;
        }
        catch (e) {
            this.sm(e.message, MSG.NotificationType.ERROR, false);
        }
        finally {
            delete reader;
            this._onLoadComplete.raise(this, EventArgs.Empty);
        }
    }
    private getSample(element: { [index: string]: string }) {
        var sample: Sample;
        var bottle: Bottle;
        var bottleID: string;
        try {
            bottleID = element.hasOwnProperty(this.sheetDirectory["Bottle ID *"]) ? element[this.sheetDirectory["Bottle ID *"]] : '';
            if (bottleID == '') throw new Error("BottleID is empty");
            
            //get bottle info
            bottle = new Bottle();
            this.Execute(new RequestInfo("/bottles/?bottle_unique_name=" + bottleID, false), x=> bottle.Deserialize(x), this.HandleOnError);
            if (bottle.bottle_prefix_string != null)
                this.Execute(new RequestInfo("/bottleprefixes/?bottle_prefix=" + bottle.bottle_prefix_string, false), x=> bottle.LoadDeserializePrefix(x), this.HandleOnError);
                
            if (bottle.HasError) throw new Error("Failed to read bottle: " + bottleID +" .... Sample not included.");            
            //get sample info
            sample = new Sample();
            this.Execute(new RequestInfo("/samplebottles/?bottle=" + bottle.id), x=> this.loadSample(sample,x) , this.HandleOnError);
            sample.bottle= bottle;
            //load result
            sample.Result(this.loadResult(element));
 
            this.SampleList.push(sample);

        }
        catch (e) {
            this.sm(e.message, MSG.NotificationType.ERROR);
            return;
        }//end try
    }
    private loadResult(element: { [index: string]: string }): IResult {
        try {
            var c: IConstituent = element.hasOwnProperty(this.sheetDirectory["Constituent *"]) ? this.getConstituentByName(element[this.sheetDirectory["Constituent *"]]) : null;
            var cmethods: Array<IMethod> = this.GetConstituentMethodList(c.id)
            var m: IMethod = element.hasOwnProperty(this.sheetDirectory["Method Code *"]) ? this.getMethodByCode(cmethods, String(element[this.sheetDirectory["Method Code *"]])) : null;
            var dt:Date = element.hasOwnProperty(this.sheetDirectory["Date of Analysis *"]) ? this.getExcelDate(Number(element[this.sheetDirectory["Date of Analysis *"]])) : new Date();
            var vFinal:number = element.hasOwnProperty(this.sheetDirectory["Raw Value *"]) ? Number(element[this.sheetDirectory["Raw Value *"]]) : null;
            var ddl: number = element.hasOwnProperty(this.sheetDirectory["Detection Limit"]) ? Number(element[this.sheetDirectory["Detection Limit"]]) : null;
            var mp: number = element.hasOwnProperty(this.sheetDirectory["Sample Mass Process"]) ? Number(element[this.sheetDirectory["Sample Mass Process"]]) : null;
            var comment:string = element.hasOwnProperty(this.sheetDirectory["Analysis Comments"]) ? String(element[this.sheetDirectory["Analysis Comments"]]) : "";
            var u:IUnitType = element.hasOwnProperty(this.sheetDirectory["Raw Value Units *"]) ? this.getUnitTypeByName(element[this.sheetDirectory["Raw Value Units *"]]) : null;
            var qa: Array<IQualityAssuranceType> = element.hasOwnProperty(this.sheetDirectory["Quality Assurance"]) ? this.getQualityAssuranceList(element[this.sheetDirectory["Quality Assurance"]]) : [];;
            var i: IIsotopeFlag = element.hasOwnProperty(this.sheetDirectory["Isotope Flag *"]) ? this.getIsotopeByName(String(element[this.sheetDirectory["Isotope Flag *"]])) : null;

            var result: IResult = new Result(c, m, u, vFinal, ddl,mp, dt, comment, i, qa, cmethods);
            return result;
        }
        catch (e) {
            this.sm("Error reading result. " + e.message + ". Check file format", MSG.NotificationType.ERROR);
            return null;
        }//end try
    }
    private loadSample(sample: Sample, result: Object) {
        sample.Deserialize(result);
        this.Execute(new RequestInfo("/samples/" + sample.sample+'/'), r=> sample.LoadSamplingInfo(r), this.HandleOnError);
    }
    private getExcelDate(excelDate: number): Date {
        // JavaScript dates can be constructed by passing milliseconds
        // since the Unix epoch (January 1, 1970) example: new Date(12312512312);

        // 1. Subtract number of days between Jan 1, 1900 and Jan 1, 1970, plus 1 (Google "excel leap year bug")
        // 2. Convert to milliseconds.
        var d: Date = new Date((excelDate - (25567 + 1)) * 86400 * 1000);
        //d.setHours(0, 0, 0, 0);
        return d;
    }

    private getConstituentByName(constituentName: string): IConstituent {
        
        for (var i = 0; i < this.ConstituentList.length; i++) {
            var selectedConstituent: IConstituent = this.ConstituentList[i];
            if (selectedConstituent.constituent.trim().toUpperCase() === constituentName.trim().toUpperCase()) return selectedConstituent;
        }//next

        return null;
    }
    private getIsotopeByName(isotopeName: string): IIsotopeFlag {

        for (var i = 0; i < this.IsotopeList.length; i++) {
            var selectedIsotope: IIsotopeFlag = this.IsotopeList[i];
            if (selectedIsotope.isotope_flag.trim().toUpperCase() === isotopeName.trim().toUpperCase()) return selectedIsotope;
        }//next

        return null;
    }
    private getMethodByCode(methodList:Array<IMethod>, methodCode: string): IMethod {
        for (var i = 0; i < methodList.length; i++) {
            var selectedMethod: IMethod = methodList[i];
            if (selectedMethod.method_code.trim().toUpperCase() === methodCode.trim().toUpperCase()) return selectedMethod;
        }//next

        return null;
    }
    private getUnitTypeByName(unitName: string): IUnitType {
        for (var i = 0; i < this.UnitList.length; i++) {
            var selectedUnit: IUnitType = this.UnitList[i];
            if (selectedUnit.unit.trim().toUpperCase() === unitName.trim().toUpperCase()) return selectedUnit;
        }//next
        return null;
    }
    private getQualityAssuranceList(qaNames: string): Array<IQualityAssuranceType> {
        //split by char
        var qaList: Array<string>;
        var qualityAssuranceList: Array<IQualityAssuranceType> = [];
        var qa: IQualityAssuranceType;
        try {
            qaList = qaNames.split(',');
            for (var i = 0; i < qaList.length; i++) {
                qa = this.getQAByName(qaList[i])
            if (qa != null) qualityAssuranceList.push(qa);
            }//next qa
            return qualityAssuranceList;
        }
        catch (e) {

            return [];
        }
    }
    private getQAByName(QAName: string): IQualityAssuranceType {
        for (var i = 0; i < this.QualityAssuranceList.length; i++) {
            var selectedQA: IQualityAssuranceType = this.QualityAssuranceList[i];
            if (selectedQA.quality_assurance.trim().toUpperCase() === QAName.trim().toUpperCase()) return selectedQA;
        }//next
        return null;
    }

    private HandleSubmitComplete(successObj: Array<any>) {
        this.sm("submitting results completed", MSG.NotificationType.SUCCESS, false);
        var msg: string = ""
        var success: boolean = false;
        //do something with the results
        for (var i = 0; i < successObj.length; i++) {  
            msg = successObj[i].hasOwnProperty("message") ? successObj[i].message : "";
            success = successObj[i].hasOwnProperty("success") ? Boolean(successObj[i].success) : false;                   
            this.sm(msg, success?MSG.NotificationType.SUCCESS:MSG.NotificationType.ERROR)
        }

        this.onSubmitComplete.raise(this, EventArgs.Empty);
    }
    private HandleOnSubmitError(err) {
        this.sm("Failed submitting the results. Error status: "+ err.status, MSG.NotificationType.ERROR, false);
        this.onSubmitComplete.raise(this, EventArgs.Empty);
    }
    private sm(msg:string, notif:MSG.NotificationType = 0, toggleAction:boolean = undefined) {
        
        this.onMsg.raise(this, new MSG.NotificationArgs(msg, notif, 0.1, toggleAction));
    }

}//end class

export = MercuryServiceAgent;
