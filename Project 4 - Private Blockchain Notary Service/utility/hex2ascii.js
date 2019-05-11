module.exports = {

    // mothod that converts string hex value to normal string format
    hex2ascii: (hexVal) => {
        var hex = hexVal.toString(); //force conversion
        var str = '';
        for (var i = 0;
            (i < hex.length && hex.substr(i, 2) !== '00'); i += 2)
            str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
        return str;
    }

}