export type Effect = () => void;
type Key = string | Symbol;

// 建立 effect 与 reactive.key 的关联
const bucket = new WeakMap<any, Map<Key, Set<Effect>>>();
let activeEffect: Effect;

// 设置当前的 effect
export function effect(fn: Effect) {
    activeEffect = fn;
    fn();
}

function track(target: any, key: Key) {
    if (!activeEffect) {
        return;
    }

    let depsMap = bucket.get(target);
    if (!depsMap) {
        bucket.set(target, (depsMap = new Map()));
    }

    let deps = depsMap.get(key);
    if (!deps) {
        depsMap.set(key, (deps = new Set()));
    }

    // 存储 effect
    deps.add(activeEffect);
}

function trigger(target: any, key: Key) {
    // 设置值
    const depsMap = bucket.get(target);
    if (!depsMap) {
        return;
    }

    const deps = depsMap.get(key);
    if (!deps) {
        return;
    }

    // 执行 effect
    deps.forEach((effect) => effect());
}

// 让数据成为响应式对象
export function reactive<T extends Record<string, any>>(data: T): T {
    return new Proxy(data, {
        get(target, key) {
            track(target, key);
            // 返回读取的值
            return target[key as keyof T];
        },
        set(target, key, newVal) {
            // 设置值
            target[key as keyof T] = newVal;
            trigger(target, key);
            return true;
        },
    });
}
