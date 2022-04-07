import { describe, expect, it, vi } from 'vitest';
import { setEffect, reactive } from '../src/reactivity/1';

describe('1.ts', () => {
    it('effect should be called when data change', () => {
        const data = reactive({ count: 1 });
        const effect = vi.fn().mockImplementation(() => {
            console.log('count: ', data.count);
        });

        // 设置当前的 effect
        setEffect(effect);
        // 执行 effect 触发 get
        effect();

        // 初始值
        expect(data.count).toBe(1);
        expect(effect).toBeCalledTimes(1);

        // 设置新值
        data.count++;
        expect(data.count).toBe(2);
        // count 改变，effect 自动执行
        expect(effect).toBeCalledTimes(2);
    });
});
