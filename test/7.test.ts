import { describe, expect, it, vi } from 'vitest';
import { effect, reactive, computed } from '../src/reactivity/7';

describe('7.ts', () => {
    it('delay should work', () => {
        const data = reactive({ count: 1 });

        const fn = vi.fn().mockImplementation(() => {
            return data.count;
        });
        const myEffect = effect<number>(fn, { lazy: true });

        expect(fn).toBeCalledTimes(0);

        const count = myEffect();
        expect(count).toBe(1);
        expect(fn).toBeCalledTimes(1);

        data.count++;
        expect(fn).toBeCalledTimes(2);

        const count1 = myEffect();
        expect(count1).toBe(2);
    });

    it('computed should work', () => {
        const data = reactive({ a: 1, b: 2 });
        const getter = vi.fn().mockImplementation(() => {
            return data.a + data.b;
        });

        const computedValue = computed(getter);
        expect(getter).toBeCalledTimes(0);

        let value = computedValue.value;
        expect(value).toBe(3);
        expect(getter).toBeCalledTimes(1);

        data.a++;
        data.b++;
        expect(getter).toBeCalledTimes(1);

        value = computedValue.value;
        expect(value).toBe(5);
        expect(getter).toBeCalledTimes(2);
    });
});
