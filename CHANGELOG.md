#### v1.2.0 (---)

- Internal: Upgrade moize dependency to 3.x
- Internal: Drop shallow-equal dependency (reuse home-grown solution for index-based shallow comparison in memoize arguments and selector dependants equality)

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
