
let go = class{

    constructor(){
        
        //o(n)
        var remove = function (nums) {
            let left = 0
            for (let right = 1; right < nums.length; right++) {
                if(nums[left] != nums[right]){
                    nums[++left] = nums[right]
                }
            }
            return left++;
        }
        let a = remove([1,1,2]);
        console.log("a",a)
    }

    
}


let obj = new go();







