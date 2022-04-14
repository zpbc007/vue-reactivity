import { describe, expect, it, vi } from 'vitest';
import { effect, reactive } from '../src/reactivity/3';

describe('2.ts', () => {
    it('effect should be called when data change', () => {
        const data = reactive({ count: 1 });
        // 设置当前的 effect
        const fn = vi.fn().mockImplementation(() => {
            console.log('count: ', data.count);
        });
        effect(fn);

        // 初始值
        expect(fn).toBeCalledTimes(1);

        // 设置新值
        data.count++;
        expect(data.count).toBe(2);
        // count 改变，effect 自动执行
        expect(fn).toBeCalledTimes(2);
    });

    it('effect should not be called when other key changed', () => {
        const data = reactive({ count: 1, other: 1 });
        // 设置当前的 effect
        const fn = vi.fn().mockImplementation(() => {
            console.log('count: ', data.count);
        });
        effect(fn);

        expect(fn).toBeCalledTimes(1);

        // 设置新值
        data.count = 2;
        data.other = 2;
        // count 改变，effect 自动执行
        expect(fn).toBeCalledTimes(2);
    });

    it('effect should not be called when other reactive changed', () => {
        const data1 = reactive({ count: 1 });
        const data2 = reactive({ count: 1 });
        // 设置当前的 effect
        const fn = vi.fn().mockImplementation(() => {
            console.log('count: ', data1.count);
        });
        effect(fn);

        expect(fn).toBeCalledTimes(1);
        // 设置新值
        data1.count = 2;
        data2.count = 2;
        // count 改变，effect 自动执行
        expect(fn).toBeCalledTimes(2);
    });

    it('effect should not be called when deps change', () => {
        const data = reactive({ showText: true, text: 'hello world' });
        const fn = vi.fn().mockImplementation(() => {
            if (data.showText) {
                console.log(data.text);
            }
        });

        effect(fn);
        expect(fn).toBeCalledTimes(1);

        data.text = 'text changed';
        expect(fn).toBeCalledTimes(2);

        data.showText = false;
        expect(fn).toBeCalledTimes(3);

        data.text = 'text changed again';
        expect(fn).toBeCalledTimes(3);
    });
});
