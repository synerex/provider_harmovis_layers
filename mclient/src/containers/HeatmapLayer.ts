import { LayerProps, CompositeLayer } from '@deck.gl/core'
import { HexagonLayer, GridLayer } from '@deck.gl/aggregation-layers'
import { MovedData } from 'harmoware-vis'
import { GridType } from '../constants/MapSettings'

interface HeatmapLayerProps extends LayerProps {
  type: GridType
  movedData: any[]
  size: number
  height: number
  extruded: boolean
}

export default class PolygonIconLayer extends CompositeLayer<HeatmapLayerProps> {

  static layerName = 'HeatmapLayer'

  renderLayers () {
    const { movedData, type, size, height, visible, extruded } = this.props
    const moveData = movedData.filter((b) => b.speed ) as any[]
//    console.log("Heatmap",movedData)
    if (moveData.length == 0 ){
      return []
    }

    if (type === GridType.Hexagon) {
      return [
        new HexagonLayer({
            visible,
            extruded,
            opacity: 0.1,
            elevationRange: [0,100],
            elevationScale: height,
            data: moveData,
            radius: size,
            getPosition: (d: MovedData) => [d.position[0] as number, d.position[1] as number]
          })
      ]
    } else {
      return [
        new GridLayer({
            visible,
            extruded,
            opacity: 0.1,
            elevationRange: [0,100],
            elevationScale: height,
            cellSize: size,
            data: moveData,
            getPosition: (d: MovedData) => [d.position[0] as number, d.position[1] as number]
          })
      ]
    }
  }
}
