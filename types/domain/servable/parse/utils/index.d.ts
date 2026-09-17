export function getOnePlain(props: any): Promise<any>;
export function formatQuery(props: any): void;
export function getOneGeneric({ objectId, className, include }?: {}): Promise<any>;
export function performBatchOnQuery({ query, batchSize, action }: {
    query: any;
    batchSize?: number;
    action: any;
}): Promise<void>;
export function performBatchOnQueryPerGroup({ query, batchSize, action }: {
    query: any;
    batchSize?: number;
    action: any;
}): Promise<void>;
export function fetchObjectIfNeeded({ object, className, forceFetch, includes, excludes, useMasterKey }?: {
    forceFetch?: boolean;
    includes?: any[];
    excludes?: any[];
    useMasterKey?: boolean;
}): Promise<any>;
export function fetchObject({ objectId, className, forceFetch, includes, excludes, useMasterKey }?: {
    includes?: any[];
    excludes?: any[];
    useMasterKey?: boolean;
}): Promise<any>;
export function destroyRowsWithQuery({ query, limitPerBatch }?: {}): Promise<void>;
export function destroyAllRowsWithQuery({ query, limitPerBatch }?: {
    limitPerBatch?: number;
}): any;
export function prepareRequestWithUser({ params, headers, user, fetchOptions }?: {
    fetchOptions?: {};
}): Promise<any>;
export function destroyItems({ object, keys }: {
    object: any;
    keys: any;
}): Promise<any[]>;
export function destroyItem(props: any): Promise<any>;
export function destroyItemsInArray(props: any): Promise<any[]>;
export function saveFileDataToFS({ file, path }: {
    file: any;
    path?: string;
}): Promise<string>;
