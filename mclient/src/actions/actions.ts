import actionCreatorFactory from 'typescript-fsa'
import * as types from '../constants/actionTypes'
import { GridType } from '../constants/MapSettings'
import { BarData } from '../constants/bargraph'
import { BalloonInfo } from '../constants/informationBalloon'
import { Line } from '../constants/line'

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

// line
export const addLineData = actionCreator<Line[]>('ADD_LINE_DATA');