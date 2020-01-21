import React from 'react'
import { render } from 'react-dom'
import { getCombinedReducer } from 'harmoware-vis'
import { createStore, applyMiddleware } from 'redux'

import { Provider } from 'react-redux'
import App from './containers/app'
import heatmapSettings from './reducer/heatmapSettings'

import createSagaMiddleware from 'redux-saga'

import 'mapbox-gl/src/css/mapbox-gl.css'

import 'bootstrap/dist/css/bootstrap.min.css'
import './scss/harmovis.scss'

const saga = createSagaMiddleware()

const store = createStore(
	getCombinedReducer({
  heatmapSettings
}),
	applyMiddleware(saga)
)

render(
	<Provider store={store as any}>
	<App />
	</Provider>,
    document.getElementById('app')
)
