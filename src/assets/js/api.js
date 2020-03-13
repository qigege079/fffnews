export default {
  //数字转大写
  convertCurrency: function(money) {
    var cnNums = new Array('零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖');
    var cnIntRadice = new Array('', '拾', '佰', '仟');
    var cnIntUnits = new Array('', '万', '亿', '兆');
    var cnDecUnits = new Array('角', '分', '毫', '厘');
    var cnInteger = '整';
    var cnIntLast = '元';
    var maxNum = 999999999999999.9999;
    var integerNum;
    var decimalNum;
    var chineseStr = '';
    //分离金额后用的数组，预定义
    var parts;
    if (money == ''){ return ''; }
    money = parseFloat(money);
    if (money >= maxNum) {
      alert("超出最大处理数字")
      return '';
    }
    if (money == 0) {
      chineseStr = cnNums[0] + cnIntLast + cnInteger;
      return chineseStr;
    }
    //转换为字符串
    money = money.toString();
    if (money.indexOf('.') == -1) {
      integerNum = money;
      decimalNum = '';
    } else {
      parts = money.split('.');
      integerNum = parts[0];
      decimalNum = parts[1].substr(0, 4);
    }
    //获取整型部分转换
    if (parseInt(integerNum, 10) > 0) {
      var zeroCount = 0;
      var IntLen = integerNum.length;
      for (var i = 0; i < IntLen; i++) {
        var n = integerNum.substr(i, 1);
        var p = IntLen - i - 1;
        var q = p / 4;
        var m = p % 4;
        if (n == '0') {
          zeroCount++;
        } else {
          if (zeroCount > 0) {
            chineseStr += cnNums[0];
          }
          zeroCount = 0;
          chineseStr += cnNums[parseInt(n)] + cnIntRadice[m];
        }
        if (m == 0 && zeroCount < 4) {
          chineseStr += cnIntUnits[q];
        }
      }
      chineseStr += cnIntLast;
    }
    //小数部分
    if (decimalNum != '') {
      var decLen = decimalNum.length;
      for (var i = 0; i < decLen; i++) {
        var n = decimalNum.substr(i, 1);
        if (n != '0') {
          chineseStr += cnNums[Number(n)] + cnDecUnits[i];
        }
      }
    }
    if (chineseStr == '') {
      chineseStr += cnNums[0] + cnIntLast + cnInteger;
    } else if (decimalNum == '') {
      chineseStr += cnInteger;
    }
    return chineseStr;
  },

  formatDate: function(time) {
    time = time + '000'
    if(!isNaN(parseInt(time))){
      time = parseInt(time)
    }else{
      return time
    }
    time = new Date(time)
    let year = time.getFullYear()
    let month = time.getMonth()+1>9?time.getMonth()+1:'0'+(time.getMonth()+1)
    let date = time.getDate()>9?time.getDate():'0'+time.getDate()
    let hour = time.getHours()>9?time.getHours():'0'+time.getHours()
    let minute = time.getMinutes()>9?time.getMinutes():'0'+time.getMinutes()
    let second = time.getSeconds()>9?time.getSeconds():'0'+time.getSeconds()
    return year + "-" + month + "-" + date + " " + hour + ":" + minute + ":" + second
  }
}