import React from 'react'
import { HashRouter as AppRouter, Route, Switch } from 'react-router-dom'
import { Provider } from 'react-redux'
import App from './components/App'
import store from './redux/store'

const Router = () => (
    <Provider store={store}>
        <AppRouter>
            <Switch>
                <Route exact path="/" component={App} />
            </Switch>
        </AppRouter>
    </Provider>
)

export default Router