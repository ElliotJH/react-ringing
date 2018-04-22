import {applyPlace} from "./method-utils";

test('adds 1 + 2 to equal 3', () => {
    expect(1 + 2).toBe(3);
});

test('applyPlace to all places is identity', () => {
  expect(applyPlace('123456', [1, 2, 3, 4, 5, 6])).toEqual([1, 2, 3, 4, 5, 6])
});

test('applyPlace X', () => {
    expect(applyPlace('X', [1,2,3,4,5,6])).toEqual([2,1,4,3,6,5])
});
