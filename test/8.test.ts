import { describe, expect, it, vi } from 'vitest';
import { reactive, watch } from '../src/reactivity/8';

describe('8.ts', () => {
    it('watch reactive should work', () => {
        const data = reactive({ count: 1 });

        const fn = vi.fn().mockImplementation(() => {});
        watch(data, fn);

        expect(fn).toBeCalledTimes(0);

        data.count++;
        expect(fn).toBeCalledTimes(1);
    });

    it('watch getter should work', () => {
        const data = reactive({ a: 1, b: 2 });
        const fn = vi.fn().mockImplementation(() => {});
        watch(() => data.a, fn);

        expect(fn).toBeCalledTimes(0);

        data.b++;
        expect(fn).toBeCalledTimes(0);

        data.a++;
        expect(fn).toBeCalledTimes(1);
    });

    it('watcher should has oldValue and newValue', () => {
        const data = reactive({ a: 1, b: 2 });
        const fn = vi.fn().mockImplementation(() => {});
        watch(() => data.a, fn);

        data.a++;
        expect(fn).toBeCalledWith(2, 1);

        data.a = 100;
        expect(fn).toBeCalledWith(100, 2);
    });
});
