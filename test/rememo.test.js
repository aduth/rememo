import { beforeEach, describe, expect, it, vi } from 'vitest';
import createSelectorDefault, { createSelector } from '../src/rememo';

describe('createSelector', () => {
	it('is exposed as both the default and a named export', () => {
		expect(createSelectorDefault).toBe(createSelector);
	});

	let getTasksByCompletion;

	const selector = vi.fn((state, isComplete = false, extra) =>
		state.todo
			.filter((task) => task.complete === isComplete)
			.concat(extra || [])
	);

	const getDependants = vi.fn((state) => [state.todo]);

	const getState = () => ({
		todo: [
			{ text: 'Go to the gym', complete: true },
			{ text: 'Try to spend time in the sunlight', complete: false },
			{ text: 'Laundry must be done', complete: true },
		],
	});

	beforeEach(() => {
		vi.clearAllMocks();
		getTasksByCompletion = createSelector(selector, getDependants);
	});

	it('exposes cache clearing method', () => {
		expect(typeof getTasksByCompletion.clear).toBe('function');
	});

	it('returns the correct value', () => {
		const state = getState();
		const completed = getTasksByCompletion(state, true);

		expect(completed).toEqual(selector(state, true));
	});

	it('caches return value', () => {
		const state = getState();
		let completed;
		completed = getTasksByCompletion(state, true);
		completed = getTasksByCompletion(state, true);

		expect(selector).toHaveBeenCalledTimes(1);
		expect(completed).toEqual(selector(state, true));
	});

	it('caches return value for non-primitive args by reference', () => {
		const state = getState();
		let completed;
		const obj = {};
		completed = getTasksByCompletion(state, true, obj);
		obj.mutated = true;
		completed = getTasksByCompletion(state, true, obj);

		expect(selector).toHaveBeenCalledTimes(1);
		expect(completed).toEqual(selector(state, true, obj));
	});

	it('defaults to caching on entire state object', () => {
		const getTasksByCompletionOnState = createSelector(selector);
		let state = getState();
		let completed;
		completed = getTasksByCompletionOnState(state, true);
		completed = getTasksByCompletionOnState(state, true);
		state = getState();
		completed = getTasksByCompletionOnState(state, true);

		expect(selector).toHaveBeenCalledTimes(2);
		expect(completed).toEqual(selector(state, true));
	});

	it('returns cached value on superfluous arguments', () => {
		const state = getState();
		let completed;
		completed = getTasksByCompletion(state, true, true);
		completed = getTasksByCompletion(state, true, true);

		expect(selector).toHaveBeenCalledTimes(1);
		expect(completed).toEqual(selector(state, true, true));
	});

	it('returns the correct value of differing arguments', () => {
		const state = getState();
		const completed = getTasksByCompletion(state, true);
		const uncompleted = getTasksByCompletion(state, false);

		expect(selector).toHaveBeenCalledTimes(2);
		expect(completed).toEqual(selector(state, true));
		expect(uncompleted).toEqual(selector(state, false));
	});

	it('clears cache when state reference changes', () => {
		let state = getState();
		let completed = getTasksByCompletion(state, true);
		state = getState();
		completed = getTasksByCompletion(state, true);

		expect(selector).toHaveBeenCalledTimes(2);
		expect(completed).toEqual(selector(state, true));
	});

	it('clears cache when primitive dependant changes', () => {
		const getTasksByCompletionOnCount = createSelector(selector, (state) => [
			state.ok,
		]);
		const state = getState();
		state.ok = false;
		let completed = getTasksByCompletionOnCount(state, true);
		state.ok = true;
		completed = getTasksByCompletionOnCount(state, true);

		expect(selector).toHaveBeenCalledTimes(2);
		expect(completed).toEqual(selector(state, true));
	});

	it('clears cache when non-primitive argument reference changes', () => {
		const state = getState();
		let completed;
		let obj;
		obj = {};
		completed = getTasksByCompletion(state, true, obj);
		obj = {};
		completed = getTasksByCompletion(state, true, obj);

		expect(selector).toHaveBeenCalledTimes(2);
		expect(completed).toEqual(selector(state, true, obj));
	});

	it('returns cache even if target object has changed reference', () => {
		let state = getState();
		let completed;
		completed = getTasksByCompletion(state, true);
		state = Object.assign({}, state, { other: true });
		completed = getTasksByCompletion(state, true);

		expect(selector).toHaveBeenCalledTimes(1);
		expect(completed).toEqual(selector(state, true));
	});

	it('deep caches on object dependants', () => {
		const stateByDate = {
			todos: {
				'2018-01-01': [
					{ text: 'Go to the gym', complete: true },
					{ text: 'Try to spend time in the sunlight', complete: true },
				],
				'2018-01-02': [{ text: 'Laundry must be done', complete: false }],
			},
		};

		const selectorByDate = vi.fn((state, date, isComplete = false) =>
			state.todos[date].filter((task) => task.complete === isComplete)
		);

		const getTasksByCompletionByDate = createSelector(
			selectorByDate,
			(state, date) => state.todos[date]
		);

		getTasksByCompletionByDate(stateByDate, '2018-01-01');
		expect(selectorByDate).toHaveBeenCalledTimes(1);

		getTasksByCompletionByDate(stateByDate, '2018-01-02');
		expect(selectorByDate).toHaveBeenCalledTimes(2);

		getTasksByCompletionByDate(stateByDate, '2018-01-01');
		expect(selectorByDate).toHaveBeenCalledTimes(2);

		getTasksByCompletionByDate(stateByDate, '2018-01-02');
		expect(selectorByDate).toHaveBeenCalledTimes(2);
	});

	it('ensures equal argument length before returning cache', () => {
		const state = getState();
		let completed;
		completed = getTasksByCompletion(state, true);
		completed = getTasksByCompletion(state);

		expect(selector).toHaveBeenCalledTimes(2);
		expect(completed).toEqual(selector(state));
	});

	it('exposes dependants getter', () => {
		const todo = [];
		const state = { todo };

		const dependants = getTasksByCompletion.getDependants(state, true);

		expect(Array.isArray(dependants)).toBe(true);
		expect(dependants.length).toBe(1);
		expect(dependants[0]).toBe(todo);
		expect(getDependants).toHaveBeenCalledWith(state, true);
	});
});
