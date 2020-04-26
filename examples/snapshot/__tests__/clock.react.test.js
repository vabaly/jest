// Copyright 2004-present Facebook. All Rights Reserved.

'use strict';

import React from 'react';
import Clock from '../Clock.react';
import renderer from 'react-test-renderer';

// 日期是变化的，为了保证不变，得使用假的时间
jest.useFakeTimers();
Date.now = jest.fn(() => 1482363367071);

it('renders correctly', () => {
  const tree = renderer.create(<Clock />).toJSON();
  console.log('tree', tree); //
  console.log(expect(tree).toMatchSnapshot()); // undefined
});

it('renders correctly inline', () => {
  const tree = renderer.create(<Clock />).toJSON();

  // 本来写的是 expect(tree).toMatchInlineSnapshot();
  // 运行一次就变成这个了
  expect(tree).toMatchInlineSnapshot(`
    <p>
      1482363367.071
       seconds have ellapsed since the UNIX epoch.
    </p>
  `);
});
