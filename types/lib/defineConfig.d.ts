/**
 * @typedef {object} ServableDockerConfig
 * @property {boolean} [enabled] - whether local docker-compose orchestration runs at all.
 *   Defaults to `true`.
 * @property {string[]} [environments] - which `NODE_ENV` values this applies to. Defaults
 *   to `['development']`.
 * @property {string} [namespace] - isolates this worktree's docker-compose stack (project
 *   name and any explicit `container_name`) from another worktree of the same app running
 *   at the same time. Unset (the default) is a complete no-op.
 */
/**
 * @typedef {object} ServableSystemConfig
 * @property {ServableDockerConfig} [docker]
 */
/**
 * @typedef {object} ServableCorsConfig
 * @property {string[]} [allowedOrigins] - static allow-list.
 * @property {(hostname: string) => boolean} [isOriginAllowed] - dynamic check, e.g. for a
 *   custom-domains feature backed by a verified-domains store. Runs in addition to
 *   `allowedOrigins`, not instead of it.
 */
/**
 * Passed almost as-is to the underlying Parse Server instance - see that engine's own
 * `doLaunch()` for the full set of keys it actually reads (`mongoOptions`, `auth`,
 * `sessionLength`, `masterKeyIps`, etc). Only the ones every app is likely to set are
 * named below; the `Record<string, any>` intersection keeps any other Parse Server option
 * from being rejected.
 *
 * @typedef {{
 *   sessionLength?: number,
 *   masterKeyIps?: string[],
 *   auth?: object,
 * } & Record<string, any>} ServableParseConfig
 */
/**
 * @typedef {object} ServableAppConfig
 * @property {ServableCorsConfig} [cors]
 * @property {ServableParseConfig} [parse]
 */
/**
 * @typedef {object} ServableConfiguration
 * @property {ServableAppConfig} [config]
 */
/**
 * @typedef {object} ServableDryRunConfig
 * @property {boolean} [enabled]
 * @property {string[]} [environments] - which `NODE_ENV` values dry-run applies to.
 * @property {{ users?: Array<{ email?: string, id?: string, phoneNumber?: string }> }} [exceptions] -
 *   accounts exempted from dry-run behavior even when it's on.
 */
/**
 * The shape `servable.config.js` exports as its default. Every field is optional -
 * `@servable/server`'s own `adaptConfig` fills in defaults for whatever's missing (see
 * `lib/adaptConfig/basic.js`) - this type exists purely for editor autocomplete on the file
 * an app author actually hand-writes, not as a runtime schema.
 *
 * @typedef {object} ServableConfig
 * @property {string} id - this app's identity (not a per-checkout/worktree identity -
 *   stays the same across worktrees of the same app).
 * @property {ServableSystemConfig} [system]
 * @property {ServableConfiguration} [configuration]
 * @property {ServableDryRunConfig} [dryRun]
 * @property {string[]} [protocols] - additional local protocol search paths, prepended to
 *   (not replacing) the framework's own bundled protocols and the app's own `protocols/`.
 */
/**
 * Identity helper for `servable.config.js` - returns `config` completely unchanged. Its
 * only purpose is to give the object literal a known type, the same pattern
 * Vite/Next.js/Docusaurus use their own `defineConfig()` for: wrap the export, get
 * autocomplete and inline docs on every field, no runtime behavior added.
 *
 * @example
 * // servable.config.js
 * import { defineConfig } from '@servable/tools'
 *
 * export default defineConfig({
 *   id: 'my-app',
 *   system: { docker: { namespace: 'my-epic' } },
 * })
 *
 * @param {ServableConfig} config
 * @returns {ServableConfig} the same `config`, unmodified.
 */
export default function defineConfig(config: ServableConfig): ServableConfig;
export type ServableDockerConfig = {
    /**
     * - whether local docker-compose orchestration runs at all.
     * Defaults to `true`.
     */
    enabled?: boolean;
    /**
     * - which `NODE_ENV` values this applies to. Defaults
     * to `['development']`.
     */
    environments?: string[];
    /**
     * - isolates this worktree's docker-compose stack (project
     * name and any explicit `container_name`) from another worktree of the same app running
     * at the same time. Unset (the default) is a complete no-op.
     */
    namespace?: string;
};
export type ServableSystemConfig = {
    docker?: ServableDockerConfig;
};
export type ServableCorsConfig = {
    /**
     * - static allow-list.
     */
    allowedOrigins?: string[];
    /**
     * - dynamic check, e.g. for a
     * custom-domains feature backed by a verified-domains store. Runs in addition to
     * `allowedOrigins`, not instead of it.
     */
    isOriginAllowed?: (hostname: string) => boolean;
};
/**
 * Passed almost as-is to the underlying Parse Server instance - see that engine's own
 * `doLaunch()` for the full set of keys it actually reads (`mongoOptions`, `auth`,
 * `sessionLength`, `masterKeyIps`, etc). Only the ones every app is likely to set are
 * named below; the `Record<string, any>` intersection keeps any other Parse Server option
 * from being rejected.
 */
export type ServableParseConfig = {
    sessionLength?: number;
    masterKeyIps?: string[];
    auth?: object;
} & Record<string, any>;
export type ServableAppConfig = {
    cors?: ServableCorsConfig;
    parse?: ServableParseConfig;
};
export type ServableConfiguration = {
    config?: ServableAppConfig;
};
export type ServableDryRunConfig = {
    enabled?: boolean;
    /**
     * - which `NODE_ENV` values dry-run applies to.
     */
    environments?: string[];
    /**
     * -
     * accounts exempted from dry-run behavior even when it's on.
     */
    exceptions?: {
        users?: Array<{
            email?: string;
            id?: string;
            phoneNumber?: string;
        }>;
    };
};
/**
 * The shape `servable.config.js` exports as its default. Every field is optional -
 * `@servable/server`'s own `adaptConfig` fills in defaults for whatever's missing (see
 * `lib/adaptConfig/basic.js`) - this type exists purely for editor autocomplete on the file
 * an app author actually hand-writes, not as a runtime schema.
 */
export type ServableConfig = {
    /**
     * - this app's identity (not a per-checkout/worktree identity -
     * stays the same across worktrees of the same app).
     */
    id: string;
    system?: ServableSystemConfig;
    configuration?: ServableConfiguration;
    dryRun?: ServableDryRunConfig;
    /**
     * - additional local protocol search paths, prepended to
     * (not replacing) the framework's own bundled protocols and the app's own `protocols/`.
     */
    protocols?: string[];
};
