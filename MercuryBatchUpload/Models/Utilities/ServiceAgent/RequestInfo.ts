class RequestInfo {
    //Properties
    public URL: string
    public Type: string
    public DataType: string
    public ProcessData: boolean;
    public IsAsync: boolean;
    public Data: any;

    constructor(url: string, isAsync: boolean = true, type: string = "GET", data: any = null, dType: string= "json", doProcess: boolean = false) {
        this.URL = url;
        this.Type = type;
        this.DataType = dType;
        this.ProcessData = doProcess;
        this.IsAsync = isAsync;
        this.Data = data;

    }
}

export = RequestInfo;