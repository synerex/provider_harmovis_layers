import { isType } from 'typescript-fsa'
import { Action } from 'redux'
import * as actions from '../actions/actions'
import { GridType } from '../constants/MapSettings'

export interface HeatmapState {
  selectedType: GridType
  particleCount: number
  gridSize: number
  gridHeight: number
  enabledHeatmap: boolean
  extruded: boolean
}

const initialState: HeatmapState  = {
  selectedType: GridType.Hexagon,
  enabledHeatmap: true,
  gridSize: 10,
  gridHeight: 1,
  particleCount: 3000,
  extruded: true
}

export default (state = initialState, action: Action): HeatmapState => {
  if (isType(action, actions.setHeatmapRadius)) {
    return {
      ...state,
      gridSize: action.payload
    }
  }
  if (isType(action, actions.setHeatmapHeight)) {
    return {
      ...state,
      gridHeight: action.payload
    }
  }
  if (isType(action, actions.toggleHeatmap)) {
    return {
      ...state,
      enabledHeatmap: action.payload
    }
  }
  if (isType(action, actions.selectHeatmapType)) {
    return {
      ...state,
      selectedType: action.payload
    }
  }
  if (isType(action, actions.extrudeHeatmap)) {
    return {
      ...state,
      extruded: action.payload
    }
  }
  return state
}
