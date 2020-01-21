import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { HeatmapState, HeatmapType } from '../reducer/heatmapSettings'
import * as actions from '../actions/actions'

const HeatmapTypeSelection: React.FC = (props: any)  => {
  const state = useSelector<any, HeatmapState>(st => {
    return st.heatmapSettings
  })
  const dispatcher = useDispatch()
  const onChangeHandler = (ev: React.ChangeEvent<HTMLSelectElement>) => {
    dispatcher(actions.selectHeatmapType(ev.currentTarget.value as HeatmapType))
  }
  return (
    <select value={state.selectedType} onChange={onChangeHandler}>
      <option value={HeatmapType.Hexagon}>Hexagon</option>
      <option value={HeatmapType.Grid}>Grid</option>
    </select>
  )
}

export default HeatmapTypeSelection
