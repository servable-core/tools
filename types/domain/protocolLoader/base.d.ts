export default class ProtocolLoader {
    constructor(props: any);
    _cache: {};
    _extraClasses: {};
    _extraction: any;
    _path: any;
    _protocolInstance: any;
    set path(value: any);
    get path(): any;
    set cache(value: {});
    get cache(): {};
    set extraction(value: any);
    get extraction(): any;
    set protocolInstance(value: any);
    get protocolInstance(): any;
    /**
     * @param {object} [props]
     * @param {object} [props.servableConfig] - currently unused by this base
     *   implementation; accepted for interface parity with the loader subclasses that do
     *   read it (e.g. version resolution).
     */
    loadExtraction({ servableConfig }?: {
        servableConfig?: object;
    }): Promise<void>;
    _accessManifestItem({ item }: {
        item: any;
    }): Promise<any>;
    isValid(): Promise<boolean>;
    getModule(): Promise<any>;
    /**
     * @param {object} props
     * @param {string} props.path
     * @param {string} [props.cacheKey] - most callers omit this. Note:
     *   `importJSDefault`/`importJSONDefault` currently accept `cache`/`cacheKey` but never
     *   read them - every call is a fresh dynamic `import()`, not actually cached. Caching
     *   in this class goes through the separate `_valueInCache`/`this.cache` mechanism
     *   instead (see e.g. `classFunctions()`).
     */
    _importJSDefault({ path, cacheKey }: {
        path: string;
        cacheKey?: string;
    }): Promise<any>;
    /** @param {object} props
     * @param {string} props.path
     * @param {string} [props.cacheKey] - see `_importJSDefault`'s note; unused today.
     */
    _importJSONDefault({ path, cacheKey }: {
        path: string;
        cacheKey?: string;
    }): Promise<any>;
    _valueInCache(value: any): any;
}
