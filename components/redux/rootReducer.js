import { combineReducers } from 'redux';
import cartReducer from './reducer';
import searchReducer from './Product';

const rootReducer = combineReducers({
	cart: cartReducer,
	search: searchReducer,
});

export default rootReducer;
