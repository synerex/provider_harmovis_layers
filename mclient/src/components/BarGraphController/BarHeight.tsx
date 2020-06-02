import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import * as actions from '../../actions/actions'
import { BarGraphState } from '../../reducer/barGraphSettings'

interface BarHeightProps {
  min?: number
  max?: number
}

const BarHeight: React.FC<BarHeightProps> = (props)  => {
  const state = useSelector<any, BarGraphState>(st => {
    return st.barGraphSettings
  })
  const dispatcher = useDispatch()
  const onChangeHandler = (ev: React.ChangeEvent<HTMLInputElement>) => {
//    console.log("ChangeHeight"+ev.currentTarget.value)
    dispatcher(actions.changeBarHeight(parseInt(ev.currentTarget.value)))
  }
  const { min, max } = props
  return (<div>
    {state.heightRatio}
    <input
      type='range'
      value={state.heightRatio}
      onChange={onChangeHandler}
      min={min}
      max={max}
    />
  </div>)
}

BarHeight.defaultProps = {
  min: 1,
  max: 200
}

export default BarHeight;
