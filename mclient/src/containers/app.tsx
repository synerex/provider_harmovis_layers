import React from 'react'

import { useSelector, useDispatch } from 'react-redux'
import * as actions from '../actions/actions'

import {
	Container, connectToHarmowareVis, HarmoVisLayers, MovesLayer, MovesInput,
	LoadingIcon, FpsDisplay, Movesbase, Actions, LineMapLayer
} from 'harmoware-vis'

// import './App.scss';
// import { StaticMap,  } from 'react-map-gl';
//import { Layer } from '@deck.gl/core'

import {GeoJsonLayer, LineLayer, ArcLayer, ScatterplotLayer} from '@deck.gl/layers'

import BarLayer from './BarLayer'
import BarGraphInfoCard from '../components/BarGraphInfoCard'
import { selectBarGraph, removeBallonInfo, appendBallonInfo, updateBallonInfo } from '../actions/actions'
import store from '../store'
import { BarData } from '../constants/bargraph'
import { Line } from '../constants/line'
import { Arc, Scatter } from '../constants/geoObjects'

import InfomationBalloonLayer from './InfomationBalloonLayer'
import { BalloonInfo, BalloonItem } from '../constants/informationBalloon'

import { AgentData } from '../constants/agent'
import { isMapboxToken, isBarGraphMsg, isAgentMsg, isLineMsg, isGeoJsonMsg,
		isPitchMsg, isBearingMsg, isClearMovesMsg, isViewStateMsg, isArcMsg,
		isClearArcMsg, isScatterMsg, isClearScatterMsg, isLabelInfoMsg
	} from '../constants/workerMessageTypes'
import  TopTextLayer  from '../components/TopTextLayer'

import Controller from '../components/controller'
import HeatmapLayer from './HeatmapLayer'
//import layerSettings from '../reducer/layerSettings'

class App extends Container<any,any> {
	private lines = 0;

	constructor (props: any) {
		super(props)
		const { setSecPerHour, setLeading, setTrailing } = props.actions
		const worker = new Worker('socketWorker.js'); // worker for socket-io communication.
		const self = this;
		worker.onmessage = (e) => {
			const msg = e.data;
			if (isBarGraphMsg(msg)) {
				self.getBargraph(msg.payload)
			} else if (isAgentMsg(msg)) {
				self.getAgents(msg.payload)
			} else if (isLineMsg(msg)) {
				self.getLines(msg.payload)
			} else if (isGeoJsonMsg(msg)) {
				self.getGeoJson(msg.payload)
			} else if (isPitchMsg(msg)) {
				self.getPitch(msg.payload)
			} else if (isBearingMsg(msg)) {
				self.getBearing(msg.payload)
			} else if (isClearMovesMsg(msg)) {
				self.deleteMovebase(0)
//			 	self.getAgents(msg.payload)
			} else if(isMapboxToken(msg)) {
				this.setState({
					mapbox_token: msg.payload
				});
				console.log("Mapbox Token Assigned:"+msg.payload)
			} else if (msg.type === 'CONNECTED') {
				console.log('connected')
			} else if (isViewStateMsg(msg)) {
				self.getViewState(msg.payload)
			} else if (isArcMsg(msg)){
				self.addArc(msg.payload)
			} else if (isClearArcMsg(msg)){
				self.clearArc()
			} else if (isScatterMsg(msg)){
				self.addScatter(msg.payload)								
			} else if (isClearScatterMsg(msg)){
				self.clearScatter()
			} else if (isLabelInfoMsg(msg)){
				console.log("LabelText")
				store.dispatch(actions.setTopLabelInfo(msg.payload))
			}

		}

		setSecPerHour(3600)
		setLeading(3)
		setTrailing(3)
		this.state = {
			moveDataVisible: true,
			moveOptionVisible: false,
			depotOptionVisible: false,
			heatmapVisible: false,
			optionChange: false,
			mapbox_token: '',
			geojson: null,
//			lines: [],
/*			viewState: {
				longitude: 136.8163486 ,
				latitude: 34.8592285,
				zoom: 17,
				bearing: 0,
				pitch: 0,
				width: 500,
				height: 500
			}, */
			linecolor: [0,155,155],
			popup: [0, 0, '']
		}

//		this._onViewStateChange = this._onViewStateChange.bind(this)
	}
	

