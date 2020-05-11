import {createStore,applyMiddleware,combineReducers} from 'redux'
import { routerReducer } from 'react-router-redux';
import thunkMiddleware from 'redux-thunk'
import image from './reducers/image'
import document from './reducers/document'
import song from './reducers/song'


const rootReducer=combineReducers({image, document, song, router:routerReducer})
export default createStore(rootReducer,applyMiddleware(thunkMiddleware))