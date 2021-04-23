// 简单版本1-手写递归方法
// [√] 支持值类型
// [√] 支持引用类型（包括数组、对象）
// [√] 解决循环引用

function clone(target, map = new Map()) {
  // - 如果是值类型，无需继续拷贝，直接返回
  // - 如果是引用类型，创建一个新对象，依次遍历将原对象上的属性拷贝到新对象上（采用递归实现）
  if (typeof target === 'object') {

    // - 如果拷贝的数组，则不应该创建对象{}，则是创建数组[]，在前面加上判断即可
    let cloneTarget = Array.isArray(target) ? [] : {};

    // 【避免循环引用】为了避免循环引用导致栈内存溢出，我们应该额外开辟一个存储空间，用来存放当前对象与拷贝对象的对应关系，当需要拷贝当前对象时，先去存储空间中查找，如果有的话就直接返回，如果没有的话就继续拷贝
    // 【WeakMap】在这里，我们通过WeakMap来实现。如果我们创建了强引用的对象，我们只有手动设置为null才能被GC回收，如果是弱引用类型的话，GC会自动帮我们回收。如果我们要拷贝的对象非常非常大时，使用Map会对内存造成很大的消耗，这时使用WeakMap可以解决这个问题。
    if (map.get(target)) {
      return map.get(target);
    }
    map.set(target, cloneTarget);

    // 【递归】遍历对象的每个key，分别赋值（这里使用到了递归），同样需要判断赋值的元素是值类型还是引用类型
    for (const key in target) {
      cloneTarget[key] = clone(target[key], map);
    }
    return cloneTarget;
  } else {
    return target;
  }
}