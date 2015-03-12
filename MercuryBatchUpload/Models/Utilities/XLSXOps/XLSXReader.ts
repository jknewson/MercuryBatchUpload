//------------------------------------------------------------------------------
//----- XLSXReader--------------------------------------------------------------
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
//01.07.2015 jkn - Created

//Imports"

import Delegate = require("Scripts/events/Delegate");
import EventArgs = require("Scripts/events/EventArgs");

declare var XLSX: any;

// Class
class XLSXReader {
    // Event Delegate
    private _onLoadComplete: Delegate<EventArgs>;
    public get onLoadComplete(): Delegate<EventArgs> {
        return this._onLoadComplete;
    }

    // Properties
    public File: File
    private WorkBook: any;
    public Worksheets: Array<string>;
    
    // Constructor
    constructor(file: File) {
        this._onLoadComplete = new Delegate<EventArgs>();
        this.File = file
    }
    // Methods
    public LoadFile() {
        var reader = new FileReader();
        var name = this.File.name;
        reader.onload = (event) => this.readerOnload(event);
        reader.readAsArrayBuffer(this.File);
    }

    public GetData(SheetName: string): Array<{ [index: string]: string }> {
        var results: Array<{ [index: string]: string }> =[];
        var currentRow: number = 0;
        var thisRow: number = 0;
        var index: number = -1

        var data = this.WorkBook.Sheets.hasOwnProperty(SheetName) ? this.WorkBook.Sheets[SheetName] : null;

        if (!data) return results;

        for (var z in data) {
            if (z[0] === '!') continue;
            thisRow = Number(z.match(/[0-9]+/)[0]);
            
            if (currentRow != thisRow) {
                index++;
                currentRow = thisRow;
                results.push({});
            }//end if
 
            results[index][z.match(/[A-Za-z]/)[0]] = (data[z].v);          
        }//next

        return results;
    }
    //Helper Methods
    private readerOnload(e) {
        var data = e.target.result;

        this.WorkBook = XLSX.read(data, { type: 'binary' });
        this.Worksheets = this.WorkBook.SheetNames;

        this._onLoadComplete.raise(this, EventArgs.Empty);
    }
    private GetWorksheetIndex(itemSelected: String):Number {
        if (!itemSelected) return -1;
        var count: any = 0;
        for (var worksheet in this.WorkBook.Sheets){
            count++;
            if (worksheet === itemSelected)
                return count;
        }//next worksheet
        return -1;
    }
}//end class

export = XLSXReader;
