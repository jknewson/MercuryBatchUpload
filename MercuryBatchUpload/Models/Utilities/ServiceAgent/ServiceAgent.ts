
import RequestInfo = require("./RequestInfo");
// Class
class ServiceAgent {
    public BaseURL: String;
    private authentication: string;
    // Constructor
    constructor(urlbase: string) {
        this.BaseURL = urlbase;
    }

    //Method
    public Execute(request: RequestInfo, callBackOnSuccess: Action<any>, callBackOnFail: Action<any>  ):void {
        //loads the referance stations from NWIS

        $.ajax({
            context: this,
            type: request.Type,
            contentType: "application/json",
            data: request.Data,
            url: this.BaseURL + request.URL,
            processData: request.ProcessData,
            dataType: request.DataType,
            beforeSend: (xhr) => {
                if (this.authentication) xhr.setRequestHeader('authorization', this.authentication);
            },
            async: request.IsAsync,
            success: callBackOnSuccess,
            error: callBackOnFail
        });
    }
    public SetTokenAuthentication(token: string) {
        this.authentication = "token " + token;
    }

    public TransformDictionary(item: { [index: string]: string }): { [index: string]: string } {
        var dictionary: { [index: string]: string } = {};
     
        for (var key in item) {
            dictionary[item[key]] = key;
        }//next

        return dictionary;
    }
    public HandleOnSerializableComplete<T extends ISerializable>(type: { new (): T; }, list: Array<JSON>, container: Array<ISerializable>) {
        list.forEach(l => container.push(new type().Deserialize(l)))
    }

    public HandleOnError(err) {
        //do something
        console.log(err);
    }
}
export = ServiceAgent;
