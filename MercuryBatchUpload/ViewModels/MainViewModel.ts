//------------------------------------------------------------------------------
//----- MainVM ---------------------------------------------------------------
//------------------------------------------------------------------------------

//-------1---------2---------3---------4---------5---------6---------7---------8
//       01234567890123456789012345678901234567890123456789012345678901234567890
//-------+---------+---------+---------+---------+---------+---------+---------+

// copyright:   2014 WiM - USGS

//    authors:  Jeremy K. Newson USGS Wisconsin Internet Mapping


//   purpose:  

//discussion:   This is where the majority of your code-behind goes: data access, click events, complex calculations, 
//              business rules validation, etc. ViewModels are typically built to reflect a View. 
//              For example, if a View contains a ListBox of objects, a Selected object, and a Save button, the ViewModel will have an ObservableCollection ObectList, 
//              Model SelectedObject, and SaveCommand.

//Comments
//08.18.2014 jkn - Created

//Imports"
///<reference path="../Scripts/typings/knockout/knockout.d.ts" />
///<reference path="../Scripts/typings/modernizr/modernizr.d.ts" />
///<reference path="../Scripts/typings/toastr/toastr.d.ts" />

///<amd-dependency path="knockout"/>
///<amd-dependency path="modernizr"/>

import EventArgs = require("Scripts/events/EventArgs");
import EventHandler = require("Scripts/events/EventHandler");
import Sample = require("Models/vos/Sample");

declare var configuration: any;

import MercuryServiceAgent = require("Models/Utilities/ServiceAgent/MercuryServiceAgent");
import MSG = require("Models/Messaging/Notification");
import AuthenticationVM = require("ViewModels/AuthenticationViewModel");
import QAViewModel = require("ViewModels/QualityAssuranceViewModel");
import LogEntry = require("Models/Messaging/LogEntry");

// Class
export class MainViewModel {

    //Events
    private _onAgentCompleteHandler: EventHandler<EventArgs>;
    private _onAgentSubmitCompleteHandler: EventHandler<EventArgs>;
    private _onMsgReceivedHandler: EventHandler<MSG.NotificationArgs>;
    private _onAuthenticatedHandler: EventHandler<EventArgs>;
   
    //Properties
    //-+-+-+-+-+-+-+-+-+-+-+-
    private _URL: string;
    private isInit: boolean;
    private mAgent: MercuryServiceAgent;
    private fileLoaded: boolean;
    private fileValid: boolean;

    //Knockout Properties
    //-+-+-+-+-+-+-+-+-+-+-+- 
    public SampleList: KnockoutObservableArray<ISample>;
    public SelectedSample: KnockoutObservable<ISample>;
    public SelectedProcedure: KnockoutObservable<ProcedureType>;
    
    public ConstituentList: Array<IConstituent>;
    public IsotopeFlagList: Array<IIsotopeFlag>;
    public UnitList: Array<IUnitType>;

    public AllowDrop: KnockoutObservable<boolean>;
    public IsLoading: KnockoutObservable<boolean>;
    public CanToggle: KnockoutObservable<boolean>;
    public NotificationList: KnockoutObservableArray<LogEntry>; 

    public Authorization: AuthenticationVM;  
    public QAViewModel: QAViewModel;



