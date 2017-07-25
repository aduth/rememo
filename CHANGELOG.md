#### v1.2.0 (---)

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
