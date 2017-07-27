#### v1.3.0 (---)

- New Feature: `createSelector` accepts an optional third argument to specify options, currently supporting `maxSize` (defaulting to `Infinity`)
- Internal: Cache lookup and max size use an LRU (least recently used) policy to bias recent access, improving efficiency on subsequent calls with same arguments

#### v1.2.0 (2017-07-24)

- Internal: Drop moize dependency in favor of home-grown memoization solution, significantly reducing bundled size (10.2kb -> 0.5kb minified, 3.0kb -> 0.3kb minified + gzipped)
- Internal: Add package-lock.json

#### v1.1.1 (2017-06-13)

- Fix: Resolve an error in environments not supporting Promise, caused by
defaults behavior in the underlying memoization library.

#### v1.1.0 (2017-06-08)

- Improved: Object target is ignored in generating memoized function cache key.
This can resolve issues where cache would be discarded if dependant references
were the same but the target object reference changed.

#### v1.0.2 (2017-05-29)

- Fix: Include dist in npm package (for unpkg availability)

#### v1.0.0 (2017-05-27)

- Initial release
