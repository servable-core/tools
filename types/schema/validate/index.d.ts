declare function _default({ schema, }: {
    schema: any;
}): Promise<{
    isValid: boolean;
    issues: {
        comparison: {
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
        };
        message: string;
    }[];
} | {
    isValid: boolean;
}>;
export default _default;
