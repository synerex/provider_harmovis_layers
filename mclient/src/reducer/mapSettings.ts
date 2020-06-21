import { isType } from 'typescript-fsa'
import { Action } from 'redux'
import * as actions from '../actions/actions'

export interface MapLayerState {
    mapVisible: boolean; 
    agentColor: number[];
}

const initialState: MapLayerState  = {
    mapVisible: true, 
    agentColor: [0,219,58,220],
}

export default (state = initialState, action: Action): MapLayerState => {
    if (isType(action, actions.setMapVisible)) {
        return {
            ...state,
            mapVisible: action.payload
        }
    }
    if (isType(action, actions.setAgentColor)) {
        return {
            ...state,
            agentColor: action.payload
        }
    }

    return state
}
