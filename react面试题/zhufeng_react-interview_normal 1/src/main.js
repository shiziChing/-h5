
//1.定义JSX
let style = {color:'green',border:'1px solid red',margin:'5px'}
let A = {
    type:'div',
    key:'A',
    props:{
        style,
        children:[
            {type:'div',key:'B1',props:{style,children:[]}},
            {type:'div',key:'B2',props:{style,children:[]}}
        ]
    }
}
//开始我们的工作循环
//表示一个工作单元，表示正在处理中的fiber
let workInProgress;
const Placement = 'Placement';
const TAG_ROOT = 'TAG_ROOT';//这个Fiber根节点
const TAG_HOST = 'TAG_HOST';//指的是原生DOM节点 div span p

let root = document.getElementById('root');
//Fiber是一个普通的JS对象
let rootFiber = {
    tag:TAG_ROOT,//Fiber的类型
    key:'ROOT',//唯一标签
    stateNode:root,//Fiber对应的真实DOM节点
    props:{children:[A]}
}
function workLoop(){
    while(workInProgress){//如果有任务就执行
        workInProgress=performUnitOfWork(workInProgress);//执行完成之后会返回下一个任务
    }
    console.log(rootFiber);
    commitRoot(rootFiber);
}
function commitRoot(rootFiber){
    let currentEffect = rootFiber.firstEffect;
    while(currentEffect){
        let flags = currentEffect.flags;
        switch(flags){
            case Placement:
                commitPlacement(currentEffect);
        }
        currentEffect=currentEffect.nextEffect;
    }
}
function commitPlacement(currentEffect){
  let parent = currentEffect.return.stateNode;//父DOM节点什么时候创建的?
  parent.appendChild(currentEffect.stateNode);
}
function performUnitOfWork(workInProgress){
    beginWork(workInProgress);//根建子fiber树
    //父Fiber.child=大儿子.sibling=二儿子.sibling=三儿子
    if(workInProgress.child){//如果创建完子fiber链表后，如果有大儿子，有太子
        return workInProgress.child;//则返回处理太子，构建太子的儿子们
    }
    //如果没有儿子，接着构建弟弟
    while(workInProgress){//看看有没有弟弟
        //也有可能是最小的儿子完成了，这个最小的弟弟会让它父亲完成
        completeUnitOfWork(workInProgress);  //如果没有儿子，自己就结束了
        if(workInProgress.sibling){
            return workInProgress.sibling;
        }
        //如果也没有弟弟，找叔叔,怎么找叔叔？就是爸爸的弟弟， 
        workInProgress=workInProgress.return;
        //如果没有父亲，就全部结束 了
    }
}
//Fiber在结构 的时候要创建真实的DOM元素
function completeUnitOfWork(workInProgress){
  console.log('completeUnitOfWork',workInProgress.key);
  let stateNode;// 真实DOM
  switch(workInProgress.tag){
      case TAG_HOST:
          stateNode = createStateNode(workInProgress);
          break;
  }
  
  //在完成工作的单元的时候要判断当前的fiber节点有没有对应的DOM操作
  makeEffectList(workInProgress);
}
function makeEffectList(completeWork){
    let returnFiber = completeWork.return;
    if(returnFiber){
        if(!returnFiber.firstEffect){
            returnFiber.firstEffect=completeWork.firstEffect;
        }
        if(completeWork.lastEffect){
            if(returnFiber.lastEffect){
                returnFiber.lastEffect.nextEffect = completeWork.firstEffect;
            }
            returnFiber.lastEffect = completeWork.lastEffect;
        }
        if(completeWork.flags){
            if(returnFiber.lastEffect){
                returnFiber.lastEffect.nextEffect = completeWork;;
            }else{
                returnFiber.firstEffect=completeWork;
            }
            returnFiber.lastEffect = completeWork;
        }
    }
}
function createStateNode(fiber){
    if(fiber.tag === TAG_HOST){
        let stateNode = document.createElement(fiber.type);
        fiber.stateNode = stateNode;
    }
    return fiber.stateNode;
}
/**
 * 根据当前的Fiber和虚拟DOM构建Fiber树
 */
function beginWork(workInProgress){
    console.log('beginWork',workInProgress.key);
    let nextChildren = workInProgress.props.children;
    //会根据父FIBER和所有的儿子虚拟DOM儿子们构建出子fiber树。只有一层
    //先让父亲把儿子一个一个生出来，然后再说孙子的事
    return reconcileChildren(workInProgress,nextChildren);
}
//根据父Fiber和子虚拟DOM数组，构建当前returnFiber的子Fiber树
function reconcileChildren(returnFiber,nextChildren){
  let previousNewFiber;//上一个Fiber儿子
  let firstChildFiber;//当前returnFiber的大儿子
  for(let newIndex = 0;newIndex<nextChildren.length;newIndex++){
    let newFiber = createFiber(nextChildren[newIndex]);//B1
    newFiber.flags = Placement;//这是一个新节点，肯定要插入到DOM中
    newFiber.return = returnFiber;
    if(!firstChildFiber){//如果大儿子还没赋值，那说明大儿子，给赋上
        firstChildFiber=newFiber;
    }else{
        previousNewFiber.sibling = newFiber;
    }
    previousNewFiber=newFiber;
  }
  returnFiber.child =firstChildFiber;
  return firstChildFiber;//构建完子fiber后会返回大儿子
}
function createFiber(element){
    return {
        tag:TAG_HOST,//原生DOM节点
        type:element.type,//具体div p span
        key:element.key,//唯一标识
        props:element.props//属性对象
    }
}
//当前正在执行的工作单元
workInProgress=rootFiber;
workLoop();

//开始要根据虚拟DOM构建我们的Fiber树