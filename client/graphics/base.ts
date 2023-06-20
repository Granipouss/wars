import { Utils } from '../../engine';
import { Coroutine } from './utils';
import { Container } from 'pixi.js';

export class BaseSprite extends Container {
    private readonly updaters: ((dt: number) => void)[] = [];

    update(dt: number) {
        this.updaters.forEach((fn) => fn(dt));
    }

    observe = <const T>(
        getter: () => T, //
        callback: (value: T) => void,
    ) => {
        let lastStringifiedValue: string;

        const check = () => {
            const currentValue = getter();
            const currentStringifiedValue = JSON.stringify(currentValue);
            if (lastStringifiedValue !== currentStringifiedValue) {
                lastStringifiedValue = currentStringifiedValue;
                callback(currentValue);
            }
        };

        this.updaters.push(check);
    };

    run(routine: Coroutine<void, void, number>) {
        return new Promise<void>((resolve) => {
            const step = (dt: number) => {
                const { done } = routine(dt);
                if (done) {
                    Utils.removeFrom(step, this.updaters);
                    resolve();
                }
            };
            this.updaters.push(step);
        });
    }

    everyNthFrame(callback: (frame: number) => void, n = 1) {
        let cumul = 0;
        let lastFrame: number;

        const check = (dt: number) => {
            cumul += dt;
            const frame = Math.floor(cumul / n);
            if (frame === lastFrame) return;
            callback(frame);
        };

        check(0);
        this.updaters.push(check);
    }
}
