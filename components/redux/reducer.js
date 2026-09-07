import { CLEAR_CART, REMOVE_CART_ITEM, SET_CART } from './action';

const initialState = {
	items: [],
};

const cartReducer = (state = initialState, action) => {
	switch (action.type) {
		case SET_CART:
			return { ...state, items: action.payload || [] };
		case REMOVE_CART_ITEM:
			return {
				...state,
				items: state.items.filter(item => item.id !== action.payload),
			};
		case CLEAR_CART:
			return { ...state, items: [] };
		default:
			return state;
	}
};

export default cartReducer;
