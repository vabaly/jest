/**
 * @file 基本类型的快照测试
 * @description 除了对渲染出来的字符串做快照匹配，其实可以对任何基本类型做一个匹配，
 *              渲染出来的字符串的匹配本质上只是字符串的匹配
 */

// 基本类型的匹配，本质上都会变成字符串的匹配，因为快照文件除了记录它们的值，并没有记录他们的类型
// 所以，匹配的时候，会转成字符串来匹配
it('null match', () => {
  const value = null;

  expect(value).toMatchSnapshot();
});

it('string match', () => {
  const value = '';

  expect(value).toMatchSnapshot();
});

it('number match', () => {
  const value = 0;

  expect(value).toMatchSnapshot();
});

it('boolean match', () => {
  const value = true;

  expect(value).toMatchSnapshot();
});

// 不能匹配一个 undefined 的值
// it('undefined match', () => {
//   let value;
//   expect(value).toMatchSnapshot();
// });

// 对象匹配，可以给某些字段配置期望的值
it('Object match', () => {
  const user = {
    createdAt: new Date(),
    id: Math.floor(Math.random() * 20),
    name: 'LeBron James',
  };

  expect(user).toMatchSnapshot({
    // 期望此字段是 Date 类型的任意值
    createdAt: expect.any(Date),
    id: expect.any(Number),
  });
});
