window.onload=function(){
    let pwd = document.querySelector("#pwd");
    let freq= document.querySelector("#freq");
    let smt = document.querySelector("#smt");
    let wko = document.querySelector("#wko");

    axios({url:"/api-stat",method:"POST"})
    .then(d=>{
        wko.checked=d.data.working;
        working = d.data.working;
        freq.value=d.data.freq
    })
    .catch(e=>alert("500: Server Error"))   

    smt.onclick = ()=>{
        axios({
            url:"/api-exclusive",
            method:"POST",
            data:{
                tk: pwd.value,
                config:{
                    working: wko.checked,
                    freq: parseInt(freq.value)
                }
            }
        })
        .then(d=>d.data===true?location.reload():Promise.reject())
        .catch(e=>alert(e?"500: 服务器错误":"401: 密码错误"))
        return false;
    }
}