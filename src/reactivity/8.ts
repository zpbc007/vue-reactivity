interface Options {
    scheduler?: (fn: Effect) => void;
    lazy?: boolean;
}
export type Effect<T = any> = (() => T) & { deps: Array<Set<Effect>>; options: Options };
type Key = string | Symbol;

// 建立 effect 与 reactive.key 的关联
const bucket = new WeakMap<any, Map<Key, Set<Effect>>>();
let activeEffect: Effect;
const effectStack: Effect[] = [];

// 设置当前的 effect
export function effect<T>(fn: () => T, options: Options = {}) {
    const effectFn: Effect<T> = () => {
        // 执行前先清除依赖
        cleanup(effectFn);
        effectStack.push(effectFn);
        // effect 执行时设置为当前激活的副作用函数
        activeEffect = effectFn;
        const value = fn();
        effectStack.pop();
        activeEffect = effectStack[effectStack.length - 1];

        return value;
    };

    // 存储与当前 effect 相关的依赖
    effectFn.deps = [];
    // 存储 effect 的配置
    effectFn.options = options;
    if (!options.lazy) {
        effectFn();
    }

    return effectFn;
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

    const effectsToRun = new Set<Effect>();
    // 执行 effect
    effects.forEach((effect) => {
        if (effect !== activeEffect) {
            effectsToRun.add(effect);
        }
    });
    effectsToRun.forEach((effect) => {
        if (effect.options.scheduler) {
            // 调用调度器
            effect.options.scheduler(effect);
        } else {
            // 直接执行
            effect();
        }
    });
}

function cleanup(effect: Effect) {
    // 遍历先关依赖，删除当前 effect
    effect.deps.forEach((deps) => {
        deps.delete(effect);
    });
    // 清空 effect 的依赖
    effect.deps.length = 0;
}

function traverse(value: any, seen = new Set<any>()) {
    if (typeof value !== 'object' || value === null || seen.has(value)) {
        return;
    }
    seen.add(value);

    for (const key in value) {
        traverse(value[key], seen);
    }

    return value;
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

export function computed<T>(getter: () => T) {
    const myEffect = effect(getter, {
        lazy: true,
        scheduler: () => {
            dirty = true;
        },
    });
    let dirty = true;
    let value: T;

    const obj = {
        get value() {
            if (!dirty) {
                return value;
            }

            value = myEffect();
            dirty = false;

            return value;
        },
    };

    return obj;
}

export function watch<T>(source: (() => T) | T, cb: (newValue: T, oldValue: T | null) => void) {
    let getter: () => T;
    if (typeof source === 'function') {
        getter = source as () => T;
    } else {
        getter = () => traverse(source);
    }

    let oldValue: T | null = null;
    const effectFn = effect(getter, {
        lazy: true,
        scheduler: () => {
            const newValue = effectFn();
            cb(newValue, oldValue);
            // 更新旧值
            oldValue = newValue;
        },
    });

    // 获取首次的值
    oldValue = effectFn();
}
