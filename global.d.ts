// lucide (PEAKUB DX initiative): a small handful of files in this package (mostly
// `src/domain/servable/parse/utils/` and `src/schema/build/buildProtocol/`) reference the
// runtime-global `Servable` object that `@servable/server` sets up (`global.Servable = new
// ServableClass()`) - this package is a dependency OF `@servable/server`, not the other way
// around, so it can't import that package's own (more precise) ambient declaration without an
// upside-down dependency. `any` here is a deliberate, honest ceiling: `@servable/server`'s own
// `global.d.ts` is the real source of truth for what `Servable` actually looks like at runtime.
declare global {
  // eslint-disable-next-line no-var
  var Servable: any
}

export {}
