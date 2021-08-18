/**
 * 生成json
 */

interface Options {
    name: string;
    ratioTarget: number;
    resolution: number;
}

const defaultOptions: Options = {
    name: 'Afterglow',
    ratioTarget: 4.5,
    resolution: 0.001,
};

export default class Generate {
    private name: string = 'Afterglow';

    private ratioTarget: number = 4.5;

    private resolution: number = 0.001;

    /** 读取配置文件的字符串内容 */
    private yaml: string;

    /** 读取文件后转的json内容 */
    private json: Record<string, any>;

    private hexReg = /#[0-9A-F]${3,}/gi;

    /** 背景色 */
    private BG: string = '';

    constructor(yaml: string, json: Record<string, any>) {
        this.yaml = yaml;
        this.json = json;
    }

    private getBg() {}

    setOption(options: Options = defaultOptions) {
        const { name, ratioTarget, resolution } = options;
        this.name = name;
        this.ratioTarget = ratioTarget;
        this.resolution = resolution;
        return this;
    }
}