    //Constructor
    //-+-+-+-+-+-+-+-+-+-+-+-
    constructor() {      
        this.init();
        this.sm(new MSG.NotificationArgs("Select a valid mercury template to import"));
    }
    //Methods
    //-+-+-+-+-+-+-+-+-+-+-+-
    public HandleFileSelect(event, data) {
        
        // cancel event and hover styling
        this.HandleDrag(event)
        //take first only
        this.sm(new MSG.NotificationArgs("Loading File.", MSG.NotificationType.INFORMATION, 0, true));

        var files = event.target.files || event.originalEvent.dataTransfer.files
         setTimeout(() => {
             this.HandleFiles(files);
        }, 1000)            
        
    }
    public HandleDrag(event) {
        event.stopPropagation();
        event.preventDefault();
        //event.target.className = (event.type == "dragover" ? "hover" : "");
    }
    public HandleFiles(files: FileList) {
        if (files.length > 0) {
            this.isInit = true;
            this.mAgent.LoadWorksheet(files.item(0));
        }         
    }
    public SetProcedureType(pType: ProcedureType) {
        if (!this.canUpdateProceedure(pType)) return;
        this.SelectedProcedure(pType);
        
        //handle procedures
        switch (pType) {
            case ProcedureType.SUBMIT:
                this.Authorization.Init();
                
                this.Authorization.Login();
        }//end switch

    }
    public SelectSample(sample: Sample) {
        if (this.SelectedSample() !== sample && this.fileLoaded === true) {
            this.SelectedSample(sample);
        }
    } 
    public SetConstituentMethods(r: IResult) {
        try {
            if(! r.constituent()) throw Error()
            var mAgent = new MercuryServiceAgent(false);
            var c: Array<IMethod> = mAgent.GetConstituentMethodList(r.constituent().id);
            r.constituentMethods(c);
        }
        catch (e) {
            r.constituentMethods([]);
        }
    }
    public AddQAToSelectedSample: () => void;
    public ShowQAPopup: () => void;
    
