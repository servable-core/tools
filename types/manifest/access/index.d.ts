declare function _default({ path, variant, mimeType, item, type, formatData, extraction: _extraction }: {
    path?: string;
    variant?: string;
    mimeType?: string;
    item: string;
    type?: string;
    formatData?: boolean;
    extraction?: object;
}): Promise<object | null>;
export default _default;
