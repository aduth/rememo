/*
 * Entry for the browser-ready IIFE builds, where the sole default export
 * keeps assigning the factory itself to the global scope (`window.rememo`)
 * rather than a `{ createSelector }` namespace object.
 */
export { createSelector as default } from './rememo';
