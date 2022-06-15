import { ThemeType } from '../interface';

interface ColorObj {
    [key: string]: string;
}

/**
 * 基本颜色
 */
export default class Colors {
    protected originalFG: string = '';
    protected originalBG: string = '';
    protected BG: string = '';
    protected FG: string = '';
    protected otherBG: string[] = [];
    protected allColors: ColorObj = {};
    /**
     * 正则表达式：匹配yaml文件中的颜色和其别名
     */
    private readonly colorReg = /(&\w{1,})\s+'(#[0-9A-F]{3,})'/;

    constructor(protected json: ThemeType, protected yaml: string) {
        this.getBaseColor();
        this.getAnyColor();
    }

    /**
     * 获取配置基本颜色
     */
    getBaseColor() {
        // 获取主题主背景色和主前景色
        this.originalBG = this.json.dracula.base[0]; // &BG
        this.originalFG = this.json.dracula.base[1]; // &FG

        // 主前景色和主背景色互换
        this.BG = this.originalFG;
        this.FG = this.originalBG;

        // 获取其他的背景颜色配置
        const otherBG = this.json.dracula.other.slice(3);
        this.otherBG = [this.originalBG, ...otherBG];
    }

    /**
     * 提取出yaml文件中 dracula 下的所有颜色配置
     * 并已键值对的形式保存
     */
    getAnyColor() {
        // 不区分大小写全局匹配
        const matchArray = this.yaml.match(new RegExp(this.colorReg, 'gi'));

        if (matchArray) {
            this.allColors = matchArray.reduce<ColorObj>((colorObj, item) => {
                const [key, value] = item
                    .replace(this.colorReg, '$1,$2')
                    .split(',');
                colorObj[key] = value;
                return colorObj;
            }, {} as ColorObj);
        }
    }
}
