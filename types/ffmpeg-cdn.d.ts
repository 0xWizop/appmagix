declare module "https://esm.sh/@ffmpeg/ffmpeg@0.12.6" {
  export const FFmpeg: new () => {
    load: () => Promise<void>;
    exec: (args: string[]) => Promise<void>;
    writeFile: (path: string, data: Uint8Array) => Promise<void>;
    readFile: (path: string) => Promise<Uint8Array | string>;
    on: (event: string, cb: (e: { progress?: number }) => void) => void;
  };
}
declare module "https://esm.sh/@ffmpeg/util@0.12.1" {
  export const fetchFile: (file: File | Blob) => Promise<Uint8Array>;
}
