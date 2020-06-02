import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { HeatmapState } from '../reducer/heatmapSettings'
import * as actions from '../actions/actions'
import { GridType } from '../constants/MapSettings'


const HeatmapTypeSelection: React.FC = (props: any)  => {
  const state = useSelector<any, HeatmapState>(st => {
    return st.heatmapSettings
  })
  const dispatcher = useDispatch()
  const onChangeHandler = (ev: React.ChangeEvent<HTMLSelectElement>) => {
    dispatcher(actions.selectHeatmapType(ev.currentTarget.value as GridType))
  }
  return (
    
    <select value={state.selectedType} onChange={onChangeHandler}>
      <option value={GridType.Hexagon}>Hexagon</option>
      <option value={GridType.Grid}>Grid</option>
    </select>
  )
}

export default HeatmapTypeSelection
