import { ADD_RECENT_SEARCH, CLEAR_RECENT_SEARCHES } from './action';

const initialState = {
	recentSearches: [],
};

const searchReducer = (state = initialState, action) => {
	switch (action.type) {
		case ADD_RECENT_SEARCH: {
			const search = action.payload.trim();

			if (!search) {
				return state;
			}

			const previousSearches = state.recentSearches.filter(
				item => item.toLowerCase() !== search.toLowerCase()
			);

			return {
				...state,
				recentSearches: [search, ...previousSearches].slice(0, 5),
			};
		}
		case CLEAR_RECENT_SEARCHES:
			return { ...state, recentSearches: [] };
		default:
			return state;
	}
};

export default searchReducer;
