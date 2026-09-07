export const SET_CART = 'cart/setCart';
export const REMOVE_CART_ITEM = 'cart/removeCartItem';
export const CLEAR_CART = 'cart/clearCart';
export const ADD_RECENT_SEARCH = 'search/addRecentSearch';
export const CLEAR_RECENT_SEARCHES = 'search/clearRecentSearches';

export const setCart = items => ({
	type: SET_CART,
	payload: items,
});

export const removeCartItemFromStore = itemId => ({
	type: REMOVE_CART_ITEM,
	payload: itemId,
});

export const clearCart = () => ({ type: CLEAR_CART });

export const addRecentSearch = search => ({
	type: ADD_RECENT_SEARCH,
	payload: search,
});

export const clearRecentSearches = () => ({ type: CLEAR_RECENT_SEARCHES });
