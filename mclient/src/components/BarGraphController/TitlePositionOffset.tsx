import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import * as actions from '../../actions/actions'
import { BarGraphState } from '../../reducer/barGraphSettings'

interface BarHeightProps {
  min?: number
  max?: number
}

const TitlePositionOffset: React.FC<BarHeightProps> = (props)  => {
  const state = useSelector<any, BarGraphState>(st => {
    return st.barGraphSettings
  })
  const dispatcher = useDispatch()
  const onChangeHandler = (ev: React.ChangeEvent<HTMLInputElement>) => {
    dispatcher(actions.changeBarTitlePosOffset(parseInt(ev.currentTarget.value)))
  }
  const { min, max } = props
  return (<div>
    {state.titlePosOffset}
    <input
      type='range'
      value={state.titlePosOffset}
      onChange={onChangeHandler}
      min={min}
      max={max}
    />
  </div>)
}

TitlePositionOffset.defaultProps = {
  min: 1,
  max: 200
}

export default TitlePositionOffset;
