import chroma from 'chroma-js';
import { readFileSync } from 'fs';
import loadJSON from './yaml';

/**
 * 在开发模式下，有时当我们读取文件时 readFile 的返回值
 * 是一个空字符串。在这些情况下，我们需要再次读取文件
 */
async function readFileRetrying(filePathYAML: string): Promise<string> {
    const yaml = await readFileSync(filePathYAML, 'utf8');
    if (!yaml) {
        return readFileRetrying(filePathYAML);
    }
    return yaml;
}

/**
 * 读取yaml配置
 */
async function loadTheme(filePathYAML: string) {
    const yaml = await readFileRetrying(filePathYAML);

    const yamlAdjustInfo = infoAdjustment(yaml);
    const yamlAdjustColor = colorAdjustment(yamlAdjustInfo);

    const json = await loadJSON<Record<string, any>>(yamlAdjustColor);
    const light = await loadJSON<Record<string, any>>(
        generate(yamlAdjustColor, json),
    );

    for (let key in light.colors) {
        if (!light.colors[key]) {
            // 删除颜色为空的key
            delete light.colors[key];
        }
    }

    return light;
}

/**
 * 信息修改
 */
function infoAdjustment(yml: string) {
    const replaceMaps = new Map([
        ['Dracula', 'Afterglow'],
        ['Zeno Rocha', 'Konno Yuuzuki'],
        [
            'Derek P Sifford <dereksifford@gmail.com>',
            'Konno Yuuzuki <Konno_Yuuzuki@outlook.com>',
        ],
        ['theme.dracula', 'theme.Afterglow'],
    ]);
    let yamlAdjust = yml;
    replaceMaps.forEach((value, key) => {
        yamlAdjust = yamlAdjust.replace(key, value);
    });
    return yamlAdjust;
}

/**
 * 部分颜色调整
 */
function colorAdjustment(yaml: string) {
    const colorMaps = new Map([
        [/(panel.border: \*)\w+/, '$1BG'],
        [/(editor.lineHighlightBorder: \*)\w+/, '$1BG'],
    ]);

    let yamlAdjust = yaml;
    colorMaps.forEach((value, key) => {
        yamlAdjust = yamlAdjust.replace(key, value);
    });

    return yamlAdjust;
}

function generate(yaml: string, json: Record<string, any>) {
    // 背景色
    const BG = json.dracula.base[0];
    // 前景色
    const FG = json.dracula.base[1];
    // 其他背景色
    const otherBG = json.dracula.other;
    // 全部背景色
    const anyBG = [BG, ...otherBG];

    // Darken colors until constrast ratio complies with WCAG https://vis4.net/chromajs/#chroma-contrast
    // Minimum (Level AA) 4.5
    // Enhanced (Level AAA) 7

    const ratioTarget = 4.5;
    const variantBG = FG;
    const resolution = 0.001; // lower = more accurate, but longer execution

    const regex = /#[0-9A-F]{3,}/gi; // https://regexr.com/4cue7

    let yamlVariant = yaml.replace(regex, (color) => {
        const originalColor = color;
        const originalContrast = chroma.contrast(color, BG);

        function preserveOriginalContrast() {
            while (chroma.contrast(color, variantBG) > originalContrast) {
                color = chroma(color).brighten(resolution).css();
            }
            return color;
        }

        function getDarker() {
            while (chroma.contrast(color, variantBG) < ratioTarget) {
                color = chroma(color).darken(resolution).css();
            }
            return color;
        }

        // Replace Dracula Foreground w/ Background (#F8F8F2 -> #282A36)
        if (color === FG) {
            return BG;
        }

        if (anyBG.includes(color)) {
            return FG;
        }

        if (originalContrast < 4.5) {
            return preserveOriginalContrast();
        }

        return getDarker();
    });

    return yamlVariant;
}

export default loadTheme;
