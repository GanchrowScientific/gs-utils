declare module 'bufferpack' {
  export function unpack(packFormat: string, data: string|Buffer): number[];
  export function pack(packFormat: string, values: any[]): Buffer;
}
