declare function _default(props: any): Promise<{
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
