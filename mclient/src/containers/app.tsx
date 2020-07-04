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
import MeshLayer from './MeshLayer'
import BarGraphInfoCard from '../components/BarGraphInfoCard'
import { selectBarGraph, removeBallonInfo, appendBallonInfo, updateBallonInfo } from '../actions/actions'
import store from '../store'
import { BarData } from '../constants/bargraph'
import { MeshItem } from '../constants/meshdata'
import { Line } from '../constants/line'
import { Arc, Scatter } from '../constants/geoObjects'

import InfomationBalloonLayer from './InfomationBalloonLayer'
import { BalloonInfo, BalloonItem } from '../constants/informationBalloon'

import { AgentData } from '../constants/agent'
import { isMapboxToken, isBarGraphMsg, isAgentMsg, isLineMsg, isGeoJsonMsg,
		isPitchMsg, isBearingMsg, isClearMovesMsg, isViewStateMsg, isArcMsg,
		isClearArcMsg, isScatterMsg, isClearScatterMsg, isLabelInfoMsg, isHarmoVISConfMsg
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
			} else if (isHarmoVISConfMsg(msg)){
				self.resolveHarmoVISConf(msg.payload)
			}

		}

		setSecPerHour(3600)
		setLeading(3)
		setTrailing(3)




		this.state = {
			moveDataVisible: true,
			moveOptionVisible: false,
			depotOptionVisible: false,
			controlVisible: true,
			fpsVisible:true,
			optionChange: false,
			mapbox_token: '',
			
//			geojson: null,
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

		// just initial settings for lines.


//		this._onViewStateChange = this._onViewStateChange.bind(this)
	}

	setSampleMesh(){
				// math
		// nagoya lat, lon = 35.181433 136.906421
		const {lat, lon} = {lat:35.181433, lon:136.906421} 
		const msize = 0.01;


		const mbase = {
//			departuretime: 1592717000, // 2020/06/21
//			arrivaltime:   1592729000,
			mid: 1000000,
			operation:[] as any[],
		}
		const nowDateTime = Math.floor( new Date().getTime()/1000.0)

		for (let i = 0; i< 200; i ++){
			mbase.operation[i]={
				elapsedtime: nowDateTime+i,
				meshItems: [] as MeshItem[]
			}
			for (let xx = 0; xx< 40; xx ++){
				for (let yy = 0; yy< 30; yy ++){
					const v = xx*5+yy*5+1
					mbase.operation[i].meshItems.push({
						pos:[lon+msize*xx,lat+msize*yy],
						col: [48,128,(v/2+i*2)%256,190],
						val: v+i*20
					})
				}
			}
		}

//		store.dispatch(actions.toggleHeatmap(false));
//		console.log("mbase:",mbase)
		this.props.actions.updateMovesBase([mbase])

	}

	resolveHarmoVISConf(conf: any){
		console.log("Resolve HarmoVISConf",conf)
		if (conf.noLoop != undefined){
			this.props.actions.setNoLoop(conf.noLoop);
		}
		if (conf.mapVisible != undefined){
			store.dispatch(actions.setMapVisible(conf.mapVisible))
		}
		if (conf.moveDataVisible != undefined){
			this.setState({moveDataVisible: conf.moveDataVisible});
		}
		if (conf.moveOptionVisible != undefined){
			this.setState({moveOptionVisible: conf.moveOptionVisible});
		}
		if (conf.moveOptionVisible != undefined){
			this.setState({moveOptionVisible: conf.moveOptionVisible});
		}
		if (conf.depotOptionVisible != undefined){
			this.setState({depotOptionVisible: conf.depotOptionVisible});
		}
		if (conf.heatmapVisible != undefined){
			store.dispatch(actions.toggleHeatmap(conf.heatmapVisible));
		}
		if (conf.heatmapType != undefined){			
			store.dispatch(actions.selectHeatmapType(conf.heatmapType))
		}
		if (conf.heatmap3D != undefined){			
			store.dispatch(actions.extrudeHeatmap(conf.heatmap3D))
		}
		if (conf.heatmapRadius != undefined){			
			store.dispatch(actions.setHeatmapRadius(conf.heatmapRadius))
		}
		if (conf.heatmapHeight != undefined){			
			store.dispatch(actions.setHeatmapHeight(conf.heatmapHeight))
		}
		if (conf.barHeight != undefined){			
			store.dispatch(actions.changeBarHeight(conf.barHeight))
		}
		if (conf.barWidth != undefined){			
			store.dispatch(actions.changeBarHeight(conf.barWidth))
		}
		if (conf.barRadius != undefined){			
			store.dispatch(actions.changeBarRadius(conf.barRadius))
		}
		if (conf.barTitleVisible != undefined){			
			store.dispatch(actions.showBarTitle(conf.barTitleVisible))
		}
		if (conf.barTitleOffset != undefined){			
			store.dispatch(actions.changeBarTitlePosOffset(conf.barTitleOffset))
		}
		if (conf.barTitleSize != undefined){			
			store.dispatch(actions.changeBarTitleSize(conf.barTitleSize))
		}
		if (conf.secPerHour != undefined){			
			this.props.actions.setSecPerHour(conf.secPerHour)
		}
		if (conf.setTime != undefined){			
			if (conf.setTime < 0){
				this.props.actions.setTime(this.props.timeLength + conf.setTime+this.props.timeBegin)
			}else{
				this.props.actions.setTime(conf.setTime+this.props.timeBegin)
			}
		}
		if (conf.animate != undefined){			
			this.props.actions.setAnimatePause(!conf.animate)
		}
		if (conf.animateReverse != undefined){			
			this.props.actions.setAnimateReverse(conf.animateReverse)
		}


		if (conf.controlVisible != undefined){
			this.setState({controlVisible:conf.controlVisible})
		}
		if (conf.fpsVisible != undefined){
			this.setState({fpsVisible:conf.fpsVisible})
		}

		// new Flyto for HarmoVIS 1.6.11
		// now undefined in Harmoware-VIS 1.6.15
//		if (conf.flyToFlag != undefined){
//			this.setState({flyToFlag: conf.flyToFlag})			
//		}

		if (conf.initialViewChange != undefined){
			this.props.actions.setInitialViewChange(conf.initialViewChange)
		}

		if (conf.addMesh != undefined) {
			this.addMeshData(conf.addMesh)
		}
		if (conf.meshVisible != undefined) {
			store.dispatch(actions.setMeshVisible(conf.meshVisible))
		}
		if (conf.mesh3D != undefined) {
			store.dispatch(actions.setMesh3D(conf.mesh3D))
		}
		if (conf.meshWire != undefined) {
			store.dispatch(actions.setMeshWire(conf.meshWire))
		}
		if (conf.meshRadius != undefined) {
			store.dispatch(actions.setMeshRadius(conf.meshRadius))
		}
		if (conf.meshHeight != undefined) {
			store.dispatch(actions.setMeshHeight(conf.meshHeight))
		}
		if (conf.setMeshPolyNum != undefined) {
			store.dispatch(actions.setMeshPolyNum(conf.setMeshPolyNum))
		}
		if (conf.meshAngle != undefined) {
			store.dispatch(actions.setMeshAngle(conf.meshAngle))
		}

	}

	/*
		meshBlock:
		  { id:number, timestamp, meshItems: MeshItems[]}
	*/

	addMeshData(meshBlock:any){
		const { actions, movesbase } = this.props
		let  setMovesbase = movesbase // (need copy!?)
		let noDataFlag = true
		for (const mbase of setMovesbase ){
			if (mbase.mid == meshBlock.id){
				mbase.operation.push({
					elapsedtime: meshBlock.timestamp,
					meshItems: meshBlock.meshItems,
				})
				noDataFlag = false
				break;
			}
		}
		if (noDataFlag){
			setMovesbase.push({
				mid: meshBlock.id, // meshID
				operation: [{
					elapsedtime: meshBlock.timestamp,
					meshItems: meshBlock.meshItems,	
				}]
			})
		}
		actions.updateMovesBase(setMovesbase);	
	}
	

	bin2String (array :any) {
		return String.fromCharCode.apply(String, array)
  	}

	getGeoJson (data :string) {
		console.log('Geojson:' + data.length)
//		console.log(data)
//		this.setState({ geojson: JSON.parse(data) })
		store.dispatch(actions.addGeoJsonData(data))
	}
	getClearMoves (data :any) {
		console.log('GetClearMoves:' + data)
		this.deleteMovebase(0)
	}

	getBearing (data :any ) {
//		console.log('Bearing:' + data)
//		console.log(this.props.actions)
		let vp:any = { bearing: data.bearing}
		if (data.duration){
			if (data.duration <0 ){
				vp.transitionDuration= "auto"
			}else{
				vp.transitionDuration= Math.floor(data.duration*1000)  // sec -> msec conversion
			}
		}
		this.props.actions.setViewport(vp)
	}
	
	getPitch (data :any) {
//		console.log('Pitch:' + data)
		let vp:any = { pitch: data.pitch}

		if (data.duration){
			if (data.duration <0 ){
				vp.transitionDuration= "auto"
			}else{
				vp.transitionDuration= Math.floor(data.duration*1000)  // sec -> msec conversion
			}
		}
		this.props.actions.setViewport(vp)
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
		

		let vp:any  =	{
			latitude: vs.lat,
			longitude: vs.lon,
			zoom: vs.zoom,
			pitch: vs.pitch
		}

		if (vs.duration != undefined ){
			if( vs.duration > 0){// set animation!
				vp.transitionDuration = Math.floor(data.duration*1000)
			}else{
				vp.transitionDuration = "auto"
			}			
		}

//		console.log("SetViewport",pv)
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
		const { actions, movesbase, agentColor } = this.props
		const agents = dt.dt.agents
		const time = dt.ts // set time as now. (If data have time, ..)
		let  setMovesbase = movesbase

		agents.forEach((agent, agn) => {
			let flag = false;
			setMovesbase.forEach(
				(
					v: {
						id: number;
						mtype: number;
						departuretime: number;
						arrivaltime: number;
						operation: [
							{
								elapsedtime: number;
								position: number[];
								angle: number;
								color: any;
								speed: number;
							}
						];
						"": any
					}
				) => {
				if(v.id === (agent.id || agn) && v.mtype === 0) {
					v.operation.push({
						elapsedtime: time,
						position: [agent.point[0], agent.point[1], 0],
						angle: 0,
						color: agent.color || agentColor,
						speed: 0.5
					});
					flag = true;
				}
			});
			if (!flag) {
				setMovesbase.push({
					mtype: 0,
					id: agent.id || agn,
					departuretime: time,
					arrivaltime: time,
					operation: [{
						elapsedtime: time,
						position: [agent.point[0], agent.point[1], 0],
						angle: 0,
						speed: 0.5,
						color: agent.color || agentColor,
					}]
				})
			}
		});
		
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
//		const movesbasedata = [...movesbase]
		const setMovesbase :any[] = []
		let dataModify = false
//		const compareTime = settime - maxKeepSecond

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
		this.props.actions.setViewport({maxZoom:30, minZoom:1, maxPitch:85})
//		const { setNoLoop } = this.props.actions
//		setNoLoop(true); // no loop on time end.
//		this.setSampleMesh()
	}

	render () {
		const props = this.props
		const { actions, clickedObject, inputFileName, viewport, deoptsData, loading, lines, arcs, scatters, geojson,
			arcVisible, scatterVisible, scatterFill, scatterMode, 
			routePaths, lightSettings, movesbase, movedData, mapStyle ,extruded, gridSize,gridHeight, enabledHeatmap, selectedType,
			widthRatio, heightRatio, radiusRatio, showTitle, infoBalloonList,  settime, titlePosOffset, titleSize,
			labelText, labelStyle,
			meshVisible, mesh3D, meshWire, meshRadius, meshHeight, meshPolyNum, meshAngle,
			mapVisible
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

		if (meshVisible) {
			layers.push(new MeshLayer({
				id: 'mesh-layer',
				data: movedData,
				movesbase: movesbase,
				currentTime: settime,
				mesh3D: mesh3D, // use same as heatmap
				meshPolyNum: meshPolyNum,
				meshAngle: meshAngle,
				meshWire: meshWire, // 
				meshRadius: meshRadius,            // 
				meshHeightRatio: meshHeight, // using same of heatmap
			}))
		}



		if (geojson != null) {
//			console.log("geojson rendering"+this.state.geojson.length)
			layers.push(
			new GeoJsonLayer({
				id: 'geojson-layer',
				data: geojson,
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
					visible={mapVisible}
					viewport={viewport}
					mapboxApiAccessToken={this.state.mapbox_token}
					mapboxAddLayerValue={null}
					actions={actions}
					layers={layers}
				/>
				: <LoadingIcon loading={true} />
		const controller  = 
			(this.state.controlVisible?
				<Controller {...(props as any)}
				deleteMovebase={this.deleteMovebase.bind(this)}
				getMoveDataChecked={this.getMoveDataChecked.bind(this)}
				getMoveOptionChecked={this.getMoveOptionChecked.bind(this)}
				getDepotOptionChecked={this.getDepotOptionChecked.bind(this)}
				getOptionChangeChecked={this.getOptionChangeChecked.bind(this)}
				/>
				:<div />
			)
		const fpsdisp =
				(this.state.fpsVisible?
					<FpsDisplay />
				 :<div />
				)
		return (
			<div>
				<TopTextLayer labelText={labelText} labelStyle={labelStyle}/>
				{controller}
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
				{fpsdisp}
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
