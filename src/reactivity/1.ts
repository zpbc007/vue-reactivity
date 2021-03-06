export type Effect = () => void;

const effectSet = new Set<Effect>();
let activeEffect: Effect;

// 设置当前的 effect
export function effect(fn: Effect) {
    activeEffect = fn;
    fn();
}

// 让数据成为响应式对象
export function reactive<T extends Record<string, any>>(data: T): T {
    return new Proxy(data, {
        get(target, key) {
            // 存储 effect
            activeEffect && effectSet.add(activeEffect);
            // 返回读取的值
            return target[key as keyof T];
        },
        set(target, key, newVal) {
            // 设置值
            target[key as keyof T] = newVal;
            // 执行 effect
            effectSet.forEach((effect) => effect());
            // 返回 true 代表设置成功
            return true;
        },
    });
}
