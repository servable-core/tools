declare function _default({ protocol }: {
    protocol: any;
}): Promise<{
    highestVersion?: undefined;
    lowestCompatibleVersion?: undefined;
    lowestVersion?: undefined;
} | {
    highestVersion: {
        value: string;
    };
    lowestCompatibleVersion: {
        value: string;
    };
    lowestVersion: {
        value: string;
    };
}>;
export default _default;
