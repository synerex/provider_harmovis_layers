import React from 'react'
import { render } from 'react-dom'

import { Provider } from 'react-redux'
import App from './containers/app'

import 'mapbox-gl/src/css/mapbox-gl.css'

import 'bootstrap/dist/css/bootstrap.min.css'
import './scss/harmovis.scss'

import store from './store' // separete store file.


render(
	<Provider store={store as any}>
	<App />
	</Provider>,
    document.getElementById('app')
)
