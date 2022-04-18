export type Effect = (() => void) & { deps: Array<Set<Effect>> };
type Key = string | Symbol;

// 建立 effect 与 reactive.key 的关联
const bucket = new WeakMap<any, Map<Key, Set<Effect>>>();
let activeEffect: Effect;
const effectStack: Effect[] = [];

// 设置当前的 effect
export function effect(fn: () => void) {
    const effectFn: Effect = () => {
        // 执行前先清除依赖
        cleanup(effectFn);
        effectStack.push(effectFn);
        // effect 执行时设置为当前激活的副作用函数
        activeEffect = effectFn;
        fn();
        effectStack.pop();
        activeEffect = effectStack[effectStack.length - 1];
    };

    // 存储与当前 effect 相关的依赖
    effectFn.deps = [];
    effectFn();
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
    // 存储相关依赖
    activeEffect.deps.push(deps);
}

function trigger(target: any, key: Key) {
    // 设置值
    const depsMap = bucket.get(target);
    if (!depsMap) {
        return;
    }

    const effects = depsMap.get(key);
    if (!effects) {
        return;
    }

    const effectsToRun = new Set(effects);
    // 执行 effect
    effectsToRun.forEach((effect) => effect());
}

function cleanup(effect: Effect) {
    // 遍历先关依赖，删除当前 effect
    effect.deps.forEach((deps) => {
        deps.delete(effect);
    });
    // 清空 effect 的依赖
    effect.deps.length = 0;
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
