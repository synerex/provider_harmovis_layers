import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { HeatmapState } from '../reducer/heatmapSettings'
import * as actions from '../actions/actions'

const ToggleHeatMap: React.FC<any> = prop  => {
  const state = useSelector<any, HeatmapState>(st => {
    return st.heatmapSettings
  })
  const dispatcher = useDispatch()
  const onChangeHandler = (ev: React.ChangeEvent<HTMLInputElement>) => {
    dispatcher(actions.toggleHeatmap(ev.currentTarget.checked))
  }
  return (<div>
    <input
      type='checkbox'
      checked={state.enabledHeatmap}
      onChange={onChangeHandler}
    />
    {state.enabledHeatmap ? '  ENABLED' : '  DISABLED'}
  </div>)
}

export default ToggleHeatMap
