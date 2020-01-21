import { LayerProps, CompositeLayer, HexagonLayer, GridLayer } from 'deck.gl'
import { MovedData } from 'harmoware-vis'
import { HeatmapType } from '../reducer/heatmapSettings'

interface HeatmapLayerProps extends LayerProps {
  type: HeatmapType
  movedData: MovedData[]
  size: number
  height: number
  extruded: boolean
}

export default class PolygonIconLayer extends CompositeLayer<HeatmapLayerProps> {

  static layerName = 'HeatmapLayer'

  renderLayers () {
    const { movedData, type, size, height, visible, extruded } = this.props
    if (type === HeatmapType.Hexagon) {
      return [
        new HexagonLayer({
            visible,
            extruded,
            opacity: 0.1,
            elevationRange: [0,100],
            elevationScale: height,
            data: movedData,
            radius: size,
            getPosition: (d: MovedData) => [d.longitude as number, d.latitude as number]
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
            data: movedData,
            getPosition: (d: MovedData) => [d.longitude as number, d.latitude as number]
          })
      ]
    }
  }
}
