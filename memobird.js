const axios = require('axios')
const moment = require('moment')
const iconv = require('iconv-lite')

const url = {
    account: 'http://open.memobird.cn/home/setuserbind',
    print: 'http://open.memobird.cn/home/printpaper',
    status: 'http://open.memobird.cn/home/getprintstatus'
}

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

module.exports = function(RED) {

    RED.nodes.registerType("memobirdcheck",MemoBirdcheck,{
        credentials: {
            ak: {type:"password"}
        }
    });

    RED.nodes.registerType("memobirdtext",MemoBirdtext,{
        credentials: {
            ak: {type:"password"},
            memobirdID: {type:"password"}
        }
    });

    function MemoBirdtext(config) {
        RED.nodes.createNode(this,config);   
        var node = this;
        node.on('input', (msg) => {

            this.config = {
                ak: this.credentials.ak,
                memobirdID: msg.memobirdID || this.credentials.memobirdID,
                useridentifying: config.useridentifying,
                timestamp: moment().format('YYYY-MM-DD HH:mm:ss'),
            }  

            //绑定设备
            getData(url.account, this.config)
            .then( (res) => {
                this.status({fill:"blue",shape:"dot",text:"connected"});
                this.initRes = res
                console.log('printText开始')
                let print = {
                    timestamp: moment().format('YYYY-MM-DD HH:mm:ss'),
                    ak: this.config.ak,
                    memobirdID: msg.memobirdID || this.config.memobirdID,
                    userID: this.initRes.showapi_userid,
                    printcontent: `T:${iconv.encode(msg.payload, 'gbk').toString('base64')}`
                }
                //开始打印
                return getData(url.print, print)
            })
            .then((res) => {
                this.status({});
                node.log('打印请求成功！')
                node.send({payload: res});
            })
            .catch( (err) => {
                this.status({fill:"red",shape:"ring",text:"disconnected"});
                if (err.data) {
                    node.error('请求失败：'+ err.data.showapi_res_error)
                    node.send({payload: err.data.showapi_res_error});
                   
                } else {
                    node.error('请求失败：'+ err)
                    node.send({payload: err});
                }
            })
        });
    }
    function MemoBirdcheck(config) {
        RED.nodes.createNode(this,config);   
        var node = this;
        node.on('input', (msg) => {
            setTimeout(() => {
                let check = {
                    timestamp: moment().format('YYYY-MM-DD HH:mm:ss'),
                    ak: this.credentials.ak,
                    printcontentid: msg.payload.printcontentid
                }
        
                //检测
                getData(url.status, check)
                .then( (res) => {
                    this.status({fill:"blue",shape:"dot",text:"connected"});
                    node.log('检测完成!')
                    node.send({payload: res});
                    this.status({});
                })
                .catch( (err) => {
                    this.status({fill:"red",shape:"ring",text:"disconnected"});
                    if (err.data) {
                        node.error('请求失败：'+ err.data.showapi_res_error)
                        node.send({payload: err.data.showapi_res_error});
                       
                    } else {
                        node.error('请求失败：'+ err)
                        node.send({payload: err});
                    }
                })
            }, config.timeOut)
        });
    }
}