import { describe, expect, it, vi } from 'vitest';
import { Effect, effect, reactive } from '../src/reactivity/6';

describe('6.ts', () => {
    it('scheduler should work', () => {
        const data = reactive({ count: 1 });

        const effectQueue: Effect[] = [];
        const fn = vi.fn().mockImplementation(() => {
            console.log(data.count);
        });
        effect(fn, { scheduler: (fn) => effectQueue.push(fn) });

        // effect 存入 effectQueue 中并未执行
        data.count++;
        expect(fn).toBeCalledTimes(1);

        // 执行 effectQueue
        effectQueue.forEach((item) => item());
        expect(fn).toBeCalledTimes(2);
    });

    it('can skip by scheduler', async () => {
        const data = reactive({ count: 1 });
        const jobQueue = new Set<Effect>();
        let flushing = false;
        let resolveFinish: () => void;
        const flushFinished = new Promise<void>((resolve) => (resolveFinish = resolve));

        const flushJob = () => {
            // 正在清空队列
            if (flushing) {
                return;
            }

            flushing = true;
            Promise.resolve()
                .then(() => {
                    jobQueue.forEach((job) => job());
                })
                .finally(() => {
                    flushing = false;
                    resolveFinish();
                });
        };

        const countHistory: number[] = [];
        const fn = vi.fn().mockImplementation(() => {
            countHistory.push(data.count);
        });
        effect(fn, {
            scheduler: (fn) => {
                jobQueue.add(fn);

                flushJob();
            },
        });

        data.count++; // 2
        data.count++; // 3
        data.count++; // 4

        await flushFinished;

        expect(countHistory).toEqual([1, 4]);
    });
});
