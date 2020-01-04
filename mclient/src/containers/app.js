import React from 'react';
import {
	Container, connectToHarmowareVis, HarmoVisLayers, MovesLayer, MovesInput, LoadingIcon, FpsDisplay, DepotsLayer, EventInfo, MovesbaseOperation, MovesBase, BasedProps
} from 'harmoware-vis';

//import { StaticMap,  } from 'react-map-gl';
import { Layer } from '@deck.gl/core';
import DeckGL from '@deck.gl/react';
import {_MapContext as MapContext, StaticMap, NavigationControl} from 'react-map-gl';


import Controller from '../components/controller';

import * as io from 'socket.io-client';

const MAPBOX_TOKEN = process.env.MAPBOX_ACCESS_TOKEN; //Acquire Mapbox accesstoken

class App extends Container {
	constructor(props) {
		super(props);
		const { setSecPerHour, setLeading, setTrailing } = props.actions;
		setSecPerHour(3600);
		setLeading(3);
		setTrailing(3);
		const socket = io();
		this.state = {
			moveDataVisible: true,
			moveOptionVisible: false,
			depotOptionVisible: false,
			heatmapVisible: false,
			optionChange: false,
			mapbox_token: "",
			popup: [0, 0, '']
		};

		// for receiving event info.
		socket.on('connect', () => { console.log("Socket.IO connected!") });
		socket.on('event', this.getEvent.bind(this));

		socket.on('mapbox_token', (token) => {
			console.log("Token Got:" + token)
			this.setState({ mapbox_token: token })
		});

		socket.on('disconnect', () => { console.log("Socket.IO disconnected!") });
	}

	getEvent(socketData) {
		const { actions, movesbase } = this.props
		const { mtype, id, lat, lon, angle, speed } = JSON.parse(socketData);
		//	console.log("dt:",mtype,id,time,lat,lon,angle,speed, socketData);
		const time = Date.now() / 1000; // set time as now. (If data have time, ..)
		let hit = false;
		const movesbasedata = [...movesbase]; // why copy !?
		const setMovesbase = [];

		for (let i = 0, lengthi = movesbasedata.length; i < lengthi; i += 1) {
			//	    let setMovedata = Object.assign({}, movesbasedata[i]);
			let setMovedata = movesbasedata[i];
			if (mtype === setMovedata.mtype && id === setMovedata.id) {
				hit = true;
				//		const {operation } = setMovedata;
				//		const arrivaltime = time;
				setMovedata.arrivaltime = time;
				setMovedata.operation.push({
					elapsedtime: time,
					position: [lon, lat, 0],
					angle, speed
				});
				//		setMovedata = Object.assign({}, setMovedata, {arrivaltime, operation});
			}
			setMovesbase.push(setMovedata);
		}
		if (!hit) {
			setMovesbase.push({
				mtype, id,
				departuretime: time,
				arrivaltime: time,
				operation: [{
					elapsedtime: time,
					position: [lon, lat, 0],
					angle, speed
				}]
			});
		}
		actions.updateMovesBase(setMovesbase);
	}

	deleteMovebase(maxKeepSecond) {
		const { actions, animatePause, movesbase, settime } = this.props
		const movesbasedata = [...movesbase];
		const setMovesbase = [];
		let dataModify = false;
		const compareTime = settime - maxKeepSecond;
		for (let i = 0, lengthi = movesbasedata.length; i < lengthi; i += 1) {
			const { departuretime: propsdeparturetime, operation: propsoperation } = movesbasedata[i];
			let departuretime = propsdeparturetime;
			let startIndex = propsoperation.length;
			for (let j = 0, lengthj = propsoperation.length; j < lengthj; j += 1) {
				if (propsoperation[j].elapsedtime > compareTime) {
					startIndex = j;
					departuretime = propsoperation[j].elapsedtime;
					break;
				}
			}
			if (startIndex === 0) {
				setMovesbase.push(Object.assign({}, movesbasedata[i]));
			} else
				if (startIndex < propsoperation.length) {
					setMovesbase.push(Object.assign({}, movesbasedata[i], {
						operation: propsoperation.slice(startIndex), departuretime
					}));
					dataModify = true;
				} else {
					dataModify = true;
				}
		}
		if (dataModify) {
			if (!animatePause) {
				actions.setAnimatePause(true);
			}
			actions.updateMovesBase(setMovesbase);
			if (!animatePause) {
				actions.setAnimatePause(false);
			}
		}
	}

