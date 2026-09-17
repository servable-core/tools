/**
 * Generates one TypeScript interface per class in a `servable.schema.json` artifact, each
 * field typed from its Parse field type (`Pointer`/`Relation` narrowed to the target class
 * when that class is also present in the artifact).
 *
 * @param {{ classes: Array<{ className: string, fields: Record<string, { type: string, targetClass?: string }> }> }} artifact
 *   - a normalized `servable.schema.json` (or anything with the same `classes` shape).
 * @returns {string} the full `.d.ts` file contents.
 */
export default function generateSchemaTypes(artifact: {
    classes: Array<{
        className: string;
        fields: Record<string, {
            type: string;
            targetClass?: string;
        }>;
    }>;
}): string;
