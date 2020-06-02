import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import * as actions from '../../actions/actions'
import { BarGraphState } from '../../reducer/barGraphSettings'

interface BarHeightProps {
  min?: number
  max?: number
}

const BarRadius: React.FC<BarHeightProps> = (props)  => {
  const state = useSelector<any, BarGraphState>(st => {
    return st.barGraphSettings
  })
  const dispatcher = useDispatch()
  const onChangeHandler = (ev: React.ChangeEvent<HTMLInputElement>) => {
    console.log("ChangeRadius"+ev.currentTarget.value)
    dispatcher(actions.changeBarRadius(parseInt(ev.currentTarget.value)))
  }
  const { min, max } = props
  return (<div>
    {state.radiusRatio}
    <input
      type='range'
      step={0.1}
      value={state.radiusRatio}
      onChange={onChangeHandler}
      min={min}
      max={max}
    />
  </div>)
}

BarRadius.defaultProps = {
  min: 1,
  max: 10
}

export default BarRadius;
