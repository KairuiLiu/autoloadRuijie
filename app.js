var os=require("os");
const fetch = require('node-fetch')
const express = require('express');
const bodyParser = require('body-parser');
let app = express();
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

let working = false;
let passWD = "itispasswd"
let freq = 5000;
let low_freq =2000;
let hig_freq =600000;
let last_fail = 0;
let check_work = null;
let localIP = null;
let contTms = 0;

function setConf(config){
    contTms = 0;
    if(!config)return;
    clearInterval(check_work);
    working = config.working;
    if(config.working)check_work = setInterval(work,freq=parseInt(Math.max(Math.min(config.freq,hig_freq),low_freq)));
    return;
}

async function work(){
    if(working)
        await fetch("http://www.baidu.com?t="+(new Date().getTime()))
        .then(async d=>await d.text()
            .then(dd=>{
                if(dd.includes("百度")){
                    if(++contTms>10){
                        contTms = 0; 
                        clearInterval(check_work);
                        check_work = setInterval(work,freq=parseInt(Math.min(freq*1.07,hig_freq)));
                    }
                    return Promise.resolve();
                }
                return Promise.reject();
            })
            .catch(()=>Promise.reject())
        )
        .catch(async ()=>{
            contTms=0;
            clearInterval(check_work)
            return await identify()
            .then(()=>{
                freq = parseInt(Math.max(Math.min(((new Date().getTime())-last_fail)/1.5,freq),low_freq));
                last_fail = new Date().getTime();
                check_work = setInterval(work,freq);
            })
            .catch(()=> working = false)
        })
}

function identify(){
    return fetch("http://222.198.127.170/eportal/InterFace.do?method=login", {
        "headers": {
            "accept": "*/*",
            "accept-language": "zh,zh-CN;q=0.9",
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        },
        "referrer": `http://222.198.127.170/eportal/index.jsp?wlanuserip=${localIP}&wlanacname=NAS&ssid=Ruijie&nasip=172.28.255.4&mac=782b467a0c33&t=wireless-v2-plain&url=http://123.123.123.123/`,
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": `userId=HEREFORUSERNAME&password=HEREFORNETWORKPASSWORD&service=%25E9%25BB%2598%25E8%25AE%25A4&queryString=wlanuserip%253D${localIP}%2526wlanacname%253DNAS%2526ssid%253DRuijie%2526nasip%253D172.28.255.4%2526mac%253D782b467a0c33%2526t%253Dwireless-v2-plain%2526url%253Dhttp%253A%252F%252F123.123.123.123%252F&operatorPwd=&operatorUserId=&validcode=`,
        "method": "POST",
        "mode": "cors"
    });
}

app.get("/",(req,res)=>{
    res.sendFile(__dirname+"/"+"index.html")
})

app.post("/api-exclusive",(req,res)=>{
    let ok = req.body.tk === passWD;
    res.send(ok);
    if(ok)setConf(req.body.config);
})

app.post("/api-stat",(req,res)=>{
    res.send({working,freq});
})

app.use("/public/",express.static("./public/"))

app.server = app.listen(9124,()=>{
    console.log("working at 127.0.0.1:9124")
    last_fail = new Date().getTime();
    localIP = os.networkInterfaces().wlo1[0].address;
})