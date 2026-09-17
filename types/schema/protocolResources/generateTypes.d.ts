/**
 * Generates a `.d.ts` that:
 *   - merges every discovered service into `ServableServiceCallMap` (sharpening
 *     `Servable.Services.call({ id, params })`'s `params`/return type for that `id`).
 *   - emits one `ServableProtocolJobs` interface per protocol, keyed by protocol id, listing its
 *     jobs for discoverability (no call-site typing - nothing invokes a job by id).
 *
 * @param {Record<string, import('./index.js').ProtocolResources>} resources - `buildProtocolResources()`'s output.
 * @returns {string} the full `.d.ts` file contents.
 */
export default function generateProtocolResourceTypes(resources: Record<string, import("./index.js").ProtocolResources>): string;
