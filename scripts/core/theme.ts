import chroma, { Color, contrast } from 'chroma-js';
import { CustomConfig, GenerateOptions, ThemeType } from '../interface';
import loadToJSON from '../yaml/yaml';
import Colors from './baseColor';

const defaultOptions: GenerateOptions = {
    name: 'Afterglow',
    contrast: 4.5,
    resolution: 0.001,
};

/**
 * 最小对比度
 */
const minimumContrast = 4.5;

export default class Theme extends Colors {
    private readonly hexReg = /#[0-9A-F]{3,}/;
    name: string = '';
    contrast: number = 4.5;
    /**
     * 每次补正增加的幅度
     */
    resolution: number = 0.001;
    constructor(public yaml: string, json: ThemeType) {
        super(json, yaml);
    }

    /**
     * 调整yaml文件中的颜色配置
     */
    theme(customConfig?: CustomConfig) {
        const themeStr = this.yaml.replace(
            new RegExp(this.hexReg, 'gi'),
            (color) => {
                const originalColor = color;
                const originalContrast = contrast(color, this.originalBG);
                const currentContrast = contrast(color, this.BG);

                // 原前景色 换成 当前前景色 (#F8F8F2 -> #282A36)
                if (color === this.originalFG) {
                    return this.FG;
                }

                // 将原其他的背景色 统一换成 当前背景色
                if (this.otherBG.includes(color)) {
                    // return this.switchOtherBG(color);
                    return this.BG;
                }

                if (
                    currentContrast < minimumContrast ||
                    currentContrast < originalContrast
                ) {
                    // 颜色接近，不适合阅读
                    // 获取小于默认的对比度
                    return this.getDarkenColor(originalColor);
                }

                // 大于默认对比度
                return this.getBrightenColor(color, originalContrast);
            },
        );

        const theme = this.rename(loadToJSON<ThemeType>(themeStr));
        if (customConfig) {
            return this.custom(theme, customConfig);
        }
        return theme;
    }

    /**
     * 获取更深的颜色
     */
    private getBrightenColor(color: string, targetContrast: number) {
        let darkenColor: Color = chroma(color);
        while (contrast(darkenColor, this.BG) > targetContrast) {
            // 这里只需要修正成原来的对比度就可以了
            darkenColor = darkenColor.brighten(this.resolution);
        }
        return darkenColor.hex();
    }

    /**
     * 获取颜色更浅的颜色
     *
     */
    private getDarkenColor(color: string) {
        let brightColor: Color = chroma(color);
        while (contrast(brightColor, this.BG) < this.contrast) {
            // 这里用自定义的对比度来进行判断，防止原始对比度过高，造成部分颜色过暗
            brightColor = brightColor.darken(this.resolution);
        }
        return brightColor.hex();
    }

    /**
     * 调整其他的背景色
     */
    private switchOtherBG(color: string) {
        // 找出配置文件中改颜色对用的tag
        const colorLabel = Object.keys(this.allColors).find((key) => {
            return this.allColors[key] === color;
        });

        if (!colorLabel) {
            // 没有找到颜色配置，返回默认的背景色
            return this.BG;
        }

        // 与原背景色的对比度
        const originContrast = contrast(this.originalBG, color);

        // 目标颜色
        let targetColor = chroma(this.BG);
        // 当前对比度
        let currentContrast = 1;
        // !这里必须使用原本配色的对比度
        while (currentContrast < originContrast) {
            targetColor = targetColor.darken(this.resolution);
            currentContrast = contrast(targetColor, this.BG);
        }

        return targetColor.hex();
    }

    /**
     * 对生成的新主题配色进行命名
     */
    private rename(themeJSON: ThemeType) {
        const renameTheme = themeJSON;
        renameTheme.name = this.name;
        return renameTheme;
    }

    /**
     * 对生成的新主题配置添加自定义配置
     */
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
                    Reflect.set(colorClone, key, this.allColors[key] || null);
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

    /**
     * 设置主题配置
     */
    setOption(options: GenerateOptions = defaultOptions) {
        let { name, contrast = 4.5, resolution, backgroundColor } = options;

        console.assert(name, '主题名称不能为空');
        this.name = name;

        console.assert(
            contrast >= minimumContrast,
            `对比度不能小于${minimumContrast}`,
        );
        this.contrast = contrast;

        this.resolution &&= resolution ||= this.resolution;
        console.assert(
            this.hexReg.test((backgroundColor || this.BG).toUpperCase()),
            '背景色设置错误',
        );
        this.BG = backgroundColor ? backgroundColor : this.BG;

        return this;
    }
}
