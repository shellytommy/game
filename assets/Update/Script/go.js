
let go = class{

    constructor(){
        
        //o(n)
        // var remove = function (nums) {
        //     let left = 0
        //     for (let right = 1; right < nums.length; right++) {
        //         if(nums[left] != nums[right]){
        //             nums[++left] = nums[right]
        //         }
        //     }
        //     return left++;
        // }
        // let a = remove([1,1,2]);
        // console.log("a",a)


        var sequenceMis = function (misArr, onAllExec, execFunc){
            let co = 0
            let execMis ;
            execMis = ()=>{
                console.log(" co>=misArr.length ", co,  misArr.length)
                if(co>=misArr.length){
                    onAllExec()
                    return 
                }
                let mis = misArr[co]
                let curCo = co
                co=co+1 
                execFunc(mis, curCo, execMis)
            } 
            execMis() 
        }
        let moduleNameArr =["ABLogin","ABCommon"]
        sequenceMis(moduleNameArr,()=>{
            // 所有配置下载完成
            console.log("所有配置下载完成")
            
        }, (curMis, idx, onExec)=>{ 
            // 每个预加载任务
            let moduleName = moduleNameArr[idx]
            console.log("moduleName: ",moduleName)
            // let retTemp = {}
            // retTemp = this._hotUpdateModule(moduleName, (hot_ret)=>{
            //     let {haveNewVer, needRestart} = hot_ret
            //     JS_LOG("moduleName,haveNewVer,needRestart ", moduleName, haveNewVer, needRestart)
            //     if(haveNewVer) { 
            //         need_Update = true 
            //         needUpdateNames.push(moduleName)
            //     }
            //     if(needRestart) { need_Restart = true }
            //     onExec()
            // }) 
            // ------------------------------------------ 
        })
        const crypto = require("crypto");
        console.log("crypto ", crypto)
    }

    
}


let obj = new go();







