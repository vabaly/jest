// Copyright 2004-present Facebook. All Rights Reserved.

'use strict';

jest.useFakeTimers();

describe('timerGame', () => {
  beforeEach(() => {
    // 每个测试用例都需要初始化一下 global 的定时器，以保证调用计数什么的都从 0 开始算
    jest.spyOn(global, 'setTimeout');
  });
  it('waits 1 second before ending the game', () => {
    const timerGame = require('../timerGame');
    timerGame();

    expect(setTimeout).toBeCalledTimes(1);
    // 检查函数调用的传入值是否与预期的匹配
    expect(setTimeout).toBeCalledWith(expect.any(Function), 1000);
  });

  it('calls the callback after 1 second via runAllTimers', () => {
    const timerGame = require('../timerGame');
    const callback = jest.fn();

    timerGame(callback);

    // At this point in time, the callback should not have been called yet
    expect(callback).not.toBeCalled();

    // Fast-forward until all timers have been executed
    jest.runAllTimers();

    // Now our callback should have been called!
    expect(callback).toBeCalled();
    expect(callback).toBeCalledTimes(1);
  });

  it('calls the callback after 1 second via advanceTimersByTime', () => {
    const timerGame = require('../timerGame');
    const callback = jest.fn();

    timerGame(callback);

    // At this point in time, the callback should not have been called yet
    expect(callback).not.toBeCalled();

    // Fast-forward until all timers have been executed
    // 这个和前面的思路不太一样，前面的思路是忽略定时器的时间，直接从任务队列中取出执行，
    // 这里则是定时器的时间还存在，只是你“穿越了 1000 毫秒”，即快进 1000 毫秒，然后正常执行，显然就到了执行 setTimeout 的时间了
    jest.advanceTimersByTime(1000);

    // Now our callback should have been called!
    expect(callback).toBeCalled();
    expect(callback).toBeCalledTimes(1);
  });
});
