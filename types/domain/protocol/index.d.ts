export default class Protocol {
    constructor(props: any);
    _id: any;
    _type: any;
    _instances: any[];
    _extractionStatus: number;
    addInstanceIfNeeded({ protocolPayload, servableConfig, instancesPathId }: {
        protocolPayload: any;
        servableConfig: any;
        instancesPathId: any;
    }): Promise<any>;
    set instances(value: any[]);
    get instances(): any[];
    instancesClassesPayloads(): {
        protocolPayload: any;
        instancesPathId: any;
        instancesPathIdString: any;
        instance: any;
    }[];
    set mainInstance(value: any);
    get mainInstance(): any;
    set version(value: any);
    get version(): any;
    set params(value: any);
    get params(): any;
    set loader(value: any);
    get loader(): any;
    set extractionStatus(value: number);
    get extractionStatus(): number;
    set schema(value: any);
    get schema(): any;
    set id(value: any);
    get id(): any;
}
