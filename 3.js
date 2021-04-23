// 简单版本2——手写递归方法
// [√] 支持值类型
// [√] 支持引用类型（包括数组、对象、日期、正则）
// [√] 解决循环引用

// 递归方法实现深度克隆原理：
// 遍历对象、数组直到里边都是基本数据类型，然后再去复制，就是深度拷贝。

// 有种特殊情况需注意就是对象存在循环引用的情况，即对象的属性直接的引用了自身的情况，解决循环引用问题，我们可以额外开辟一个存储空间，来存储当前对象和拷贝对象的对应关系，当需要拷贝当前对象时，先去存储空间中找，有没有拷贝过这个对象，如果有的话直接返回，如果没有的话继续拷贝，这样就巧妙化解的循环引用的问题。

function deepClone(obj, map = new WeakMap()) {
  if (obj === null) return obj; // 如果是null或者undefined就不进行拷贝操作
  if (obj instanceof Date) return new Date(obj);
  if (obj instanceof RegExp) return new RegExp(obj);
  // 可能是对象或者普通的值  如果是函数的话是不需要深拷贝
  if (typeof obj !== "object") return obj;
  // 是对象的话就要进行深拷贝
  if (map.get(obj)) return map.get(obj);
  let cloneObj = new obj.constructor();
  // 找到的是所属类原型上的constructor,而原型上的 constructor指向的是当前类本身
  map.set(obj, cloneObj);
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      // 实现一个递归拷贝
      cloneObj[key] = deepClone(obj[key], map);
    }
  }
  return cloneObj;
}