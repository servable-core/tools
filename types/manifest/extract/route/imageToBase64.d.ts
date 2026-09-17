declare function _default(props: {
    path: string;
    input: Buffer | string;
    width: number;
    height: number;
    maxWidth: number;
    maxHeight: number;
    quality: number;
    mimeType: string;
}): Promise<{
    base64: any;
}>;
export default _default;
