export function normalizeArtifact({ appProtocol, protocols }: {
    appProtocol: any;
    protocols: any;
}): {
    artifactVersion: number;
    generatedAt: string;
    hash: string;
    classes: any;
    protocolVersions: any[];
};
export function compileArtifact({ servableConfig }: {
    servableConfig: any;
}): Promise<{
    artifactVersion: number;
    generatedAt: string;
    hash: string;
    classes: any;
    protocolVersions: any[];
}>;
export function hashOf(artifact: any): string;
export default compileArtifact;
