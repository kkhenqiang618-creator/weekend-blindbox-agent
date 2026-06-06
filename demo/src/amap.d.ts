// 高德地图 JS API 类型声明（最小化，仅覆盖本项目使用的方法）
export {};

declare global {
  interface Window {
    AMap?: typeof AMap;
  }
}

declare namespace AMap {
  class Map {
    constructor(container: HTMLElement, opts: { zoom?: number; center?: [number, number]; resizeEnable?: boolean });
    add(overlay: unknown): void;
    setFitView(overlays?: unknown, immediately?: boolean, avoid?: [number, number, number, number]): void;
    destroy(): void;
  }

  class Polyline {
    constructor(opts: {
      path: [number, number][];
      strokeColor?: string;
      strokeWeight?: number;
      strokeStyle?: string;
      strokeDasharray?: number[];
      lineJoin?: string;
      showDir?: boolean;
      dirColor?: string;
      dirNum?: number;
    });
  }

  class Marker {
    constructor(opts: {
      position: [number, number];
      content?: string;
      offset?: Pixel;
    });
  }

  class Pixel {
    constructor(x: number, y: number);
  }
}
