const axios = require('axios')
const moment = require('moment')
const iconv = require('iconv-lite')

const url = {
    account: 'http://open.memobird.cn/home/setuserbind',
    print: 'http://open.memobird.cn/home/printpaper',
    status: 'http://open.memobird.cn/home/getprintstatus'
}

module.exports = function(RED) {
    function MemoBirdtext(config) {
        RED.nodes.createNode(this,config);
        this.config = {
            ak: this.credentials.ak,
            memobirdID: this.credentials.memobirdID,
            useridentifying: config.useridentifying,
            timestamp: moment().format('YYYY-MM-DD HH:mm:ss')
        }     
        var node = this;
        node.on('input', (msg) => {
            //绑定设备
            getData(url.account, this.config)
            .then( (res) => {
                this.status({fill:"blue",shape:"dot",text:"connected"});
                this.initRes = res
                console.log('printText开始')
                let print = {
                    timestamp: moment().format('YYYY-MM-DD HH:mm:ss'),
                    ak: this.config.ak,
                    memobirdID: this.config.memobirdID,
                    userID: this.initRes.showapi_userid,
                    printcontent: `T:${iconv.encode(msg.payload, 'gbk').toString('base64')}`
                }
                //开始打印
                return getData(url.print, print)
            })
            .then((res) => {
                this.status({});
                node.send({payload: res});
            })
            .catch( (err) => {
                this.status({fill:"red",shape:"ring",text:"disconnected"});
                if (err.data) {
                    node.send({payload: err.data.showapi_res_error});
                } else {
                    node.send({payload: err});
                }
            })
        });

        //获取数据
        function getData (url, data) {
            return new Promise((resolve, reject) => {
                axios.post(url, data)
                .then((res) => {
                    if (res.data.showapi_res_code === 1) {
                        console.log('异步请求ok')
                        resolve(res.data)
                    } else {
                        reject(res)
                    }
                })
                .catch( (err) => {
                    reject(err)
                })
            })
        }
    }
    RED.nodes.registerType("memobirdtext",MemoBirdtext,{
        credentials: {
            ak: {type:"password"},
            memobirdID: {type:"password"}
        }
    });
}