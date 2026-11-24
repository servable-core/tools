declare function _default({ path, dataTemplateType, shouldReadComments }: {
    path: string;
    dataTemplateType?: string;
    shouldReadComments?: boolean;
}): Promise<{
    reference: object;
    tree: object;
}>;
export default _default;
