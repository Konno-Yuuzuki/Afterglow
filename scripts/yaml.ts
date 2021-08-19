/**
 * 读取yaml文件
 */

import { Type, load, Schema } from 'js-yaml';

const withAlphaType = new Type('!alpha', {
    kind: 'sequence',
    construct: ([hexRGB, alpha]) => hexRGB + alpha,
    // represent: ([hexRGB, alpha]) => hexRGB + alpha,
});

const schema = new Schema([withAlphaType]);

export default function loadToJSON<T>(str: string): T {
    return load(str, { schema }) as unknown as T;
}
