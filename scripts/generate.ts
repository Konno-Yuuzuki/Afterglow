/**
 * 生成json
 */

import chroma, { Color, contrast } from 'chroma-js';
import { CustomConfig, ThemeType } from './type';
import loadToJSON from './yaml';

export interface GenerateOptions {
    name: string;
    ratioTarget?: number;
    resolution?: number;
    backgroundColor?: string;
}

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
     * 主背景色
     */
    private BG: string = '';
    /**
     * 主前景色
     */
    private FG: string = '';
    /**
     * 其他背景色
     */
    private otherBG: string[] = [];
    /**
     * 所有背景色
     */
    private anyBG: string[] = [];
    private originalBG: string = '';
    private originalFG: string = '';
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
        this.BG = this.anyColor['&BG'] = this.originalFG;
        this.FG = this.anyColor['&FG'] = this.originalBG;
        this.otherBG = this.json.dracula.other;
        this.anyBG = [this.BG, ...this.otherBG];
    }

    setOption(options: GenerateOptions = defaultOptions) {
        const { name, ratioTarget, resolution, backgroundColor } = options;
        if (name) {
            this.name = name;
        }
        if (ratioTarget) {
            // console.assert(ratioTarget >= this.minimumContrast, '对比度不能小于4.5');
            this.ratioTarget = ratioTarget;
        }
        if (resolution) {
            this.resolution = resolution;
        }
        if (backgroundColor) {
            this.BG = this.anyColor['&BG'] = backgroundColor;
        }
        return this;
    }

    rename(themeJSON: ThemeType) {
        const renameTheme = themeJSON;
        renameTheme.name = this.name;
        return renameTheme;
    }

    custom(theme: ThemeType, customConfig: CustomConfig) {
        let customTheme = theme;
        const { colors, tokenColors, ...others } = customConfig;
        if (colors) {
            Object.keys(colors).forEach((key) => {
                const value = colors[key];
                if (/^&\w{1,}$/.test(value)) {
                    Reflect.set(colors, key, this.anyColor[key] || null);
                } else if (!this.hexReg.test(value)) {
                    Reflect.set(colors, key, null);
                }
            });
            const customColors = { ...theme.colors, ...colors };
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
        return brightColor.toString();
    }

    private getDarkenColor(color: string) {
        let darkenColor = color;
        while (contrast(darkenColor, this.FG) < this.ratioTarget) {
            darkenColor = chroma(darkenColor).darken(this.resolution).hex();
        }
        return darkenColor;
    }

    theme(customConfig: CustomConfig) {
        const themeStr = this.yaml.replace(
            new RegExp(this.hexReg, 'gi'),
            (color) => {
                const originalColor = color;
                const originalContrast = contrast(color, this.originalBG);

                // 主背景色和主前景色互换 (#F8F8F2 -> #282A36)
                if (color === this.originalBG) {
                    return this.BG;
                }

                // 将其他的背景色统一换成主前景色
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
