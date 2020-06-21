import * as React from 'react'
import { DepotsInput,
  AddMinutesButton, PlayButton, PauseButton, ReverseButton, ForwardButton,
  ElapsedTimeRange, ElapsedTimeValue, SpeedRange, SpeedValue, SimulationDateTime,
  NavigationButton, BasedProps, ClickedObject, RoutePaths } from 'harmoware-vis'
import { Icon } from 'react-icons-kit'
import { ic_delete_forever as icDeleteForever, ic_save as icSave,
  ic_layers as icLayers, ic_delete as icDelete } from 'react-icons-kit/md'

import HeatmapRaidusRange from '../containers/HeatmapRaidusRange'
import HeatmapHeight from '../containers/HeatmapHeight'
import ToggleHeatMap from '../containers/ToggleHeatMap'
import Toggle3DHeatmap from '../containers/Toggle3DHeatmap'
import HeatmapTypeSelection from '../containers/HeatmapSelection'
import BargraphController from './BarGraphController'
import MeshLayerController from './MeshLayerController'
import MapLayerController from './MapLayerController'

// for clearArc / Scatter
import * as actions from '../actions/actions'
import store from '../store'


//import { HeatmapState } from '../reducer/heatmapSettings'

/*interface Props extends BasedProps{
  deleteMovebase?: (maxKeepSecond: number) => void,
  getMoveDataChecked?: (e: React.ChangeEvent<HTMLInputElement>) => void,
  getMoveOptionChecked?: (e: React.ChangeEvent<HTMLInputElement>) => void,
  getDepotOptionChecked?: (e: React.ChangeEvent<HTMLInputElement>) => void,
  getOptionChangeChecked?: (e: React.ChangeEvent<HTMLInputElement>) => void,
}

interface State {
  currentGroupindex: number,
  routeGroupDisplay: boolean,
  saveRouteGroup: {
    clickedObject: ClickedObject[],
    routePaths: RoutePaths[],
  }[]
}
*/

interface ControllerProps {
  deleteMovebase: any,
  actions : any,
  clickedObject: any,
  routePaths: any,
  settime: any, 
  timeBegin: any, 
  leading: any, 
  timeLength: number, 
  secperhour: number, 
  animatePause: boolean, 
  animateReverse: boolean,
  getMoveDataChecked: any, 
  getMoveOptionChecked: any, 
  getDepotOptionChecked: any ,
  getOptionChangeChecked: any, 
  inputFileName: any, 
  viewport: any ,
  movesbase: any
}

interface ContState {
  currentGroupindex: number,
  routeGroupDisplay: boolean,
  saveRouteGroup: {
    clickedObject: ClickedObject[],
    routePaths: RoutePaths[],
  }[]

}

export default class Controller extends React.Component<ControllerProps, ContState> {
    constructor (props:ControllerProps) {
      super(props)
      this.state = {
        currentGroupindex: 0,
       routeGroupDisplay: false,
       saveRouteGroup: [],
      }
  }

  deleteMovebase (maxKeepSecond : any) {
    this.props.deleteMovebase(maxKeepSecond)
  }

  deleteArcScatterbase(){    
    // show current viewport and objs.
    console.log("viewport:",this.props.viewport)
    console.log("movesbase:",this.props.movesbase)
    store.dispatch(actions.clearArcData())
    store.dispatch(actions.clearScatterData())
    store.dispatch(actions.addLineData([]))// clear line
    store.dispatch(actions.addGeoJsonData(""))
  }

  clearAllRoute () {
    this.props.actions.setClicked(null)
    this.props.actions.setRoutePaths([])
    this.setState({ currentGroupindex: 0, routeGroupDisplay: false, saveRouteGroup: [] })
  }

