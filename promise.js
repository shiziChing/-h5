
const PENDING = 'PENDING';
const FULFILLED = 'FULILLED';
const REJECTED = 'REJECTED';
class MyPromise {
    constructor (executor){
        this.state = PENDING;
        this.value = undefined;
        this.reason = undefined;
        this.onResolveCallbacks = [];
        this.onRejectCallbacks = [];
        // console.log(executor)
        const resolve = (val) => {
            // console.log(val)
            if(this.state === PENDING){
                this.state = FULFILLED;
                this.value = val
                this.onResolveCallbacks.forEach(fn => fn())
            }
        }
        const reject = (err) => {
            if(this.state === PENDING){
                this.state = REJECTED;
                this.reason = err;
                this.onRejectCallbacks.forEach(fn => fn())
            }
        }
        try {
            executor(resolve, reject)
        }catch(e){
            reject(e)
        }
    }
    then(onFulfilled, onRejected){
        // console.log(this.state)
        if(this.state === PENDING ){ //  等待
            this.onResolveCallbacks.push(() => {
                onFulfilled(this.value)
            })
            this.onResolveCallbacks.push(() => {
                onRejected(thie.reason)
            })
        }
        if(this.state === FULFILLED ){
            onFulfilled(this.value)
        }
        if(this.state === REJECTED) {
            onRejected(this.reason)
        }
    }
}
const myPromise = new MyPromise((resolve, reject) => {
    resolve(100)
})
console.log(myPromise)
myPromise.then((value) => {
    setTimeout(() => {
        console.log(value)
    }, 2000);
})