	bin2String (array :any) {
		return String.fromCharCode.apply(String, array)
  	}

	getGeoJson (data :string) {
		console.log('Geojson:' + data.length)
//		console.log(data)
		this.setState({ geojson: JSON.parse(data) })
	}
	getClearMoves (data :any) {
		console.log('GetClearMoves:' + data)
		this.deleteMovebase(0)
	}

	getBearing (data :any ) {
//		console.log('Bearing:' + data)
//		console.log(this.props.actions)
		this.props.actions.setViewport({bearing:data})
	}
	
	getPitch (data :any) {
//		console.log('Pitch:' + data)
		this.props.actions.setViewport({pitch:data})
	}


	// if pitch/zoom < 0 then use current value
	getViewState (data: any) {
		let pv = this.props.viewport
		console.log('setViewState:' + data)
		console.log('currentViewState:',pv)
		let vs = JSON.parse(data)
		if (vs.pitch == undefined || vs.pitch < 0){
			vs.pitch = pv.pitch
		}
		if (vs.zoom == undefined || vs.zoom < 0){
			vs.zoom = pv.zoom
		}
//		console.log("SetViewport",pv)

		const vp  =	{
			latitude: vs.lat,
			longitude: vs.lon,
			zoom: vs.zoom,
			pitch: vs.pitch
		}

	// Hook cannot be used under class...
//		const dispatch = useDispatch()
//		dispatch(this.props.actions.setViewport(vp))

		this.props.actions.setViewport(vp)
		
// 		this.map.getMap().flyTo({ center: [vs.Lon, vs.Lat], zoom:vs.Zoom, pitch: vs.Pitch })

	}

	addArc (data : Arc[]){
		console.log('getArcs!:' + data.length)
		console.log(this.props)
		console.log(this.state)

		store.dispatch(actions.addArcData(data))
		
	}

	clearArc (){
		console.log('clearArcs')
		store.dispatch(actions.clearArcData())
	}

	addScatter(data : Scatter[]){
		console.log('getScatter!:' + data.length)
		store.dispatch(actions.addScatterData(data))
	}

	clearScatter (){
		console.log('clearScatter' )
		store.dispatch(actions.clearScatterData())
	}




	getLines (data :Line[]) {
//		console.log('getLines!:' + data.length)
//		console.log(this.props.actions)

//		console.log(actions.addLineData)//(data)
		store.dispatch(actions.addLineData(data))
				
/* 		console.log(data)
//		if (this.state.lines.length > 0) {
//			const ladd = JSON.parse(data)
//			const lbase = this.state.lines
			const lists = lbase.concat(data)
//			this.setState({ lines: lists })   // shoul not use
//		} else {
//			this.setState({ lines: data })
//		}
*/
	}

	getAgents (dt : AgentData) { // receive Agents information from worker thread.
		const { actions, movesbase } = this.props
		const agents = dt.dt.agents
		const time = dt.ts // set time as now. (If data have time, ..)
		let  setMovesbase = []

		if (movesbase.length == 0) {
			for (let i = 0, len = agents.length; i < len; i++) {
				setMovesbase.push({
					mtype: 0,
					id: i,
					departuretime: time,
					arrivaltime: time,
					operation: [{
						elapsedtime: time,
						position: [agents[i].point[0], agents[i].point[1], 0],
						angle: 0,
						speed: 0.5,
						color: [100,100,0]
					}]
				})
			}
		} else {
			for (let i = 0, lengthi = movesbase.length; i < lengthi; i ++) {
				movesbase[i].arrivaltime = time
				movesbase[i].operation.push({
					elapsedtime: time,
					position: [agents[i].point[0], agents[i].point[1], 0],
					angle: 0,
					color: [100,100,0],
					speed: 0.5
				})
			}
			setMovesbase = movesbase
		}
		actions.updateMovesBase(setMovesbase)
	}

	
	getBargraph (data: any) {
		const { actions, movesbase } = this.props
		const bars = data;
		let  setMovesbase = [...movesbase]
		
		for (const barData of bars) {
			const base = (setMovesbase as Movesbase[]).find((m: any)=> m.id === barData.id)
			if (base) {
//				console.log("updateBardata",barData.id)
				base.operation.push(barData)
			} else {
//				console.log("NewBardata",barData.id)
				setMovesbase.push({
					mtype: 0,
					id: barData.id,
					departuretime: barData.elapsedtime,
					arrivaltime: barData.elapsedtime,
					operation: [barData]
				} as Movesbase)
			}
			this._updateBalloonInfo(barData);
		}
		actions.updateMovesBase(setMovesbase);
	}


