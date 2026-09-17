export default class ProtocolLoaderV1_0_0 extends BaseClass {
    getClass({ className }: {
        className: any;
    }): Promise<any>;
    classFunctions({ className }: {
        className: any;
    }): Promise<any>;
    classTriggers({ className }: {
        className: any;
    }): Promise<any>;
    classTriggersMerged({ className }: {
        className: any;
    }): Promise<any>;
    classJobs({ className }: {
        className: any;
    }): Promise<any>;
    classSeedFolder({ className }: {
        className: any;
    }): string;
    classSeedMode(props: any): Promise<any>;
    classSeedManual(props: any): Promise<any>;
    classSeedMetadata(props: any): Promise<any>;
    classSeedAutoFiles(props: any): Promise<any>;
    classConfigFolder({ className }: {
        className: any;
    }): string;
    classConfigDataFiles({ className }: {
        className: any;
    }): Promise<any>;
    classProtocols({ className, withProtocolsProtocols }: {
        className: any;
        withProtocolsProtocols?: boolean;
    }): Promise<any>;
    afterInit(): Promise<any>;
    beforeInit(): Promise<any>;
    beforeEnd(): Promise<any>;
    configFolder(): string;
    configDataFiles(): Promise<any>;
    seedFolder(): string;
    seedMode(): Promise<any>;
    seedManual(): Promise<any>;
    seedMetadata(): Promise<any>;
    triggers(): Promise<any>;
    triggersMerged(): Promise<any>;
    triggersMetadata(): Promise<any>;
    classesSchemas(props: any): Promise<any>;
    schemaFields(props: any): Promise<any>;
    schemaIndexes(props: any): Promise<any>;
    schemaRaw(props?: {}): Promise<any>;
    schemaClassLevelPermissions(props: any): Promise<any>;
    ownProtocols(): Promise<any>;
    ownProtocolsClass(): Promise<any>;
    liveClasses(): Promise<any>;
    systemDockerCompose(): Promise<any>;
    systemDockerComposeExists(): Promise<boolean>;
    systemDockerComposePath(): string;
    systemDockerDataPath(): string;
    systemDockerComposeDirPath(): string;
    configDirPath_obs(): string;
    configData_obs(): Promise<any>;
    systemDockerPayloadAdapter(): Promise<any>;
    functions(): Promise<any>;
    services(): Promise<any>;
    routes(): Promise<{}>;
    liveQueries(): Promise<any[]>;
    jobFiles(): Promise<any>;
}
import BaseClass from './base.js';
