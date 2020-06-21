import actionCreatorFactory from 'typescript-fsa'
import * as types from '../constants/actionTypes'
import { GridType } from '../constants/MapSettings'
import { BarData } from '../constants/bargraph'
import { BalloonInfo } from '../constants/informationBalloon'
import { Line } from '../constants/line'
import { Arc, Scatter, LabelInfo} from '../constants/geoObjects'

const actionCreator = actionCreatorFactory()

// heatmap
export const setParticleCount = actionCreator<number>(types.SET_PARTICLE_COUNT)
export const setHeatmapRadius = actionCreator<number>(types.SET_HEATMAP_SIZE)
export const setHeatmapHeight = actionCreator<number>(types.SET_HEATMAP_HEIGHT)
export const toggleHeatmap = actionCreator<boolean>(types.TOGGLE_HEATMAP)
export const selectHeatmapType = actionCreator<GridType>(types.CHANGE_HEATMAP_TYPE)
export const extrudeHeatmap = actionCreator<boolean>(types.EXTRUDE_HEATMAP)

// bar
export const changeBarHeight = actionCreator<number>('CHANGE_BAR_HEIGHT')
export const changeBarWidth = actionCreator<number>('CHANGE_BAR_WIDTH')
export const changeBarRadius = actionCreator<number>('CHANGE_BAR_RADIUS')
export const selectBarGraph = actionCreator<BarData|null>('SELECT_BAR_GRAPH')
export const showBarTitle = actionCreator<boolean>('SHOW_BAR_TITLE')
export const changeBarTitlePosOffset = actionCreator<number>('CHANGE_TITLE_POS_OFFSET')
export const changeBarTitleSize = actionCreator<number>('CHANGE_TITLE_SIZE')

// balloon
export const appendBallonInfo = actionCreator<BalloonInfo>('APPEND_BALLOON_INFO');
export const updateBallonInfo = actionCreator<BalloonInfo>('UPDATE_BALLOON_INFO');
export const removeBallonInfo = actionCreator<string>('REMOVE_BALLOON_INFO');

// json
export const addGeoJsonData = actionCreator<string>('ADD_GEOJSON_DATA');

// line
export const addLineData = actionCreator<Line[]>('ADD_LINE_DATA');

// arc
export const addArcData = actionCreator<Arc[]>('ADD_ARC_DATA');
export const clearArcData = actionCreator('CLEAR_ARC_DATA');

// scatter
export const addScatterData = actionCreator<Scatter[]>('ADD_SCATTER_DATA');
export const clearScatterData = actionCreator('CLEAR_SCATTER_DATA');
export const setScatterInfo = actionCreator('SET_SCATTER_INFO');

// label
export const setTopLabelInfo = actionCreator<LabelInfo>('SET_LABEL_INFO');

// meshLayer
export const setMeshVisible = actionCreator<boolean>(types.SET_MESH_VISIBLE)
export const setMesh3D = actionCreator<boolean>(types.SET_MESH_3D)
export const setMeshWire = actionCreator<boolean>(types.SET_MESH_WIRE)
export const setMeshRadius = actionCreator<number>(types.SET_MESH_RADIUS)
export const setMeshHeight = actionCreator<number>(types.SET_MESH_HEIGHT)
export const setMeshPolyNum = actionCreator<number>(types.SET_MESH_POLYNUM)
export const setMeshAngle = actionCreator<number>(types.SET_MESH_ANGLE)

// mapLayer
export const setMapVisible = actionCreator<boolean>(types.SET_MAP_VISIBLE)
export const setAgentColor = actionCreator<number[]>(types.SET_AGENT_COLOR)
