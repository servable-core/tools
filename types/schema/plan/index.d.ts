export function plan({ before, after }: {
    before: any;
    after: any;
}): {
    hashChanged: boolean;
    safe: any[];
    breaking: any[];
    breakingDeprecated: any[];
    hasBreakingChanges: boolean;
};
export default plan;
