import { describe, expect, it, vi } from 'vitest';
import { effect, reactive } from '../src/reactivity/1';

describe('1.ts', () => {
    it('effect should be called when data change', () => {
        const data = reactive({ count: 1 });
        // 设置当前的 effect
        const fn = vi.fn().mockImplementation(() => {
            console.log('count: ', data.count);
        });
        effect(fn);

        // 初始值
        expect(data.count).toBe(1);
        expect(fn).toBeCalledTimes(1);

        // 设置新值
        data.count++;
        expect(data.count).toBe(2);
        // count 改变，effect 自动执行
        expect(fn).toBeCalledTimes(2);
    });
});
