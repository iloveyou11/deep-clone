// 直接使用JSON.parse(JSON.stringify())

let arr = [1, 3, {
  username: 'name'
}];
let cloneArr = JSON.parse(JSON.stringify(arr));
cloneArr[2].username = 'newName'; 
console.log(arr, cloneArr)

// 也是利用JSON.stringify将对象转成JSON字符串，再用JSON.parse把字符串解析成对象，一去一来，新的对象产生了，而且对象会开辟新的栈，实现深拷贝。

// 这种方法虽然可以实现数组或对象深拷贝,但不能处理函数和正则，因为这两者基于JSON.stringify和JSON.parse处理后，得到的正则就不再是正则（变为空对象），得到的函数就不再是函数（变为null）了。