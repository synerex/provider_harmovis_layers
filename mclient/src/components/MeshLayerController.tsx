import * as React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { MeshLayerState } from '../reducer/meshLayerSettings'
import * as actions from '../actions/actions'

export interface MeshContProps {
    meshVisible?: boolean; 
    mesh3D?: boolean;  // for 3d or not
    meshWire?: boolean; // mesh with wireframe?
    meshRadius?: number;     // meshRaduis
    meshPolyNum?: number;    // how many corner.(3~)
    meshAngle?: number;
    meshHeight?: number;
}

// React functional component for future optimization.
const MeshLayerController: React.FC<MeshContProps> = (prpos) => {

    const state = useSelector<any, MeshLayerState>(st => {
        return st.meshLayerSettings
    })
    const dispatcher = useDispatch()
    const onMeshVisibleHandler = (ev: React.ChangeEvent<HTMLInputElement>) => {
        dispatcher(actions.setMeshVisible(ev.currentTarget.checked))
    }
    const onMesh3DHandler = (ev: React.ChangeEvent<HTMLInputElement>) => {
        dispatcher(actions.setMesh3D(ev.currentTarget.checked))
    }
    const onMeshWireHandler = (ev: React.ChangeEvent<HTMLInputElement>) => {
        dispatcher(actions.setMeshWire(ev.currentTarget.checked))
    }
    const onMeshRadiusHandler = (ev: React.ChangeEvent<HTMLInputElement>) => {
        dispatcher(actions.setMeshRadius(parseInt(ev.currentTarget.value)))
    }
    const onMeshHeightHandler = (ev: React.ChangeEvent<HTMLInputElement>) => {
        dispatcher(actions.setMeshHeight(parseInt(ev.currentTarget.value)))
    }
    const onMeshPolyNumHandler = (ev: React.ChangeEvent<HTMLInputElement>) => {
        dispatcher(actions.setMeshPolyNum(parseInt(ev.currentTarget.value)))
    }
    const onMeshAngleHandler = (ev: React.ChangeEvent<HTMLInputElement>) => {
        dispatcher(actions.setMeshAngle(parseInt(ev.currentTarget.value)))
    }
    
    return (
              <ul>
               <li>
                メッシュレイヤー表示:
                <div>
                    <input
                        type='checkbox'   checked={state.meshVisible} onChange={onMeshVisibleHandler}
                    />
                        {state.meshVisible ? '  ENABLED' : '  DISABLED'}
                </div>
              </li>
              <li>
                3次元表示:
                <div>
                    <input
                        type='checkbox' checked={state.mesh3D} onChange={onMesh3DHandler}
                    />
                        {state.mesh3D ? '  ENABLED' : '  DISABLED'}
                </div>
              </li>
              <li>
                ワイヤーフレーム表示:
                <div>
                    <input
                        type='checkbox' checked={state.meshWire} onChange={onMeshWireHandler}
                    />
                        {state.meshWire ? '  ENABLED' : '  DISABLED'}
                </div>
              </li>
              <li>
                グリッドサイズ(m): 
                <div>{state.meshRadius}
                    <input type='range' value={state.meshRadius} onChange={onMeshRadiusHandler}
                      min={1} max={1000}/>
                </div>
              </li>
              <li>
                高さスケール(m):
                <div>{state.meshHeight}
                    <input type='range' value={state.meshHeight} onChange={onMeshHeightHandler}
                      min={1} max={50}/>
                </div>
              </li>
              <li>
                メッシュ形式(角):
                <div>{state.meshPolyNum}
                    <input type='range' value={state.meshPolyNum} onChange={onMeshPolyNumHandler}
                      min={3} max={16}/>
                </div>
              </li>
              <li>
                メッシュ角度(度):
                <div>{state.meshAngle}
                    <input type='range' value={state.meshAngle} onChange={onMeshAngleHandler}
                      min={0} max={60}/>
                </div>
              </li>
              </ul>
    )
}

export default MeshLayerController;