  saveRouteGroup () {
    const { clickedObject, routePaths, actions } = this.props
    if (clickedObject && routePaths.length > 0) {
      const { saveRouteGroup } = this.state
      const currentGroupindex = saveRouteGroup.length
      const routeGroupDisplay = false
      this.setState({ currentGroupindex,
        routeGroupDisplay,
        saveRouteGroup: [
          ...saveRouteGroup, { clickedObject, routePaths }
        ] })
      actions.setClicked(null)
      actions.setRoutePaths([])
    }
  }

  displayRouteGroup () {
    const { currentGroupindex, saveRouteGroup } = this.state
    if (saveRouteGroup.length > 0) {
      const { clickedObject, routePaths, actions } = this.props
      let displayIndex = currentGroupindex
      let routeGroupDisplay = true
      if (clickedObject && routePaths.length > 0) {
        displayIndex = currentGroupindex < (saveRouteGroup.length - 1) ? currentGroupindex + 1 : 0
        if (displayIndex === 0) {
          routeGroupDisplay = false
        }
      }
      if (routeGroupDisplay) {
        actions.setClicked(saveRouteGroup[displayIndex].clickedObject)
        actions.setRoutePaths(saveRouteGroup[displayIndex].routePaths)
      } else {
        actions.setClicked(null)
        actions.setRoutePaths([])
      }
      this.setState({ currentGroupindex: displayIndex, routeGroupDisplay })
    }
  }

  deleteRouteGroup () {
    const { currentGroupindex, routeGroupDisplay, saveRouteGroup } = this.state
    if (saveRouteGroup.length > 0 && routeGroupDisplay) {
      const newSaveRouteGroup = saveRouteGroup.filter(
        (current, index) => index !== currentGroupindex)
      this.setState({ currentGroupindex: 0,
        routeGroupDisplay: false,
        saveRouteGroup: [...newSaveRouteGroup] })
      const { clickedObject, routePaths, actions } = this.props
      if (clickedObject && routePaths.length > 0) {
        actions.setClicked(null)
        actions.setRoutePaths([])
      }
    }
  }

