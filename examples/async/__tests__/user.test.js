// Copyright 2004-present Facebook. All Rights Reserved.

'use strict';

// 使用模拟的 request 函数
jest.mock('../request');

import * as user from '../user';

// Testing promise can be done using `.resolves`.
it('works with resolves', () => {
  //【Todo】 这个到底有什么用？
  expect.assertions(1);
  // 也可以使用 expect(<Promise>).resolves.<Matcher> 方法
  // 这本身返回的也是 Promise
  return expect(user.getUserName(5)).resolves.toEqual('Paul');
});

// The assertion for a promise must be returned.
it('works with promises', () => {
  expect.assertions(1);
  // 返回一个 Promise，只要 Promise 链最后使用了 `expect` 即可
  return user.getUserName(4).then(data => expect(data).toEqual('Mark'));
});

// async/await can be used.
it('works with async/await', async () => {
  expect.assertions(1);
  // 可以是一个 async / await 函数，然后就和同步一样使用 expect 了
  const data = await user.getUserName(4);
  expect(data).toEqual('Mark');
});

// async/await can also be used with `.resolves`.
it('works with async/await and resolves', async () => {
  expect.assertions(1);
  await expect(user.getUserName(5)).resolves.toEqual('Paul');
});

// Testing for async errors using `.rejects`.
it('tests error with rejects', () => {
  expect.assertions(1);
  return expect(user.getUserName(3)).rejects.toEqual({
    error: 'User with 3 not found.',
  });
});

// Testing for async errors using Promise.catch.
test('tests error with promises', async () => {
  expect.assertions(1);
  return user.getUserName(2).catch(e =>
    expect(e).toEqual({
      error: 'User with 2 not found.',
    }),
  );
});

// Or using async/await.
it('tests error with async/await', async () => {
  expect.assertions(1);
  try {
    await user.getUserName(1);
  } catch (e) {
    expect(e).toEqual({
      error: 'User with 1 not found.',
    });
  }
});

// Or using async/await with `.rejects`.
it('tests error with async/await and rejects', async () => {
  expect.assertions(1);
  await expect(user.getUserName(3)).rejects.toEqual({
    error: 'User with 3 not found.',
  });
});
