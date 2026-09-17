export default class ProtocolInstance {
    constructor(props: any);
    _className: any;
    _params: {};
    _instancesPathId: any[];
    _instancesPathIdString: any;
    _loader: any;
    _version: string;
    _minimumCompatibleVersion: string;
    _loadState: number;
    _module: {};
    _path: any;
    _id: any;
    _protocolPayload: any;
    _schema: {
        classes: {
            managed: any[];
            all: any[];
        };
    };
    /**
     * @param {object} [props]
     * @param {object} [props.servableConfig] - used to resolve a pinned version for this
     *   protocol instance from `servableConfig.versions`, if present.
     */
    load({ servableConfig }?: {
        servableConfig?: object;
    }): Promise<void>;
    set loadState(value: number);
    get loadState(): number;
    set module(value: {});
    get module(): {};
    set version(value: string);
    get version(): string;
    set className(value: any);
    get className(): any;
    set params(value: {});
    get params(): {};
    set protocolPayload(value: any);
    get protocolPayload(): any;
    toString(): string;
    set instancesPathIdString(value: any);
    get instancesPathIdString(): any;
    set instancesPathId(value: any[]);
    get instancesPathId(): any[];
    set id(value: any);
    get id(): any;
    set path(value: any);
    get path(): any;
    set minimumCompatibleVersion(value: string);
    get minimumCompatibleVersion(): string;
    set loader(value: any);
    get loader(): any;
    set schema(value: {
        classes: {
            managed: any[];
            all: any[];
        };
    });
    get schema(): {
        classes: {
            managed: any[];
            all: any[];
        };
    };
    /**
     * @returns {Promise<object | null>} this protocol instance's raw `schema.json`
     *   contents, memoized by the loader.
     */
    schemaRaw(): Promise<object | null>;
}
