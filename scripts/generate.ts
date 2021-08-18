/**
 * 生成json
 */

import chroma, { contrast } from 'chroma-js';
import { ThemeType } from './type';

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
    /**
     * 最小比例
     */
    minimumContrast: number = 4.5;

    private name: string = 'Afterglow';

    /**
     * 目标比例
     */
    private ratioTarget: number = 4.5;

    private resolution: number = 0.001;

    /** 读取配置文件的字符串内容 */
    private yaml: string;

    /** 读取文件后转的json内容 */
    private json: ThemeType;

    private hexReg = /#[0-9A-F]${3,}/gi;

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
    otherBG: string[] = [];
    /**
     * 所有背景色
     */
    anyBG: string[] = [];

    constructor(yaml: string, json: ThemeType) {
        this.yaml = yaml;
        this.json = json;
        this.getBaseColors();
    }

    private getBaseColors() {
        this.BG = this.json.dracula.base[0];
        this.FG = this.json.dracula.base[1];
        this.otherBG = this.json.dracula.other;
        this.anyBG = [this.BG, ...this.otherBG];
    }

    setOption(options: GenerateOptions = defaultOptions) {
        const { name, ratioTarget, resolution, backgroundColor } = options;
        this.name = name;
        if (ratioTarget) {
            this.ratioTarget = ratioTarget;
        }
        if (resolution) {
            this.resolution = resolution;
        }
        if (backgroundColor) {
            this.FG = backgroundColor;
        }
        return this;
    }

    private getBrightenColor(color: string, originalContrast: number) {
        let brightColor = color;
        while (contrast(brightColor, this.FG) > originalContrast) {
            brightColor = chroma(brightColor).brighten(this.resolution).css();
        }
        return brightColor;
    }

    private getDarkenColor(color: string) {
        let darkenColor = color;
        while (contrast(darkenColor, this.FG) < this.ratioTarget) {
            darkenColor = chroma(darkenColor).darken(this.resolution).css();
        }
        return darkenColor;
    }

    theme() {
        const theme = this.yaml.replace(this.hexReg, (color) => {
            const originalColor = color;
            const originalContrast = contrast(color, this.BG);

            // 主背景色和主前景色互换 (#F8F8F2 -> #282A36)
            if (color === this.FG) {
                return this.BG;
            }

            // 将其他的背景色统一换成主前景色
            if (this.anyBG.includes(color)) {
                return this.FG;
            }

            if (originalContrast < this.minimumContrast) {
                // 颜色接近，不适合阅读
                return this.getBrightenColor(originalColor, originalContrast);
            }

            return this.getDarkenColor(color);
        });
        return theme;
    }
}
