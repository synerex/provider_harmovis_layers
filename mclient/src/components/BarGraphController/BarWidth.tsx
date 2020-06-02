import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import * as actions from '../../actions/actions'
import { BarGraphState } from '../../reducer/barGraphSettings'

interface BarHeightProps {
  min?: number
  max?: number
}

const BarWidth: React.FC<BarHeightProps> = (props)  => {
  const state = useSelector<any, BarGraphState>(st => {
    return st.barGraphSettings
  })
  const dispatcher = useDispatch()
  const onChangeHandler = (ev: React.ChangeEvent<HTMLInputElement>) => {
    console.log("ChangeWidth"+ev.currentTarget.value)
    dispatcher(actions.changeBarWidth(parseInt(ev.currentTarget.value)))
  }
  const { min, max } = props
  return (<div>
    {state.widthRatio}
    <input
      type='range'
      value={state.widthRatio}
      onChange={onChangeHandler}
      min={min}
      max={max}
    />
  </div>)
}

BarWidth.defaultProps = {
  min: 1,
  max: 200
}

export default BarWidth;
