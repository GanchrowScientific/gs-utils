// Type definitions for ansi-256-colors 1.1.0
// Project: https://github.com/jbnicolai/ansi-256-colors
// Definitions by: David Gillies

declare module ANSI256Colors {
  interface foreground {
    codes: string[];
    standard: string[];
    bright: string[];
    rgb: string[];
    grayscale: string[];
    getRgb: Function;
  }
  interface background {
    codes: string[];
    standard: string[];
    bright: string[];
    rgb: string[];
    grayscale: string[];
    getRgb: Function;
  }
  export var fg: foreground;
  export var bg: background;
  export var reset: string;
}

declare module 'ansi-256-colors' {
  export = ANSI256Colors;
}
