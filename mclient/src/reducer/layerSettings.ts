import { isType } from 'typescript-fsa'
import { Action } from 'redux'
import * as actions from '../actions/actions'
import { Line } from '../constants/line'
import { Arc, Scatter} from '../constants/geoObjects'

export interface LineLayerState {
    lines: Line[]
}

const initialLineState: LineLayerState  = {
    lines: []
}

export interface ArcLayerState {
  arcs: Arc[],
  arcVisible: boolean
}

const initialArcState: ArcLayerState  = {
  arcs: [] ,
  arcVisible: true
}

export interface ScatterLayerState {
  scatters: Scatter[],
  scatterMode: string,
  scatterFill: boolean,
  scatterVisible: boolean
}

const initialScatterState: ScatterLayerState  = {
  scatters: [],
  scatterMode: 'pixel',
  scatterFill: true,
  scatterVisible: true
}

export interface TopTextLayerState {
  labelText: string,
  labelStyle: string
}

const initialTopTextLayerState: TopTextLayerState  = {
  labelText: "",
  labelStyle:""
}


export const lineSettings = (state = initialLineState, action: Action): LineLayerState => {
  if (isType(action, actions.addLineData)) {
    console.log("add lines!"+action.payload.length)
    return {
      ...state,
      lines: action.payload   // may concatenate...
    }
  }
  return state
}

export const arcSettings = (state = initialArcState, action: Action): ArcLayerState => {
  if (isType(action, actions.addArcData)) {
    console.log("add Arcs:"+action.payload.length)
    let newarcs = state.arcs.concat(action.payload)
    console.log("result Arcs:"+newarcs.length)
    return {
      ...state,
      arcs: newarcs
    }
  }else if (isType(action, actions.clearArcData)) {
    console.log("clear Arcs")
    return {
      ...state,
      arcs: []
    }
  }
  return state
}

export const scatterSettings = (state = initialScatterState, action: Action): ScatterLayerState => {
  if (isType(action, actions.addScatterData)) {
      console.log("add Scatter:"+action.payload.length)
      let newscs = state.scatters.concat(action.payload)
      return {
        ...state,
        scatters: action.payload   // may concatenate...
      }
  } else if (isType(action, actions.clearScatterData)) {
      console.log("clear Arcs")
      return {
        ...state,
        scatters: []
      }
  } else if (isType(action, actions.setScatterInfo)) {
      console.log("setInfo")
      const scat: any =action.payload 
      return {
          ...state,
          scatterMode: scat.scatteMode,
          scatterFill: scat.scatterFill
      }
  }
  return state
}



export const topTextReducer = (state = initialTopTextLayerState, action: Action): TopTextLayerState=> {
  if (isType(action, actions.setTopLabelInfo)) {
    console.log("add LabelInfo!",action.payload)
    return {
      ...state,
      labelText: action.payload.label,   // may concatenate...
      labelStyle: action.payload.style
    }
  }
  return state
}