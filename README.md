# node-red-contrib-memobirdtext

* 1.4.0更新
    * 区分国内版/国际版设备

* 1.3.0更新
    * 增加图片打印节点

* 1.2.7更新
    * 增加打印状态检测节点

## node-red平台的咕咕机图片打印节点

* msg.payload 输入需打印的**图片网址**
* msg.memobirdID 若传入机器ID，则会忽略节点中所填机器ID

## node-red平台的咕咕机字符打印节点

* msg.payload 输入需打印的**字符串**
* msg.memobirdID 若传入机器ID，则会忽略节点中所填机器ID

## 节点参数

* ak：自己发邮件申请
* memobirdID：好像是双击机器按键会打印的
* useridentifying：这个好像是自定义随便填的