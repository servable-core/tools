// A single field's before/after classification. `before`/`after` are each either undefined (the
// field doesn't exist on that side) or a field-definition object like { type, targetClass,
// required, deprecated }.
export default ({ before, after }) => {
  if (!before && after) {
    return { kind: 'added', safe: true }
  }

  if (before && !after) {
    // Removing a field is only ever safe to APPLY (not just to compute) when it was already
    // marked deprecated on the side being removed from - contract.js is the one command allowed
    // to act on that; plan always reports the removal, it just also says whether it was
    // pre-deprecated so the caller (CI gate, contract command) can tell the two cases apart.
    return {
      kind: 'removed',
      safe: false,
      deprecated: Boolean(before.deprecated),
    }
  }

  if (before.type !== after.type) {
    return { kind: 'typeChanged', safe: false, from: before.type, to: after.type }
  }

  if (before.type === 'Pointer' && before.targetClass !== after.targetClass) {
    return { kind: 'targetClassChanged', safe: false, from: before.targetClass, to: after.targetClass }
  }

  // A field newly becoming required is breaking for the same reason a dropped field is: an old
  // pod's already-written objects (or its own in-flight writes, built without knowing the field
  // is now mandatory) may not satisfy it. Required -> optional is the safe direction.
  if (!before.required && after.required) {
    return { kind: 'becameRequired', safe: false }
  }

  // A field newly marked deprecated is not a schema change at all from Parse's point of view -
  // it's a note for `contract` to read later - so it's SAFE on its own. It only becomes
  // consequential combined with an actual removal, handled above.
  if (Boolean(before.deprecated) !== Boolean(after.deprecated)) {
    return { kind: 'deprecationFlagChanged', safe: true }
  }

  return null
}
