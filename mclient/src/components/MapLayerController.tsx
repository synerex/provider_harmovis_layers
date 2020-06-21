import * as React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { MapLayerState } from '../reducer/mapSettings'
import * as actions from '../actions/actions'

export interface MapContProps {
    actions?: any;
    viewport?: any;
}

// React functional component for future optimization.
const MapLayerController: React.FC<MapContProps> = (props) => {

    const state = useSelector<any, MapLayerState>(st => {
        return st.mapSettings
    })
    const dispatcher = useDispatch()
    const onMapVisibleHandler = (ev: React.ChangeEvent<HTMLInputElement>) => {
        dispatcher(actions.setMapVisible(ev.currentTarget.checked))
        if (ev.currentTarget.checked){
            let pt = props.viewport.pitch;
            if (pt >59.999) pt=59.999
            props.actions.setViewport({pitch:pt, maxPitch:60})
        }else{
            props.actions.setViewport({maxPitch:90})
        }
    }
 //   const onMesh3DHandler = (ev: React.ChangeEvent<HTMLInputElement>) => {
 //       dispatcher(actions.setMesh3D(ev.currentTarget.checked))
 //   }
    
    return (
              <ul>
               <li>
                マップレイヤー表示:
                <div>
                    <input
                        type='checkbox'   checked={state.mapVisible} onChange={onMapVisibleHandler}
                    />
                        {state.mapVisible ? '  ENABLED' : '  DISABLED'}
                </div>
              </li>

              </ul>
    )
}

export default MapLayerController;


