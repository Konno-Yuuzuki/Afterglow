interface BaseColors {
    BG: string;
    FG: string;
    SELECTION: string;
    COMMENT: string;
    CYAN: string;
    GREEN: string;
    ORANGE: string;
    PINK: string;
    PURPLE: string;
    RED: string;
    YELLOW: string;
}

interface AnsiColors {
    COLOR0: string;
    COLOR1: string;
    COLOR2: string;
    COLOR3: string;
    COLOR4: string;
    COLOR5: string;
    COLOR6: string;
    COLOR7: string;
    COLOR8: string;
    COLOR9: string;
    COLOR10: string;
    COLOR11: string;
    COLOR12: string;
    COLOR13: string;
    COLOR14: string;
    COLOR15: string;
}

interface BrightOtherColors {
    TEMP_QUOTES: string;
    TEMP_PROPERTY_QUOTES: string;
}

interface OtherColors {
    LineHighlight: string;
    NonText: string;
    WHITE: string;
    TAB_DROP_BG: string;
    BGLighter: string;
    BGLight: string;
    BGDark: string;
    BGDarker: string;
}

interface Dracula {
    base: string[];
    ansi: string[];
    brightOther: string[];
    other: string[];
}

export interface ThemeType {
    $schema: string;
    name: string;
    author: string;
    maintainers: string[];
    semanticClass: string;
    semanticHighlighting: string;
    dracula: Dracula;
    colors: Record<string, string>;
}
