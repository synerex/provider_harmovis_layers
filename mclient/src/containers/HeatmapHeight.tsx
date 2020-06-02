import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { HeatmapState } from '../reducer/heatmapSettings'
import * as actions from '../actions/actions'

interface HeatmapHeightProps {
  min?: number
  max?: number
}

const HeatmapHeight: React.FC<HeatmapHeightProps> = (props: HeatmapHeightProps)  => {
  const state = useSelector<any, HeatmapState>(st => {
    return st.heatmapSettings
  })
  const dispatcher = useDispatch()
  const onChangeHandler = (ev: React.ChangeEvent<HTMLInputElement>) => {
//    console.log("ChangeHeight"+ev.currentTarget.value)
    dispatcher(actions.setHeatmapHeight(parseInt(ev.currentTarget.value)))
  }
  const { min, max } = props
  return (<div>
    {state.gridHeight}
    <input
      type='range'
      value={state.gridHeight}
      onChange={onChangeHandler}
      min={min}
      max={max}
    />
  </div>)
}

HeatmapHeight.defaultProps = {
  min: 1,
  max: 50
}

export default HeatmapHeight
