import { LayerProps, CompositeLayer } from '@deck.gl/core'
import { ColumnLayer } from '@deck.gl/layers';
import { MovedData, Movesbase } from 'harmoware-vis'
import { Layer } from '@deck.gl/core';
import { MeshData } from '../constants/meshdata';
import { analyzeMovesBase } from 'harmoware-vis/lib/src/library';

interface MeshLayerProps extends LayerProps {
    data: any[];
    movesbase: Movesbase[];
    currentTime: number;
    mesh3D: boolean;  // for 3d or not
    meshRadius: number;     // meshRaduis
    meshPolyNum: number;    // how many corner.(3~)
    meshAngle: number;
    meshHeightRatio: number;
    meshWire: boolean; // mesh with wireframe?
}

export default class MeshLayer extends CompositeLayer<MeshLayerProps> {

  constructor(props: MeshLayerProps){
    super(props);
  }

  static layerName = 'MeshLayer'

  renderLayers () {
    const { data, currentTime, visible, movesbase,meshAngle,meshWire, meshHeightRatio, mesh3D, meshRadius,meshPolyNum } = this.props

    const meshData = data.filter((b) => b.meshItems) as MeshData[]
//    console.log("mesh",data)
//    console.log("meshAll",movesbase)
    if( meshData.length == 0){
        return []
    }
//    console.log("dt",meshData[0].meshItems)
    const allItems = meshData.map((d:any)=>d.meshItems).flat()

    const layerProps = {
        id: this.props.id+'-mesh-layer',
        data: allItems, 
        extruded: mesh3D,
        pickable: true,
        diskResolution: meshPolyNum,
        radius: meshRadius,
        angle: meshAngle,
        wireframe: meshWire,
        elevationScale: meshHeightRatio,
        getPosition: (d: any) => d.pos,
        getFillColor: (d: any) => d.col,
        getLineColor: [128, 128, 128,200],
        getElevation: (d: any) => d.val
    }

    return [
        new ColumnLayer(layerProps)
    ];
  }
}