  render () {
    const { settime, timeBegin, leading, timeLength, actions,
      secperhour, animatePause, animateReverse,
      getMoveDataChecked, getMoveOptionChecked, getDepotOptionChecked,
      getOptionChangeChecked, inputFileName, viewport } = this.props

    const { currentGroupindex, routeGroupDisplay, saveRouteGroup } = this.state
    const displayIndex = saveRouteGroup.length ? currentGroupindex + 1 : 0
    const { depotsFileName } = inputFileName

    return (
      <div className='harmovis_controller'>
        <div className='container'>
          <ul className='list-group'>
            <li>
              <div className='form-check'>
                <input type='checkbox' id='MoveDataChecked' onChange={getMoveDataChecked} className='form-check-input' defaultChecked={true} />
                <label htmlFor='MoveDataChecked' className='form-check-label'>移動データ表示</label>
              </div>
            </li>
            <li>
              <div className='form-check'>
                <input type='checkbox' id='MoveOptionChecked' onChange={getMoveOptionChecked} className='form-check-input' />
                <label htmlFor='MoveOptionChecked' className='form-check-label'>移動データオプション表示</label>
              </div>
            </li>
            {/*
            <li>
              <div className='form-check'>
                <input type='checkbox' id='DepotOptionChecked' onChange={getDepotOptionChecked} className='form-check-input' />
                <label htmlFor='DepotOptionChecked' className='form-check-label'>停留所データオプション表示</label>
              </div>
            </li>
            <li>
              <div className='form-check'>
                <input type='checkbox' id='OptionChangeChecked' onChange={getOptionChangeChecked} className='form-check-input' />
                <label htmlFor='OptionChangeChecked' className='form-check-label'>オプション表示パターン切替</label>
              </div>
            </li>
            */}

            <li><span>ナビゲーションパネル</span>
              <div className='btn-group d-flex' role='group'>
                <NavigationButton buttonType='zoom-in' actions={actions} viewport={viewport} className='btn btn-outline-light btn-sm w-100' />
                <NavigationButton buttonType='zoom-out' actions={actions} viewport={viewport} className='btn btn-outline-light btn-sm w-100' />
                <NavigationButton buttonType='compass' actions={actions} viewport={viewport} className='btn btn-outline-light btn-sm w-100' />
              </div>
            </li>            

            <li>　{/*<span>コントロールパネル</span>*/}
              <div className='btn-group d-flex' role='group'>
                {animatePause ?
                  <PlayButton actions={actions} className='btn btn-outline-light btn-sm w-100' /> :
                  <PauseButton actions={actions} className='btn btn-outline-light btn-sm w-100' />
                }
                {animateReverse ?
                  <ForwardButton actions={actions} className='btn btn-outline-light btn-sm w-100' /> :
                  <ReverseButton actions={actions} className='btn btn-outline-light btn-sm w-100' />
                }
              </div>
              {/* we do no need specific time control 
               <div className='btn-group d-flex' role='group'>
                <AddMinutesButton addMinutes={-5} actions={actions} className='btn btn-outline-light btn-sm w-100' />
                <AddMinutesButton addMinutes={-1} actions={actions} className='btn btn-outline-light btn-sm w-100' />
              </div>
              <div className='btn-group d-flex' role='group'>
                <AddMinutesButton addMinutes={1} actions={actions} className='btn btn-outline-light btn-sm w-100' />
                <AddMinutesButton addMinutes={5} actions={actions} className='btn btn-outline-light btn-sm w-100' />
              </div>
              */}
            </li>
            <li>
              再現中日時&nbsp;<SimulationDateTime settime={settime} />
            </li>
            <li>
            <label htmlFor='ElapsedTimeRange'>経過時間<ElapsedTimeValue settime={settime} timeBegin={timeBegin} timeLength={Math.floor(timeLength)} actions={actions} />秒&nbsp;/&nbsp;全体&nbsp;{Math.floor(timeLength)}&nbsp;秒</label>
            <ElapsedTimeRange settime={settime} timeLength={Math.floor(timeLength)} timeBegin={timeBegin} min={-leading} actions={actions} id='ElapsedTimeRange' className='form-control-range' />
            </li>
            <li>
              <label htmlFor='SpeedRange'>スピード<SpeedValue secperhour={secperhour} actions={actions} />秒/時</label>
              <SpeedRange secperhour={secperhour} actions={actions} id='SpeedRange' className='form-control-range' />
            </li>
            <li>
              <div className='btn-group d-flex' role='group'>
                <button onClick={this.deleteMovebase.bind(this,0)} className='btn btn-outline-light btn-sm w-100'>
                  <span className='button_span'><Icon icon={icDelete} />Clear Move</span>
                </button>
                <button onClick={this.deleteArcScatterbase.bind(this,0)} className='btn btn-outline-light btn-sm w-100'>
                  <span className='button_span'><Icon icon={icDelete} />Clear Obj</span>
                </button>
              </div>
            </li>
          </ul>
              
          <div className="option-list"> 
            <label htmlFor="item0">マップ表示設定</label>
            <input type="checkbox" id="item0"></input> 
            <MapLayerController actions={actions} viewport={viewport}/>

            <label htmlFor="item1">ヒートマップの設定</label>
            <input type="checkbox" id="item1"></input> 
            <ul>
              <li>
                ヒートマップ表示: <ToggleHeatMap />
              </li>
              <li>
                3次元表示: <Toggle3DHeatmap />
              </li>
              <li>
                グリッドサイズ(m): <HeatmapRaidusRange />
              </li>
              <li>
                高さスケール(m): <HeatmapHeight />
              </li>
              <li>
                グリッド形式: <HeatmapTypeSelection />
              </li>
            </ul>

            <label htmlFor="item2">棒グラフの設定</label>
            <input type="checkbox" id="item2"></input> 
            <BargraphController />

            <label htmlFor="item3">メッシュの設定</label>
            <input type="checkbox" id="item3"></input> 
            <MeshLayerController />
         </div>
        </div>
      </div>
    )
  }
}
