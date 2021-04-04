
const PENDING = 'PENDING';
const FULFILLED = 'FULILLED';
const REJECTED = 'REJECTED';

function resolvePromise(promise2, x, resolve, reject){
    if(x === promise2){
        return reject(new TypeError('类型错误：'))
    }
    if((typeof x === 'object' && x !== null) || typeof x === 'function'){ //  有可能是promise
        let called = false
        try {
            const then = x.then;
            if(typeof then === 'function'){
                then.call(x, 
                    y => { //  x为promise 且 成功了
                        if(called) return
                        called = true;
                        resolvePromise(promise2, y, resolve, reject)
                    },
                    r => {
                        if(called) return
                        called = true;
                        reject(r)
                    }
                )
            }else {
                resolve(x)
            }
        } catch (error) {
            if(called) return
            called = true;
            reject(error)
        }
    }else { //  普通值
        resolve(x)
    }
}
class myPromise {
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
        onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : v => v;
        onRejected = typeof onRejected === 'function' ? onRejected : err => {throw err}
        const promise2 = new myPromise((resolve, reject) => {
            if(this.state === PENDING ){ //  等待
                this.onResolveCallbacks.push(() => {
                    setTimeout(() => {
                        try{
                            const x = onFulfilled(this.value)
                            resolvePromise(promise2,x, resolve, reject )
                        }catch(e){
                            reject(e)
                        }
                    }, 0)
                })
                this.onRejectCallbacks.push(() => {
                    setTimeout(() => {
                        try{
                            const x = onRejected(this.reason)
                            resolvePromise(promise2,x, resolve, reject )
                        }catch(e){
                            reject(e)
                        }
                    }, 0)
                })
            }
            if(this.state === FULFILLED ){
                setTimeout(() => {
                    try{
                        const x = onFulfilled(this.value)
                        resolvePromise(promise2,x, resolve, reject )
                    }catch(e){
                        reject(e)
                    }
                }, 0)
            }
            if(this.state === REJECTED) {
                setTimeout(() => {
                    try{
                        const x = onRejected(this.reason)
                        resolvePromise(promise2,x, resolve, reject )
                    }catch(e){
                        reject(e)
                    }
                }, 0)
            }
        })
        return promise2;
        
    }
    //  实现 promise.resolve
    static resolve(value){
        return new myPromise((resolve) => {
            resolve(value)
        })
    }
    static reject(reason){
        return new myPromise((resolve, reject) => {
            reject(reason)
        })
    }
    static all(promises){
        return new myPromise((resolve, reject) => {
            const res = []
            let times = 0
            function processSuccess(i, val){
                res[i] = val;
                if(++times === promises.length){
                    resolve(res)
                }
            }
            for (let i = 0; i < promises.length; i++){
                const p = promises[i]
                if(p && typeof p.then === 'function'){
                    p.then(data => {
                        processSuccess(i, data)
                    }, reject)
                }else {
                    processSuccess(i, p)
                }
            }
        })

    }
    catch(errFn){
        return this.then(null, errFn)
    }
    finally(cb){
        return this.then(data => {
            return myPromise.resolve(cb()).then(() => data)
        }, err => {
            return myPromise.resolve(cb()).then(() => {throw err})
        })
    }
    static race(promises){
        return new myPromise((resolve, reject) => {
            for(let i = 0; i< promises.length; i++){
                const p = promises[i]
                if(p && typeof p.then === 'function'){
                    p.then(resolve, reject)
                }else {
                    resolve(p)
                }
            }
        })
        
    }
}
// const mypromise1 = new myPromise((resolve, reject) => {
//     resolve(100)
// })
// const mypromise2 = new myPromise((resolve, reject) => {
//     reject(100)
// })
// const mypromise3 = 'hahhaha'
// myPromise.all([mypromise1, mypromise2, mypromise3]).then(val => {
//     console.log(val)
// }, err => {
//     console.log(err)
// })
myPromise.reject(999).then(data => console.log(data)).catch(e => console.log(e))
.finally(((data, err) => {
    console.log(1111, err)
}))
