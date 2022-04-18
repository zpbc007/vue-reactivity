import { describe, expect, it, vi } from 'vitest';
import { effect, reactive } from '../src/reactivity/4';

describe('4.ts', () => {
    it('nest effect should work', () => {
        const data = reactive({ count: 1, count2: 2 });
        // 设置当前的 effect
        const innerFn = vi.fn().mockImplementation(() => {
            console.log('count2: ', data.count2);
        });
        const outerFn = vi.fn().mockImplementation(() => {
            effect(innerFn);
            console.log('count: ', data.count);
        });
        effect(outerFn);

        // 初始值
        expect(outerFn).toBeCalledTimes(1);
        expect(innerFn).toBeCalledTimes(1);

        // 设置新值，只有 innerFn 执行
        data.count2++;
        expect(outerFn).toBeCalledTimes(1);
        expect(innerFn).toBeCalledTimes(2);

        // 设置新值，都执行
        data.count++;
        expect(outerFn).toBeCalledTimes(2);
        expect(innerFn).toBeCalledTimes(3);
    });
});
