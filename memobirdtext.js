const axios = require('axios')
const moment = require('moment')
const iconv = require('iconv-lite')

const url = {
    account: 'http://open.memobird.cn/home/setuserbind',
    print: 'http://open.memobird.cn/home/printpaper',
    status: 'http://open.memobird.cn/home/getprintstatus'
}

function getData (url, data) {
    return new Promise((resolve, reject) => {
        axios.post(url, data)
        .then((res) => {
            if (res.data.showapi_res_code === 1) {
                console.log('异步请求ok')
                resolve(res.data)
            } else {
                console.log('失败! 原因：', res.data.showapi_res_error )
                reject(res.data)
            }
        })
    })
}

module.exports = function(RED) {
    function MemoBirdtext(config) {
        RED.nodes.createNode(this,config);
        this.config = {
            ak: config.ak,
            memobirdID: config.memobirdID,
            useridentifying: config.useridentifying,
            timestamp: moment().format('YYYY-MM-DD HH:mm:ss')
        }     
        var node = this;
        node.on('input', async (msg) => {
            //绑定设备
            this.initRes = await getData(url.account, this.config) 
            if ( this.initRes.showapi_userid ) {
                //开始打印
                console.log('printText开始')
                let print = {
                    timestamp: moment().format('YYYY-MM-DD HH:mm:ss'),
                    ak: this.config.ak,
                    memobirdID: this.config.memobirdID,
                    userID: this.initRes.showapi_userid,
                    printcontent: `T:${iconv.encode(msg.payload, 'gbk').toString('base64')}`
                }
                msg.payload = await getData(url.print, print)
                node.send(msg);
            } else {
                node.send(this.initRes);
            }
        });
    }
    RED.nodes.registerType("memobirdtext",MemoBirdtext);
}