import { isType } from 'typescript-fsa'
import { Action } from 'redux'
import * as actions from '../actions/actions'

export interface MeshLayerState {
    meshVisible: boolean; 
    mesh3D: boolean;  // for 3d or not
    meshWire: boolean; // mesh with wireframe?
    meshRadius: number;     // meshRaduis
    meshPolyNum: number;    // how many corner.(3~)
    meshAngle: number;
    meshHeight: number;
}

const initialState: MeshLayerState  = {
    meshVisible: true, 
    mesh3D: true,  // for 3d or not
    meshWire: true, // mesh with wireframe?
    meshRadius: 100,  // meshRaduis
    meshPolyNum: 4,    // how many corner.(3~)
    meshAngle:  45,
    meshHeight: 5,
}

export default (state = initialState, action: Action): MeshLayerState => {
    if (isType(action, actions.setMeshVisible)) {
        return {
            ...state,
            meshVisible: action.payload
        }
    }
    if (isType(action, actions.setMesh3D)) {
        return {
            ...state,
            mesh3D: action.payload
        }
    }
    if (isType(action, actions.setMeshWire)) {
        return {
            ...state,
            meshWire: action.payload
        }
    }
    if (isType(action, actions.setMeshRadius)) {
        return {
            ...state,
            meshRadius: action.payload
        }
    }
    if (isType(action, actions.setMeshHeight)) {
        return {
            ...state,
            meshHeight: action.payload
        }
    }
    if (isType(action, actions.setMeshPolyNum)) {
        return {
            ...state,
            meshPolyNum: action.payload
        }
    }
    if (isType(action, actions.setMeshAngle)) {
        return {
            ...state,
            meshAngle: action.payload
        }
    }

    return state
}
