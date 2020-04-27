# 断言

在写测试用例的时候，经常需要验证某个值是不是符合预期值，这时候就需要用到 `expect` 对象，它提供了一组 “匹配方法” 来验证各种各样的情况。

如果想要更多的 “匹配方法”，那么可以使用 [jest-extended](https://github.com/jest-community/jest-extended)，它扩展了 `expect` 对象，使其更加强大。

## 目录

- [expect(value)](#expect-value)
- [expect.extend(matchers)](#expect-extend)
  - [异步匹配函数](#async-matchers)
  - [自定义匹配函数的上下文](#custom-matchers-api)
    - [this.isNot](#this-is-not)
    - [this.promise](#this-promise)
    - [this.equals(a, b)](#this-equals)
    - [this.expand](#this-expand)
    - [this.utils](#this-utils)
  - [自定义快照匹配函数](#custom-snapshot-matchers)
- [expect.anything()](#expect-anything)
- [expect.any(constructor)](#expect-any)
- [expect.arrayContaining(array)](#expect-array-containing)


## 方法

### <a href='#expect-value'>expect(value)</a>

`expect` 函数在每次想断言一个值的时候都会用到，不过，你几乎不会单独使用它，而是和一些 “匹配函数” 一起来进行断言。

可以通过一个示例来让这一点更容易理解。假设有一个 `bestLaCroixFlavor()` 函数，它的返回值是字符串 `grapefruit`，那么测试用例就像下面这样：

```js
// 测试用例的描述信息要像这样清楚，说明这个测试用例是测什么的
test('the best flavor is grapefruit', () => {
  expect(bestLaCroixFlavor()).toBe('grapefruit');
});
```

上述例子中，`toBe` 就是一个 “匹配函数”，文档后面还有许多不同的匹配函数，来帮助你测试不同的东西。

`expect` 函数的参数是逻辑代码实际产生的一个值，匹配函数的参数则是一个逻辑代码正确的话应该产生的值。如果把它们搞混了，测试用例可能仍会通过，但是失败的用例显示的信息和建议则是相反的。

### <a href='#expect-extend'>expect.extend(matchers)</a>

你可以使用 `expect.extend` 方法来向 `Jest` 添加自定义的 “匹配函数”，举个例子，现在你需要断言一个数字是否在某两个数字之间，那么就可以抽象出一个名叫 `toBeWithinRange` 的匹配函数。

```js
// `expect.extend` 的参数是一个对象，对象里面的属性就是一个个匹配函数
expect.extend({
  toBeWithinRange(received, floor, ceiling) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      // 匹配函数返回值的格式
      return {
        message: () =>
          `expected ${received} not to be within range ${floor} - ${ceiling}`,
        // 【Todo】Pass 为 true 的时候代表什么意思
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected ${received} to be within range ${floor} - ${ceiling}`,
        // 【Todo】Pass 为 false 的时候代表什么意思
        pass: false,
      };
    }
  },
});

test('numeric ranges', () => {
  expect(100).toBeWithinRange(90, 110);
  expect(101).not.toBeWithinRange(0, 100);
  // .toEqual 这样使用的方式后面会谈到
  expect({apples: 6, bananas: 3}).toEqual({
    apples: expect.toBeWithinRange(1, 10),
    bananas: expect.not.toBeWithinRange(11, 20),
  });
});
```

*备注*：如果使用 `TypeScript`，并且使用了 `@types/jest`，那么上述例子中的 `toBeWithinRange` 匹配函数就可以像下面这样定义：

```ts
// 【Todo】这样定义定义在哪里呢
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeWithinRange(a: number, b: number): R;
    }
  }
}
```

#### <a href='#async-matchers'>异步匹配函数</a>

`expect.extend` 也支持扩展异步的匹配函数。异步匹配函数的返回值是一个 `Promise`，`Promise` 的决议值和同步匹配函数一致。继续用例子来说明，我们将实现一个名叫 `toBeDivisibleByExternalValue` 的匹配函数，它将从外部请求回一个数值，然后断言传进来的数值能否被请求回来的数值给整除：

```js
expect.extend({
  // 匹配函数的第一个参数依然是传进来的值
  async toBeDivisibleByExternalValue(received) {
    // 从外部请求回来一个数值
    const externalValue = await getExternalValueFromRemoteSource();
    const pass = received % externalValue == 0;
    if (pass) {
      return {
        message: () =>
          `expected ${received} not to be divisible by ${externalValue}`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected ${received} to be divisible by ${externalValue}`,
        pass: false,
      };
    }
  },
});

// test 的第二个参数也是个返回 Promise 的函数哦
test('is divisible by external value', async () => {
  await expect(100).toBeDivisibleByExternalValue();
  await expect(101).not.toBeDivisibleByExternalValue();
});
```

#### <a href='#custom-matchers-api'>自定义匹配函数的上下文</a>

匹配函数的返回值是一个对象（或者是个 `Promise`，`Promise` 的决议值是个对象），这个对象有两个属性，一个 `pass`
，一个 `message`。`pass` 的值是个布尔值，它反应了这个匹配有没有匹配上，`message` 的值是个没有参数的函数，该函数的返回值是断言失败的情况下需要显示的错误信息。具体点说，当 `pass` 值是 `false` 的时候，形如 `expect(x).yourMatcher()` 的断言会失败，`message` 返回的信息会显示出来。相反，当 `pass` 值是 `true` 的时候，形如 `expect(x).not.yourMatcher()` 的断言会失败，`message` 返回的信息会显示出来。

匹配函数的参数是调用 `expect(x)` 和 `.yourMatcher(y, z)` 共同组成的：

```js
expect.extend({
  // x, y, z 共同组成参数
  yourMatcher(x, y, z) {
    return {
      pass: true,
      message: () => '',
    };
  },
});
```

匹配函数被调用时，会给函数内部的 `this` 绑定一个对象，这个对象包含以下属性和方法（译者注：所以，可以在定义函数的时候，通过 `this.x` 的形式来使用这些属性和方法）：

##### <a href='#this-is-not'>this.isNot</a>

一个布尔值，表示断言是否使用了 `.not` 修饰符，这个属性可以帮助你构造更加清晰和正确的错误信息。（可以看后面的示例代码来理解）

##### <a href='#this-promise'>this.promise</a>

一个字符串类型的值，也是帮助显示更加清晰和准确的错误信息的，具体有以下三个值：

- `'rejects'`，当断言 `Promise` 值且使用了 `.rejects` 修饰符时，是这个值
- `'resolves'`，当断言 `Promise` 值且使用了 `.resolves` 修饰符时，是这个值
- `''`，当断言 `Promise` 值且没有使用任何修饰符时，是这个值

##### <a href='#this-equals'>this.equals(a, b)</a>

这是一个帮助函数，用于比较 `a`, `b` 两个对象是否完全相等，它是一个深比较，会递归比较嵌套对象里面的值。

##### <a href='#this-expand'>this.expand</a>

一个布尔值，当运行测试且在命令行中加了 `--expand` 参数时，这个值就是 `true`，这个参数表示测试时会显示所有的差异和错误，而不是部分的。（Todo，需要试一下，截个图比较一下）

##### <a href='#this-utils'>this.utils</a>

这个属性是个对象，它暴露了许多有用的工具函数，这些工具函数的主要都是从 [jest-matcher-utils](https://github.com/facebook/jest/tree/master/packages/jest-matcher-utils) 库暴露出来的函数（译者注：所以，想了解这个属性，需要去研究 `jest-matcher-utils` 库）。

最有用的几个方法分别是 `matcherHint`，`printExpected` 和 `printReceived`，它们可以对错误信息进行美化。举例的话，我们可以看看 `.toBe` 匹配函数的内部实现：

```js
const diff = require('jest-diff');
expect.extend({
  toBe(received, expected) {
    const options = {
      comment: 'Object.is equality',
      isNot: this.isNot,
      promise: this.promise,
    };

    // 比较接收值和预期值是否完全相等
    const pass = Object.is(received, expected);

    const message = pass
      ? () =>
          this.utils.matcherHint('toBe', undefined, undefined, options) +
          '\n\n' +
          `Expected: not ${this.utils.printExpected(expected)}\n` +
          `Received: ${this.utils.printReceived(received)}`
      : () => {
          const diffString = diff(expected, received, {
            expand: this.expand,
          });
          return (
            this.utils.matcherHint('toBe', undefined, undefined, options) +
            '\n\n' +
            (diffString && diffString.includes('- Expect')
              ? `Difference:\n\n${diffString}`
              : `Expected: ${this.utils.printExpected(expected)}\n` +
                `Received: ${this.utils.printReceived(received)}`)
          );
        };

    // actual 可能是为了继续传递的机制【Todo】
    return {actual: received, message, pass};
  },
});
```

断言以及断言的错误信息可能就是下面这样：

```
expect(received).toBe(expected)

  Expected value to be (using Object.is):
    "banana"
  Received:
    "apple"
```

断言失败时的错误信息应该向开发者提供尽可能多的信号来帮助他们快速解决问题，所以，你应该好好地设计一条错误信息，以确保使用你这个自定义匹配函数的开发者获得良好的开发体验。

#### <a href='#custom-snapshot-matchers'>自定义快照匹配函数</a>

要在自定义匹配函数中使用快照测试，可以使用 `jest-snapshot` 库。

下列名为 `.toMatchTrimmedSnapshot(length)` 的快照匹配函数只存储给定长度的字符串，并前后比较，意思就是说，每次快照测试的比对只比对一部分，一部分相等就认为断言成功了：

```js
const {toMatchSnapshot} = require('jest-snapshot');

expect.extend({
  toMatchTrimmedSnapshot(received, length) {
    // toMatchSnapshot 的使用方法
    return toMatchSnapshot.call(
      // 自定义匹配函数的上下文
      this,
      // 快照存储的数据
      received.substring(0, length),
      // 自定义匹配函数的名称
      'toMatchTrimmedSnapshot',
    );
  },
});

// 只匹配前 10 位字符串数据是否每次都相同
it('stores only 10 characters', () => {
  expect('extra long string oh my gerd').toMatchTrimmedSnapshot(10);
});

/*
Stored snapshot will look like:
存储的数据快照如下所示，只有前十位：

exports[`stores only 10 characters: toMatchTrimmedSnapshot 1`] = `"extra long"`;
*/
```

你也可以创建自定义的内联快照匹配函数，内联的快照匹配函数产生的快照数据会保存在自定义匹配函数被调用时的参数里面。值得注意的是，快照数据会放在第一个参数这个位置，所以自定义内联快照匹配函数没法传自定义参数，否则会被覆盖掉。

> 这一段还不理解：inline snapshot will always try to append to the first argument or **the second when the first argument is the property matcher**

```js
// 使用这个函数来帮助创建
const {toMatchInlineSnapshot} = require('jest-snapshot');

expect.extend({
  toMatchTrimmedInlineSnapshot(received) {
    return toMatchInlineSnapshot.call(this, received.substring(0, 10));
  },
});

it('stores only 10 characters', () => {
  // 不传任何参数
  expect('extra long string oh my gerd').toMatchTrimmedInlineSnapshot();
  /*
  The snapshot will be added inline like
  // 传了也会被覆盖掉
  expect('extra long string oh my gerd').toMatchTrimmedInlineSnapshot(
    `"extra long"`
  );
  */
});
```

### <a href='#expect-anything'>expect.anything()</a>

`expect.anything()` 的返回值代表除 `null` 和 `undefined` 之外的所有值，它可以作为 `.toEqual` 和 `.toBeCalledWith` 这两个匹配函数的参数来代替那些字面量。例如，如果你想断言模拟函数的调用使用了参数（管他什么参数，只要有参数），就可以像下面这样写：

```js
test('map calls its argument with a non-null argument', () => {
  const mock = jest.fn();
  [1].map(x => mock(x));
  // .toBeCalledWith 会在后面讲到
  expect(mock).toBeCalledWith(expect.anything());
});
```

### <a href='#expect-any'>expect.any(constructor)</a>

`expect.any(constructor)` 的返回值代表是和构造函数 `constructor` 相匹配的值（译者注：`constructor` 是 `Number`、`String` 等这些原生函数，而相匹配的值就是数据类型是 `number`，`string` 或者 `instanceof Number` 等这样的值，可以认为是任何属于某种类型的值吧）。它也是作为 `.toEqual` 和 `.toBeCalledWith` 这两个匹配函数的参数来代替那些字面量。例如，你想断言模拟函数调用时的参数是数字类型，就可以像下面是这样写：

```js
function randocall(fn) {
  // 模拟函数调用时参数是 number 类型的
  return fn(Math.floor(Math.random() * 6 + 1));
}

test('randocall calls its callback with a number', () => {
  const mock = jest.fn();
  randocall(mock);
  // 作为 toBeCalledWith 的参数使用
  expect(mock).toBeCalledWith(expect.any(Number));
});
```

### <a href='#expect-array-containing'>expect.arrayContaining(array)</a>

未完待续

## 涉及到的其他库的知识

- [jest-matcher-utils](https://github.com/facebook/jest/tree/master/packages/jest-matcher-utils)
- jest-snapshot
