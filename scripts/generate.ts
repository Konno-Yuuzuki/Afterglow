/**
 * 生成json
 */

import chroma, { Color, contrast } from 'chroma-js';
import { CustomConfig, GenerateOptions, ThemeType } from './type';
import loadToJSON from './yaml';

const defaultOptions: GenerateOptions = {
    name: 'Afterglow',
    ratioTarget: 4.5,
    resolution: 0.001,
};

export default class Generate {
    name: string = '';
    /**
     * 最小比例
     */
    private minimumContrast: number = 4.5;

    /**
     * 目标比例
     */
    private ratioTarget: number = 4.5;

    private resolution: number = 0.001;

    /** 读取配置文件的字符串内容 */
    private yaml: string;

    /** 读取文件后转的json内容 */
    private json: ThemeType;

    private hexReg = /#[0-9A-F]{3,}/;

    /**
     * 原背景色
     */
    private originalBG: string = '';
    /**
     * 原前景色
     */
    private originalFG: string = '';
    /**
     * 当前背景色
     */
    private BG: string = '';
    /**
     * 当前前景色
     */
    private FG: string = '';
    /**
     * 所有背景色
     */
    private anyBG: string[] = [];
    private anyColor: Record<string, string> = {};

    constructor(yaml: string, json: ThemeType) {
        this.yaml = yaml;
        this.json = json;
        this.getAnyColor();
        this.getBaseColors();
    }

    private getAnyColor() {
        const colorReg = /(&\w{1,})\s+'(#[0-9A-F]{3,})'/;
        const matchArray = this.yaml.match(new RegExp(colorReg, 'gi'));
        const anyColor: Record<string, string> = {};
        if (matchArray) {
            matchArray.forEach((item) => {
                const [key, value] = item.replace(colorReg, '$1,$2').split(',');
                Reflect.set(anyColor, key, value);
            });
            this.anyColor = anyColor;
        }
    }

    private getBaseColors() {
        this.originalBG = this.json.dracula.base[0];
        this.originalFG = this.json.dracula.base[1];
        this.BG = this.originalFG;
        this.FG = this.originalBG;
        const otherBG = this.json.dracula.other.slice(3);
        this.anyBG = [this.originalBG, ...otherBG];
    }

    setOption(options: GenerateOptions = defaultOptions) {
        const { name, ratioTarget, resolution, backgroundColor } = options;
        if (name) {
            this.name = name;
        }
        if (ratioTarget) {
            console.assert(
                ratioTarget >= this.minimumContrast,
                '对比度不能小于4.5',
            );
            this.ratioTarget = ratioTarget;
        }
        if (resolution) {
            this.resolution = resolution;
        }
        if (backgroundColor) {
            console.assert(
                this.hexReg.test(backgroundColor.toUpperCase()),
                '颜色设置错误',
            );
            this.BG = backgroundColor;
        }
        return this;
    }

    private rename(themeJSON: ThemeType) {
        const renameTheme = themeJSON;
        renameTheme.name = this.name;
        return renameTheme;
    }

    private custom(theme: ThemeType, customConfig: CustomConfig) {
        let customTheme = theme;
        const { colors, tokenColors, ...others } = customConfig;
        if (colors) {
            const colorClone = { ...colors };
            Object.keys({ ...colorClone }).forEach((key) => {
                const value = colorClone[key];
                if (!value) {
                    Reflect.set(colorClone, key, null);
                } else if (/^&\w{1,}$/.test(value)) {
                    Reflect.set(colorClone, key, this.anyColor[key] || null);
                } else if (!this.hexReg.test(value.toUpperCase())) {
                    Reflect.set(colorClone, key, null);
                }
            });
            const customColors = { ...theme.colors, ...colorClone };
            customTheme = { ...theme, colors: customColors };
        }
        Object.keys(customTheme.colors).forEach((key) => {
            if (!customTheme.colors[key]) {
                delete customTheme.colors[key];
            }
        });
        return { ...customTheme, ...others };
    }

    private getBrightenColor(color: string, originalContrast: number) {
        let brightColor: Color = chroma(color);
        while (contrast(brightColor, this.BG) > originalContrast) {
            brightColor = brightColor.brighten(this.resolution);
        }
        return brightColor as unknown as string;
    }

    private getDarkenColor(color: string) {
        let darkenColor: Color = chroma(color);
        while (contrast(darkenColor, this.BG) < this.ratioTarget) {
            darkenColor = darkenColor.darken(this.resolution);
        }
        return darkenColor as unknown as string;
    }

    theme(customConfig?: CustomConfig) {
        const themeStr = this.yaml.replace(
            new RegExp(this.hexReg, 'gi'),
            (color) => {
                const originalColor = color;
                const originalContrast = contrast(color, this.originalBG);

                // 原前景色 换成 当前前景色 (#F8F8F2 -> #282A36)
                if (color === this.originalFG) {
                    return this.FG;
                }

                // 将原其他的背景色 统一换成 当前背景色
                if (this.anyBG.includes(color)) {
                    return this.BG;
                }

                if (originalContrast < this.minimumContrast) {
                    // 颜色接近，不适合阅读
                    return this.getBrightenColor(
                        originalColor,
                        originalContrast,
                    );
                }

                return this.getDarkenColor(color);
            },
        );

        const theme = this.rename(loadToJSON<ThemeType>(themeStr));
        if (customConfig) {
            return this.custom(theme, customConfig);
        }
        return theme;
    }
}
