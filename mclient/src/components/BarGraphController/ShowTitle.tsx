import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import * as actions from '../../actions/actions'
import { BarGraphState } from '../../reducer/barGraphSettings'

interface BarHeightProps {
  min?: number
  max?: number
}

const ShowTitle: React.FC<BarHeightProps> = (props)  => {
  const state = useSelector<any, BarGraphState>(st => {
    return st.barGraphSettings
  })
  const dispatcher = useDispatch()
  const { showTitle } = state;
  const onChangeHandler = (ev: React.ChangeEvent<HTMLInputElement>) => {
//    console.log("toggle show title" + ev.currentTarget.value)
    dispatcher(actions.showBarTitle(!showTitle))
  }
    const onChangeSizeHandler = (ev: React.ChangeEvent<HTMLInputElement>) => {
    dispatcher(actions.changeBarTitleSize(parseInt(ev.currentTarget.value)))	
    }
  const { min, max } = props
  return (<div>
    <input
      type="checkbox"
      checked={showTitle}
      onChange={onChangeHandler}
      />
    {state.titleSize}
    <input
      type='range'
      value={state.titleSize}
      onChange={onChangeSizeHandler}
      min={min}
      max={max}
    />
      
  </div>)
}

ShowTitle.defaultProps = {
  min: 5,
  max: 60
}


export default ShowTitle;
