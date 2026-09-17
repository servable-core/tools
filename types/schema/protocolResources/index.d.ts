/**
 * @typedef {object} ProtocolResourceEntry
 * @property {string} id - the resource's own `id` field (services) or `id`/name (jobs).
 * @property {string} path - absolute path to the file that exports it, for `typeof import(...)`.
 * @property {string} [cron] - jobs only.
 */
/**
 * @typedef {object} ProtocolResources
 * @property {ProtocolResourceEntry[]} services
 * @property {ProtocolResourceEntry[]} jobs
 */
/**
 * Scans `services/` and `jobs/` for every protocol in `protocols`, keyed by protocol id.
 * Protocols with neither directory (or with directories that only contain malformed exports -
 * missing `id`, logged and skipped rather than thrown) are omitted from the result entirely.
 *
 * @param {object} props
 * @param {any[]} props.protocols - the `protocols` array `buildSchema()` already produced (each
 *   a `ProtocolInstance` with `.id` and `.loader.path`).
 * @returns {Promise<Record<string, ProtocolResources>>}
 */
export default function buildProtocolResources({ protocols }: {
    protocols: any[];
}): Promise<Record<string, ProtocolResources>>;
export type ProtocolResourceEntry = {
    /**
     * - the resource's own `id` field (services) or `id`/name (jobs).
     */
    id: string;
    /**
     * - absolute path to the file that exports it, for `typeof import(...)`.
     */
    path: string;
    /**
     * - jobs only.
     */
    cron?: string;
};
export type ProtocolResources = {
    services: ProtocolResourceEntry[];
    jobs: ProtocolResourceEntry[];
};
