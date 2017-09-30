var https =  require('https');
var http =  require('http');
var server = {
    getHttps : (ops, success, error, fn) => {
        var req = https.request(ops,(res) => {
            var datas = '';
            res.on('data', (data) => {
                datas += data;
            })
            res.on('end', (data) => {
                if(success){
                    success(datas);
                }
            })
        }).on('error',(err) => {
            if(error){
                error(err);
            }
        })
        req.end();
        if(fn){
            fn();
        }
    },
    getHttp : (ops ,success, error, fn) => {
        var req = http.request(ops,(res) => {
            var datas = '';
            res.on('data', (data) => {
                datas += data;
            })
            res.on('end', (data) => {
                if(success){
                    success(datas);
                }
            })
        }).on('error',(err) => {
            if(error){
                error(err);
            }
        })
        req.end();
        if(fn){
            fn();
        }
    } 
}
module.exports=server;