	getMoveDataChecked(e) {
		this.setState({ moveDataVisible: e.target.checked });
	}

	getMoveOptionChecked(e) {
		this.setState({ moveOptionVisible: e.target.checked });
	}

	getDepotOptionChecked(e) {
		this.setState({ depotOptionVisible: e.target.checked });
	}

	getOptionChangeChecked(e) {
		this.setState({ optionChange: e.target.checked });
	}

	initialize(gl) {
		gl.enable(gl.DEPTH_TEST);
		gl.depthFunc(gl.LEQUAL);
		console.log("GL Initialized!")
	}

	logViewPort(state,view){
		console.log("Viewport changed!", state, view)
	}
	

	render() {
		const props = this.props;
		const { actions, clickedObject, inputFileName, viewport, deoptsData, loading, 
			routePaths, lightSettings, movesbase, movedData, mapStyle } = props;
		//	const { movesFileName } = inputFileName;
		const optionVisible = false;
		const onHover = (el) => {
			if (el && el.object) {
				let disptext = '';
				const objctlist = Object.entries(el.object);
				for (let i = 0, lengthi = objctlist.length; i < lengthi; i += 1) {
					const strvalue = objctlist[i][1].toString();
					disptext += i > 0 ? '\n' : '';
					disptext += (`${objctlist[i][0]}: ${strvalue}`);
				}
				this.setState({ popup: [el.x, el.y, disptext] });
			} else {
				this.setState({ popup: [0, 0, ''] });
			}
		};

		const layers = 	[
			this.state.moveDataVisible && movedData.length > 0 ?
				new MovesLayer({
					viewport, routePaths, movesbase, movedData,
					clickedObject, actions, lightSettings,
					visible: this.state.moveDataVisible,
					optionVisible: this.state.moveOptionVisible,
					optionChange: this.state.optionChange,
					onHover
				}) : null
		];

		const onViewportChange = this.props.onViewportChange || actions.setViewport || this.logViewPort;
//		viewState={viewport} 
					
		// wait until mapbox_token is given from harmo-vis provider.
		const visLayer =
			(this.state.mapbox_token.length > 0) ?
				<DeckGL 
					layers={layers} 
					onWebGLInitialized={this.initialize} 
					initialViewState={{longitude: viewport.longitude, latitude: viewport.latitude, zoom: viewport.zoom}}
					controller={true}
					ContextProvider={MapContext.Provider}
				>
					<StaticMap
					viewport={viewport} 
					mapStyle={'mapbox://styles/mapbox/dark-v8'}
					onViewportChange={onViewportChange}
					mapboxApiAccessToken={this.state.mapbox_token}
					visible={true}>
					</StaticMap>
				</DeckGL>
				: <LoadingIcon loading={true} />;

/*					<div style={{ position: "absolute", left: 30, top: 120, zIndex: 1 }}>
						<NavigationControl />
					</div>
				*/

			/*				<InteractiveMap
					viewport={viewport} 
					mapStyle={'mapbox://styles/mapbox/dark-v8'}
					onViewportChange={onViewportChange}
					mapboxApiAccessToken={this.state.mapbox_token}
					visible={true}>

					<DeckGL viewState={viewport} layers={layers} onWebGLInitialized={this.initialize} />

				</InteractiveMap>
				: <LoadingIcon loading={true} />;
*/
		return (
			<div>
				<Controller {...props}
					deleteMovebase={this.deleteMovebase.bind(this)}
					getMoveDataChecked={this.getMoveDataChecked.bind(this)}
					getMoveOptionChecked={this.getMoveOptionChecked.bind(this)}
					getDepotOptionChecked={this.getDepotOptionChecked.bind(this)}
					getOptionChangeChecked={this.getOptionChangeChecked.bind(this)}
				/>
				<div className="harmovis_area">
					{visLayer}
				</div>
				<svg width={viewport.width} height={viewport.height} className="harmovis_overlay">
					<g fill="white" fontSize="12">
						{this.state.popup[2].length > 0 ?
							this.state.popup[2].split('\n').map((value, index) =>
								<text
									x={this.state.popup[0] + 10} y={this.state.popup[1] + (index * 12)}
									key={index.toString()}
								>{value}</text>) : null
						}
					</g>
				</svg>

				<FpsDisplay />
			</div>
		);
	}
}
export default connectToHarmowareVis(App);
