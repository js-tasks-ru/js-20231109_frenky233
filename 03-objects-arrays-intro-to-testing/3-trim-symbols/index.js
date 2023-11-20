/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size) {
    if(size == 0){
        return '';
    }
    if(!size){
        return string;
    }
    if(!string){
        return '';
    }
    
    let splittedString = string.split('');
    let endString = '';
    let prevSymbol = 0;
    let curSize = 1;

    for(let symbol of splittedString){
        if(symbol == prevSymbol){
            curSize++;
        }
        else{
            curSize = 1;
        }

        if(curSize <= size){
            endString += symbol;
        }

        prevSymbol = symbol;
    }

    return endString;
}
