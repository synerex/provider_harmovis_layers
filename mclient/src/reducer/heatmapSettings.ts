import { isType } from 'typescript-fsa'
import { Action } from 'redux'
import * as actions from '../actions/actions'

export enum HeatmapType {
  Hexagon= 'Hexagon',
  Grid= 'Grid'
}

export interface HeatmapState {
  selectedType: HeatmapType
  particleCount: number
  gridSize: number
  gridHeight: number
  enabledHeatmap: boolean
  extruded: boolean
}

const initialState: HeatmapState  = {
  selectedType: HeatmapType.Hexagon,
  enabledHeatmap: true,
  gridSize: 40,
  gridHeight: 10,
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