    public SelectPreviousSample() {
        var index = this.SampleList.indexOf(this.SelectedSample()) - 1
        if (index < 0) index = 0;
        this.SelectedSample(this.SampleList()[index]);
    }
    public SelectNextSample() {
        var index = this.SampleList.indexOf(this.SelectedSample()) + 1
        if (index >= this.SampleList().length) index = 0;
        this.SelectedSample(this.SampleList()[index]);
    }
    public Toggle() {
        if (!this.CanToggle()) return;
        $("#wrapper").toggleClass("toggled");
    }
    //Helper Methods
    //-+-+-+-+-+-+-+-+-+-+-+-
    private init() {
        //empty list
        this.fileLoaded = false;
        this.fileValid = false;
        this.SampleList = ko.observableArray([]);
        this.NotificationList = ko.observableArray([]);
        this.ConstituentList = [];
        this.UnitList = [];
        this.IsLoading = ko.observable(false);
        
        this.Authorization = new AuthenticationVM();
        this.QAViewModel = new QAViewModel();
        this.isInit = false;
        this.CanToggle = ko.observable(false);
        this.SelectedSample = ko.observable(null);
        this.SelectedProcedure = ko.observable(ProcedureType.IMPORT);
        this.AllowDrop = (Modernizr.draganddrop) ? ko.observable(true) : ko.observable(false);
        this.mAgent = new MercuryServiceAgent();
        this.subscribeToEvents();   
        
        //methods for knockout to work with
        this.ShowQAPopup = () => {
            this.QAViewModel.Show(true);
        }  
        this.AddQAToSelectedSample = () => {
            this.SelectedSample().Result().qualityAssuranceList.push(this.QAViewModel.SelectedQualityAssurance());
            this.QAViewModel.Show(false);
        }     
    } 
    private onFileLoaded(agent: MercuryServiceAgent) {
        try {
            this.SampleList(agent.SampleList);
            this.ConstituentList= agent.ConstituentList;
            this.UnitList = agent.UnitList;
            this.IsotopeFlagList = agent.IsotopeList;
            this.QAViewModel.QualityAssuranceList(agent.QualityAssuranceList);

            this.fileLoaded = true;
            this.fileValid = agent.FileValid;
            if (this.fileValid) {
                this._onAuthenticatedHandler = new EventHandler<EventArgs>((sender: any) => {
                    this.onAuthenticated(sender);
                });
                
                this.Authorization.onAuthenticated.subscribe(this._onAuthenticatedHandler);
                this.SetProcedureType(ProcedureType.VALIDATE);
                this.CanToggle(true);
                this.sm(new MSG.NotificationArgs("File successfully loaded", MSG.NotificationType.SUCCESS, 0, false));
                this.sm(new MSG.NotificationArgs("Validate samples, then submit."));
                this.unSubscribeToEvents();
            }
        }
        finally {
            delete agent;
        }
    }
    private canUpdateProceedure(pType: ProcedureType): boolean {
        //Project flow:
        var msg: string;
        try {
            if (!this.isInit) return;
            switch (pType) {
                case ProcedureType.IMPORT:
                    return !this.fileLoaded || !this.fileValid;
                case ProcedureType.VALIDATE:
                    if (!this.fileLoaded || !this.fileValid) this.sm(new MSG.NotificationArgs("Import a valid lab document",MSG.NotificationType.WARNING));

                    return this.fileLoaded && this.fileValid;
                case ProcedureType.SUBMIT:
                    var isOK = this.fileIsOK();
                    if (!this.fileLoaded || !this.fileValid) this.sm(new MSG.NotificationArgs("Import a valid lab document", MSG.NotificationType.WARNING));
                    if (!isOK) this.sm(new MSG.NotificationArgs("Samples contains invalid entries. Please fix before submitting", MSG.NotificationType.WARNING));

                    return isOK && this.fileLoaded && this.fileValid;  

                case ProcedureType.LOG:
                    if (!this.fileLoaded) this.sm(new MSG.NotificationArgs("Import a valid lab document", MSG.NotificationType.WARNING));

                    return this.fileLoaded;    
                default:
                    return false;
            }//end switch            
        }
        catch (e) {
            this.sm(new MSG.NotificationArgs(e.message, MSG.NotificationType.INFORMATION, 1.5));
            return false;
        }
    }
    private fileIsOK():boolean {
        try {
        for (var i = 0; i < this.SampleList().length; i++) {
            if (this.SampleList()[i].Result().HasErrors()) return false;
        }//next 
            return true;
        }
        catch (e) {
            return false;
        }
    }
    private onRecieveMsg(sender: any, e: MSG.NotificationArgs) {
        this.sm(e);
    }
    private onAuthenticated(agent: AuthenticationVM) {
        var token: string = '';
        try {
            
            token = agent.AuthenticationToken()
            if (token == '' || token == undefined || token == null) throw new Error("Invalid token");
            this.mAgent.SetTokenAuthentication(token)
            this.submitSampleResults()
        }
        catch (e) {

        }
        finally {
            delete agent;
        }
    }
    private submitSampleResults() {
        this.sm(new MSG.NotificationArgs("Submitting sample results. Please wait....", MSG.NotificationType.INFORMATION, 0, true));
        //subscribe to mAgent.Onsubmit success
        this._onAgentSubmitCompleteHandler = new EventHandler<EventArgs>((sender: any) => {
            this.onSubmitComplete(sender);
        });
        this.mAgent.onSubmitComplete.subscribe(this._onAgentSubmitCompleteHandler);

        this.mAgent.SubmitSamples(this.SampleList())
    }
    private onSubmitComplete(sender: any) {
        var result = this.mAgent;
        this.mAgent.onSubmitComplete.unsubscribe(this._onAgentSubmitCompleteHandler)
    }
    private subscribeToEvents() {
        this._onAgentCompleteHandler = new EventHandler<EventArgs>((sender: any) => {
            this.onFileLoaded(sender);
        });
        this.mAgent.onLoadComplete.subscribe(this._onAgentCompleteHandler);

        this._onMsgReceivedHandler = new EventHandler<MSG.NotificationArgs>((sender: any, e: MSG.NotificationArgs) => {
            this.onRecieveMsg(sender, e);
        });
        this.mAgent.onMsg.subscribe(this._onMsgReceivedHandler);
    }
    private unSubscribeToEvents() {
        this.mAgent.onLoadComplete.unsubscribe(this._onAgentCompleteHandler);
        this._onAgentCompleteHandler = null;      
    }
    private sm(msg: MSG.NotificationArgs) {
        try {
            toastr.options = {
                positionClass: "toast-bottom-right"
            };
        
            this.NotificationList.unshift(new LogEntry(msg.msg,msg.type));

            setTimeout(() => {
                toastr[msg.type](msg.msg);
                if(msg.ShowWaitCursor != undefined)
                    this.IsLoading(msg.ShowWaitCursor)
            }, 0)            
        }
        catch (e) {
        }
    }
}//end class

export enum ProcedureType {
    IMPORT = 1,
    VALIDATE = 2,
    SUBMIT = 3,
    LOG =4
}