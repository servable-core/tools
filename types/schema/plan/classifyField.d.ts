declare function _default({ before, after }: {
    before: any;
    after: any;
}): {
    kind: string;
    safe: boolean;
    deprecated?: undefined;
    from?: undefined;
    to?: undefined;
} | {
    kind: string;
    safe: boolean;
    deprecated: boolean;
    from?: undefined;
    to?: undefined;
} | {
    kind: string;
    safe: boolean;
    from: any;
    to: any;
    deprecated?: undefined;
};
export default _default;
