参考[如何写出一个惊艳面试官的深拷贝?](https://juejin.im/post/5d6aa4f96fb9a06b112ad5b1)

> **浅拷贝**：如果属性是值类型，拷贝的是值类型的值；如果属性是引用类型，拷贝的是引用类型的内存地址。其中一个对象改变了，另一个对象也会随之改变。

> **深拷贝**：开辟一个新的区域存放新对象，且修改新对象不会影响原对象

对于深拷贝，我们可以简单地通过`JSON.parse(JSON.stringify());`这么一段简单地写法实现。但是它还存在着很大的缺陷，例如无法拷贝其他引用类型、拷贝函数、解决循环引用等情况。

### 1. 基础版本

- 如果是值类型，无需继续拷贝，直接返回
- 如果是引用类型，创建一个新对象，依次遍历将原对象上的属性拷贝到新对象上（采用递归实现）
```js
function clone(target) {
    if (typeof target === 'object') {
        let cloneTarget = {};
        for (const key in target) {
            cloneTarget[key] = clone(target[key]);
        }
        return cloneTarget;
    } else {
        return target;
    }
};
```

### 2. 考虑数组

- 如果拷贝的数组，则不应该创建对象{}，则是创建数组[]，在前面加上判断即可。
```js
function clone(target) {
    if (typeof target === 'object') {
        let cloneTarget = Array.isArray(target) ? [] : {};
        for (const key in target) {
            cloneTarget[key] = clone(target[key]);
        }
        return cloneTarget;
    } else {
        return target;
    }
};
```

### 3. 解决循环引用

- 以上的版本如果发生循环引用的话会发生栈内存溢出的情况
- 这时，我们应该额外开辟一个存储空间，用来存放当前对象与拷贝对象的对应关系，当需要拷贝当前对象时，先去存储空间中查找，如果有的话就直接返回，如果没有的话就继续拷贝
```js
function clone(target, map = new Map()) {
    if (typeof target === 'object') {
        let cloneTarget = Array.isArray(target) ? [] : {};
        if (map.get(target)) {
            return map.get(target);
        }
        map.set(target, cloneTarget);
        for (const key in target) {
            cloneTarget[key] = clone(target[key], map);
        }
        return cloneTarget;
    } else {
        return target;
    }
};
```
在这里，我们也可以通过WeakMap来实现。如果我们创建了强引用的对象，我们只有手动设置为null才能被GC回收，如果是弱引用类型的话，GC会自动帮我们回收。

如果我们要拷贝的对象非常非常大时，使用Map会对内存造成很大的消耗，这时使用WeakMap可以解决这个问题。

### 4. 性能优化
当遍历数组时，直接使用forEach进行遍历，当遍历对象时，使用Object.keys取出所有的key进行遍历，然后在遍历时把forEach会调函数的value当作key使用：
```js
function clone(target, map = new WeakMap()) {
    if (typeof target === 'object') {
        const isArray = Array.isArray(target);
        let cloneTarget = isArray ? [] : {};

        if (map.get(target)) {
            return map.get(target);
        }
        map.set(target, cloneTarget);

        const keys = isArray ? undefined : Object.keys(target);
        forEach(keys || target, (value, key) => {
            if (keys) {
                key = value;
            }
            cloneTarget[key] = clone2(target[key], map);
        });

        return cloneTarget;
    } else {
        return target;
    }
}
```

### 5. 考虑其他数据类型
首先，判断是否为引用类型，我们还需要考虑function和null两种特殊的数据类型：
```js
//判断是否为对象
function isObject(target) {
    const type = typeof target;
    return target !== null && (type === 'object' || type === 'function');
}
if (!isObject(target)) {
        return target;
}
//获取数据类型
function getType(target) {
    return Object.prototype.toString.call(target);
}
```
下面我们抽离出一些常用的数据类型以便后面使用：
```js
//可以继续遍历的类型
const mapTag = '[object Map]';
const setTag = '[object Set]';
const arrayTag = '[object Array]';
const objectTag = '[object Object]';
//不可以继续遍历的类型
const boolTag = '[object Boolean]';
const dateTag = '[object Date]';
const errorTag = '[object Error]';
const numberTag = '[object Number]';
const regexpTag = '[object RegExp]';
const stringTag = '[object String]';
const symbolTag = '[object Symbol]';
```
可继续遍历的类型：
```js
function clone(target, map = new WeakMap()) {

    // 克隆原始类型
    if (!isObject(target)) {
        return target;
    }

    // 初始化
    const type = getType(target);
    let cloneTarget;
    if (deepTag.includes(type)) {
        cloneTarget = getInit(target, type);
    }

    // 防止循环引用
    if (map.get(target)) {
        return map.get(target);
    }
    map.set(target, cloneTarget);

    // 克隆set
    if (type === setTag) {
        target.forEach(value => {
            cloneTarget.add(clone(value,map));
        });
        return cloneTarget;
    }

    // 克隆map
    if (type === mapTag) {
        target.forEach((value, key) => {
            cloneTarget.set(key, clone(value,map));
        });
        return cloneTarget;
    }

    // 克隆对象和数组
    const keys = type === arrayTag ? undefined : Object.keys(target);
    forEach(keys || target, (value, key) => {
        if (keys) {
            key = value;
        }
        cloneTarget[key] = clone(target[key], map);
    });

    return cloneTarget;
}
```
不可继续遍历的类型：
```js
function cloneOtherType(targe, type) {
    const Ctor = targe.constructor;
    switch (type) {
        case boolTag:
        case numberTag:
        case stringTag:
        case errorTag:
        case dateTag:
            return new Ctor(targe);
        case regexpTag:
            return cloneReg(targe);
        case symbolTag:
            return cloneSymbol(targe);
        default:
            return null;
    }
}
// clone Symbol
function cloneSymbol(targe) {
    return Object(Symbol.prototype.valueOf.call(targe));
}
// Clone Regexp
function cloneReg(targe) {
    const reFlags = /\w*$/;
    const result = new targe.constructor(targe.source, reFlags.exec(targe));
    result.lastIndex = targe.lastIndex;
    return result;
}
// Clone Function
const isFunc = typeof value == 'function'
 if (isFunc || !cloneableTags[tag]) {
        return object ? value : {}
 }
function cloneFunction(func) {
    const bodyReg = /(?<={)(.|\n)+(?=})/m;
    const paramReg = /(?<=\().+(?=\)\s+{)/;
    const funcString = func.toString();
    if (func.prototype) {
        console.log('普通函数');
        const param = paramReg.exec(funcString);
        const body = bodyReg.exec(funcString);
        if (body) {
            console.log('匹配到函数体：', body[0]);
            if (param) {
                const paramArr = param[0].split(',');
                console.log('匹配到参数：', paramArr);
                return new Function(...paramArr, body[0]);
            } else {
                return new Function(body[0]);
            }
        } else {
            return null;
        }
    } else {
        return eval(funcString);
    }
}
```