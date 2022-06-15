/**
 * 读取yaml文件
 */

import { load, Schema, Type } from 'js-yaml';

const withAlphaType = new Type('!alpha', {
    kind: 'sequence',
    construct: ([hexRGB, alpha]) => {
        // return chroma(hexRGB)
        //     .darken(100 - alpha)
        //     .hex();
        return hexRGB + alpha;
    },
    // represent: ([hexRGB, alpha]) => hexRGB + alpha,
});

const schema = new Schema([withAlphaType]);

export default function loadToJSON<T>(str: string): T {
    return load(str, { schema }) as unknown as T;
}