	getEvent (socketData:any) {
		const { actions, movesbase } = this.props
		const { mtype, id, lat, lon, angle, speed } = JSON.parse(socketData)
		// 	console.log("dt:",mtype,id,time,lat,lon,angle,speed, socketData);
		const time = Date.now() / 1000 // set time as now. (If data have time, ..)
		let hit = false
		const movesbasedata = [...movesbase] // why copy !?
		const setMovesbase = []

		for (let i = 0, lengthi = movesbasedata.length; i < lengthi; i += 1) {
			// 	    let setMovedata = Object.assign({}, movesbasedata[i]);
			let setMovedata = movesbasedata[i]
			if (mtype === setMovedata.mtype && id === setMovedata.id) {
				hit = true
				// 		const {operation } = setMovedata;
				// 		const arrivaltime = time;
				setMovedata.arrivaltime = time
				setMovedata.operation.push({
					elapsedtime: time,
					position: [lon, lat, 0],
					angle, speed
				})
				// 		setMovedata = Object.assign({}, setMovedata, {arrivaltime, operation});
			}
			setMovesbase.push(setMovedata)
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
			})
		}
		actions.updateMovesBase(setMovesbase)
	}

	deleteMovebase (maxKeepSecond :any) {
		const { actions, animatePause, movesbase, settime } = this.props
		const movesbasedata = [...movesbase]
		const setMovesbase :any[] = []
		let dataModify = false
		const compareTime = settime - maxKeepSecond

		/*
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
		}*/
			if (!animatePause) {
				actions.setAnimatePause(true)
			}
			actions.updateMovesBase(setMovesbase)
			if (!animatePause) {
				actions.setAnimatePause(false)
			}
//		console.log('viewState')
// 		console.log(this.map.getMap())
//		console.log(this.state.viewState)

// 		this.map.getMap().flyTo({ center: [-118.4107187, 33.9415889] })
// 		console.log(this.state.viewState)
// 		console.log(MapContext.viewport)
	}

	getMoveDataChecked (e :any) {
		this.setState({ moveDataVisible: e.target.checked })
	}

	getMoveOptionChecked (e :any) {
		this.setState({ moveOptionVisible: e.target.checked })
	}

	getDepotOptionChecked (e :any) {
		this.setState({ depotOptionVisible: e.target.checked })
	}

	getOptionChangeChecked (e :any) {
		this.setState({ optionChange: e.target.checked })
	}

	initialize (gl :any) {
		gl.enable(gl.DEPTH_TEST)
		gl.depthFunc(gl.LEQUAL)
		console.log('GL Initialized!')
	}

	logViewPort (state :any,view :any) {
		console.log('Viewport changed!', state, view)
	}

	handleStyleLoad (map :any){
		console.log('StyleLoad:Map',map)
	}

	/*
	_onViewStateChange ({viewState} :any) {
		this.setState({viewState})
	}*/
	
	componentDidMount(){
		super.componentDidMount();
		// make zoom level 20!
//		let pv = this.props.viewport
//		pv.maxZoom = 20
		this.props.actions.setViewport({maxZoom:20, minZoom:1})
		const { setNoLoop } = this.props.actions
		setNoLoop(true);
	}

	render () {
		const props = this.props
		const { actions, clickedObject, inputFileName, viewport, deoptsData, loading, lines, arcs, scatters,
			arcVisible, scatterVisible, scatterFill, scatterMode, 
			routePaths, lightSettings, movesbase, movedData, mapStyle ,extruded, gridSize,gridHeight, enabledHeatmap, selectedType,
			widthRatio, heightRatio, radiusRatio, showTitle, infoBalloonList,  settime, titlePosOffset, titleSize,
			labelText, labelStyle
		} = props
		// 	const { movesFileName } = inputFileName;
//		const optionVisible = false
		const onHover = (el :any) => {
			if (el && el.object) {
				let disptext = ''
				const objctlist = Object.entries(el.object)
				for (let i = 0, lengthi = objctlist.length; i < lengthi; i += 1) {
					const strvalue = objctlist[i][1].toString()
					disptext += i > 0 ? '\n' : ''
					disptext += (`${objctlist[i][0]}: ${strvalue}`)
				}
				this.setState({ popup: [el.x, el.y, disptext] })
			} else {
				this.setState({ popup: [0, 0, ''] })
			}
		}
		let layers = []

		layers.push(new BarLayer({
			id: 'bar-layer',
			data: movedData,
			movesbase: movesbase,
			currentTime: settime,
			widthRatio,
			heightRatio,
			radiusRatio,
			selectBarGraph: this._selectBarGraph,
		    titlePositionOffset: titlePosOffset,
			titleSize,		    
			showTitle, 
		}))

		layers.push(new InfomationBalloonLayer({
			id: 'info-layer',
			infoList: infoBalloonList,
			handleIconClicked: (id) => {
				store.dispatch(removeBallonInfo(id));
			}
		}))

		if (this.state.geojson != null) {
//			console.log("geojson rendering"+this.state.geojson.length)
			layers.push(
			new GeoJsonLayer({
				id: 'geojson-layer',
				data: this.state.geojson,
				pickable: true,
				stroked: false,
				filled: true,
				extruded: true,
				lineWidthScale: 2,
				lineWidthMinPixels: 2,
				getFillColor: [160, 160, 180, 200],
// 				getLineColor: d => colorToRGBArray(d.properties.color),
				getLineColor: [255,255,255],
				getRadius: 1,
				getLineWidth: 1,
				getElevation: 10
// 				onHover: ({object, x, y}) => {
// 				  const tooltip = object.properties.name || object.properties.station;
// 				}
			}))
		}

		if (lines.length > 0) {
//			this.lines = 0
			layers.push(
				new LineLayer({
					visible: true,
					data: lines,
					getSourcePosition: (d :any) => d.from,
					getTargetPosition: (d :any) => d.to,
					getColor: this.state.linecolor,
					getWidth: 1.0,
					widthMinPixels: 0.5
				})

/*
				new LineMapLayer({
					data: lines,
					getSourcePosition: (d :any) => d.from,
					getTargetPosition: (d :any) => d.to,
					getColor: this.state.linecolor,
					getWidth: (d:any) => 1.0
				})
*/

			)

		}

		if (arcs.length > 0) {
			layers.push(
				new ArcLayer({
								id: 'arc-layer',
								visible: arcVisible,
								data: arcs,
								getSourcePosition: (d :any) => d.src,
								getTargetPosition: (d :any) => d.tgt,
								getSourceColor: (d :any) => d.srcCol,
								getTargetColor: (d :any) => d.tgtCol,
								getTilt: (d :any) => d.tilt| 0, 
								getWidth: 2.0,
								widthMinPixels: 1,
							})
			)
		}

		if (scatters.length > 0) {
			layers.push(
				new ScatterplotLayer({
								id: 'scatterplot-layer',
								visible: scatterVisible,
								radiusUnits: scatterMode, 
								data: scatters,
								filled: scatterFill, 
								getPosition: (d :any) => d.pos,
								getRadius: (d :any) => d.radius,
								getFillColor: (d :any) => d.fillCol,
								getLineColor: (d :any) => d.lineCol ,
								getLineWidth: (d :any) => d.lineWid| 1,
								linewidthMinPixels: 1,
								radiusMinPixels: 1,
							})
			)
		}
			

		if (this.state.moveDataVisible && movedData.length > 0) {
			layers.push(
				new MovesLayer({
					routePaths, 
					movesbase, 
					movedData,
					clickedObject, 
					actions,
					visible: this.state.moveDataVisible,
					optionVisible: this.state.moveOptionVisible,
					layerRadiusScale: 0.03,
					layerOpacity: 0.8,
					getRouteWidth: () => 0.2,
//					getStrokeWidth: 0.1,
//					getColor : [0,200,20] as number[],
					getArchWidth: (x : any) => 0.2, 
					optionCellSize: 2,
					sizeScale: 20,
					iconChange: false,
					optionChange: false, // this.state.optionChange,
					onHover
				}) as any
			)
		}


		if (enabledHeatmap) {
			layers.push(
				new HeatmapLayer({
					visible: enabledHeatmap,
					type: selectedType,
					extruded,
					movedData,
					size: gridSize,
					height: gridHeight
				  })
			)
		}

//		const onViewportChange = this.props.onViewportChange || actions.setViewport
//	    const {viewState} = this.state

		// wait until mapbox_token is given from harmo-vis provider.
		const visLayer =
			(this.state.mapbox_token.length > 0) ?
				<HarmoVisLayers 
					visible={true}
					viewport={viewport}
					mapboxApiAccessToken={this.state.mapbox_token}
					mapboxAddLayerValue={null}
					actions={actions}
					layers={layers}
				/>
				: <LoadingIcon loading={true} />

		return (
			<div>
				<TopTextLayer labelText={labelText} labelStyle={labelStyle}/>
				<Controller {...(props as any)}
					deleteMovebase={this.deleteMovebase.bind(this)}
					getMoveDataChecked={this.getMoveDataChecked.bind(this)}
					getMoveOptionChecked={this.getMoveOptionChecked.bind(this)}
					getDepotOptionChecked={this.getDepotOptionChecked.bind(this)}
					getOptionChangeChecked={this.getOptionChangeChecked.bind(this)}
				/>
				<div className='harmovis_area'>
					{visLayer}
				</div>
				<svg width={viewport.width} height={viewport.height} className='harmovis_overlay'>
					<g fill='white' fontSize='12'>
						{this.state.popup[2].length > 0 ?
							this.state.popup[2].split('\n').map((value :any, index :number) =>
								<text
									x={this.state.popup[0] + 10} y={this.state.popup[1] + (index * 12)}
									key={index.toString()}
								>{value}</text>) : null
						}
					</g>
				</svg>

				<FpsDisplay />
				<div style={{
						width: '100%',
						position: 'absolute',
						bottom: 10
					}}>
				</div>
				{
					this._renderBarGraphInfo()
				}

			</div>
		)
	}

	_renderBarGraphInfo = () => {
		const { selectedBarData } = this.props;
		if (selectedBarData) {
			return <BarGraphInfoCard 
				data={selectedBarData}
				onClose={() => {
					this._selectBarGraph(null)
				}}
			/>
		}
	}
	_updateSelectedBarGraph = (barData: BarData) => {
		const { selectedBarData } = this.props;
		if (selectedBarData && selectedBarData.id === barData.id) {
			store.dispatch(selectBarGraph(barData))
		}
	}

	_updateBalloonInfo = (data: BarData|null) => {
		if (data) {
			const { infoBalloonList } = this.props;
			const balloon = infoBalloonList.find((i: BalloonInfo) => i.id === data.id)
			if (balloon) {
				this._selectBarGraph(data);
			}
		}
	}

	_selectBarGraph = (data: BarData|null) => {
		if (!!data) {
			const { infoBalloonList } = this.props;
			const ballon = infoBalloonList.find((i: BalloonInfo) => i.id === data.id)
			const newInfo: BalloonInfo = {
				id: data.id as string,
				titleColor: [0xff, 0xff, 0xff],
				position: data.position?? [],
				title: data.text,
				items: data.data.map((item): BalloonItem => ({
					text: (item.label+' : '+item.value),
					color: item.color
				})),
			}

			if (!ballon) {
				store.dispatch(appendBallonInfo(newInfo))
			} else {
				store.dispatch(updateBallonInfo(newInfo))
			}
		}
	}
	
}
export default connectToHarmowareVis(App)
