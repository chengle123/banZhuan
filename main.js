var app = require('http').createServer(handler);
var io = require('socket.io')(app);
var fs = require('fs');
var server =  require('./server.js');
app.listen(8989);

var juHeKey = 'ce87df7a13fd5e9bd042ff9142de38ff'; // 聚合数据key
var timerTimPrice1 = ''; // 价格定时器
var timerTimPrice2 = ''; // 价格定时器
var timerRate = ''; // 汇率定时器
var so = null; // socket

var currency = [];

function handler (req, res) {
  fs.readFile(__dirname + '/index.html',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }

    res.writeHead(200);
    res.end(data);
  });
}

io.on('connection', function (socket) {
    so = socket;
    getPrice1();
    getPrice2();
    getRate();
    socket.on('my other event', function (data) {
        console.log(data);
    });
});

// 获取币种价格
var getPrice1 = () => {
    server.getHttps(ops = {
            method: 'GET',
            host: 'c-cex.com',
            port: '443',
            path: '/t/prices.json'
        },(data)=>{
            var arr = [];
            if(data[0] == '{'){
                // console.log(data);
                data = JSON.parse(data);
                console.log('价格1数据正常...');
                for(var key in data){
                    if(key.indexOf('-usd')>-1){
                        arr.push({
                            name:key.slice(0,-4),
                            buy:data[key].buy,
                            sell:data[key].sell,
                            time:data[key].updated*1000
                        });
                    }
                }
                var array = [];
                for(var i = 0;i<currency.length;i++){
                    for(var j = 0;j<arr.length;j++){
                        if(currency[i] == arr[j].name){
                            array.push(arr[j]);
                        }
                    }
                }
                so.emit('newPriceL', array);
            }else{
                console.log('数据获取出现问题，跳过...')
            }
        },(data)=>{
            console.log('获取价格1异常,异常原因'+data);
            console.log('10秒后重新连接');
            clearTimeout(timerTimPrice1);
            setTimeout(getPrice1,10000)
        },()=>{
            timerTimPrice1 = setTimeout(getPrice1,10000);
        });
}

var getPrice2 = () => {
    server.getHttp(ops = {
            method: 'GET',
            host: 'api.btc38.com',
            port: '80',
            path: '/v1/ticker.php?c=all&mk_type=cny'
        },(data)=>{
            var arr = [];
            if(data[0] == '{'){
                // console.log(data);
                data = JSON.parse(data);
                console.log('价格2数据正常...');
                for(var key in data){
                    arr.push({
                        name:key,
                        sell:data[key].ticker.sell,
                        buy:data[key].ticker.buy,
                        time: new Date().getTime()
                    });
                    currency.push(key);
                }
                so.emit('newPriceR', arr);
            }else{
                console.log('数据获取出现问题，跳过...')
            }
        },(data)=>{
            console.log('获取价格2异常,异常原因'+data);
            console.log('10秒后重新连接');
            clearTimeout(timerTimPrice2);
            setTimeout(getPrice2,10000)
        },()=>{
            timerTimPrice2 = setTimeout(getPrice2,10000);
        });
}

// // 获取汇率
var getRate = () => {
    server.getHttp(ops = {
        method: 'GET',
        host: 'op.juhe.cn',
        port: '80',
        path: '/onebox/exchange/query?key='+juHeKey
    },(data)=>{
        if(data[0] == '{'){
            data = JSON.parse(data);
            console.log('汇率数据正常...');
            so.emit('newRate', data.result.list);
        }else{
            console.log('数据获取出现问题，跳过...')
        }
    },(data)=>{
        console.log('获取汇率异常,异常原因'+data);
        console.log('10秒后重新连接');
        clearTimeout(timerRate);
        setTimeout(getRate,10000)
    },()=>{
        timerRate = setTimeout(getRate,1800000);
    });
}





function arrayIntersection(a, b){
    var ai=0, bi=0;
    var result = [];


    // while( ai < a.length && bi < b.length ){
    //     if (a[ai] < b[bi] ){
    //         ai++;
    //     }else if (a[ai] > b[bi] ){
    //         bi++;
    //     }else{
    //         result.push(a[ai]);
    //         ai++;
    //         bi++;
    //     }
    // }
    return result;
}
console.log(arrayIntersection([1,2,3],[2,3,4,5,6]));




