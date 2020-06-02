import { isType } from 'typescript-fsa'
import { Action } from 'redux'
import * as actions from '../actions/actions'
import { Line } from '../constants/line'

export interface LineLayerState {
    lines: Line[]
}

const initialState: LineLayerState  = {
    lines: []
}

export default (state = initialState, action: Action): LineLayerState => {
  if (isType(action, actions.addLineData)) {
    console.log("add lines!"+action.payload.length)
    return {
      ...state,
      lines: action.payload   // may concatenate...
    }
  }
  return state
}
