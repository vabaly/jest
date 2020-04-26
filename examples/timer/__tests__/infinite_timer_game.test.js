// Copyright 2004-present Facebook. All Rights Reserved.

'use strict';

// 声明使用模拟的计时器
jest.useFakeTimers();

it('schedules a 10-second timer after 1 second', () => {
  // 在 global 上创建一个 setTimeout 的模拟函数
  // 因为 global 本身可以被全局变量访问，所以可以不用另外用变量接收这个模拟函数
  // 也就是说，下面这一行类似于 const setTimeout = jest.spyOn(global, 'setTimeout')
  jest.spyOn(global, 'setTimeout');
  const infiniteTimerGame = require('../infiniteTimerGame');
  const callback = jest.fn();

  // 在此次调用中，setTimeout 被调用了一次，也就是说创建了一个正在等待的定时器
  infiniteTimerGame(callback);

  // At this point in time, there should have been a single call to
  // setTimeout to schedule the end of the game in 1 second.
  // 期望函数被调用多少次，这里看起来并没有声明 setTimeout，因为上述添加进了 global 的原因，所以无需声明
  // 检查函数是否被调用了一次
  expect(setTimeout).toBeCalledTimes(1);
  // 检查第一次调用 setTimeout 的函数传入值是否和预期的匹配
  expect(setTimeout).toHaveBeenNthCalledWith(1, expect.any(Function), 1000);

  // Fast forward and exhaust only currently pending timers
  // (but not any new timers that get created during that process)
  // 只模拟执行等待中的定时器的回调函数
  jest.runOnlyPendingTimers();

  // At this point, our 1-second timer should have fired its callback
  // 回调函数被调用了
  expect(callback).toBeCalled();

  // And it should have created a new timer to start the game over in
  // 10 seconds
  // 回调函数被调用，于是 setTimeout 又被调用了一次，又产生了一个等待中的定时器，不过没有模拟函数来执行它了
  expect(setTimeout).toBeCalledTimes(2);
  expect(setTimeout).toHaveBeenNthCalledWith(2, expect.any(Function), 10000);
});
