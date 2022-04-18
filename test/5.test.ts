import { describe, expect, it, vi } from 'vitest';
import { effect, reactive } from '../src/reactivity/5';

describe('5.ts', () => {
    it('should work when get & set same key', () => {
        const data = reactive({ count: 1 });

        const fn = vi.fn().mockImplementation(() => {
            data.count++;
        });
        effect(fn);

        expect(fn).toBeCalledTimes(1);
    });
});
