import actionCreatorFactory from 'typescript-fsa'
import * as types from '../constants/actionTypes'
import { HeatmapType } from '../reducer/heatmapSettings'

const actionCreator = actionCreatorFactory()

export const setHeatmapRadius = actionCreator<number>(types.SET_HEATMAP_SIZE)
export const setHeatmapHeight = actionCreator<number>(types.SET_HEATMAP_HEIGHT)
export const setParticleCount = actionCreator<number>(types.SET_PARTICLE_COUNT)
export const toggleHeatmap = actionCreator<boolean>(types.TOGGLE_HEATMAP)
export const selectHeatmapType = actionCreator<HeatmapType>(types.CHANGE_HEATMAP_TYPE)
export const extrudeHeatmap = actionCreator<boolean>(types.EXTRUDE_HEATMAP)
