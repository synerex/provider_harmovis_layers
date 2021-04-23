import { LayerProps, CompositeLayer,   } from '@deck.gl/core';
import { ScatterplotLayer, ColumnLayer, TextLayer } from '@deck.gl/layers';
import { MovedData, Movesbase } from 'harmoware-vis'
import { Layer } from '@deck.gl/core';
import { BarData } from '../constants/bargraph';
import { analyzeMovesBase } from 'harmoware-vis/lib/src/library';

interface BarLayerProps extends LayerProps {
    data: MovedData[];
    movesbase: Movesbase[];
    widthRatio: number;
    heightRatio: number;
    radiusRatio: number;
    currentTime: number;
    titlePositionOffset: number;
    titleSize: number;    
    showTitle: boolean;
    selectBarGraph: (barId: BarData|null) => void; 
}

const isBarData = (data: MovedData): data is BarData => {
    const bar = data as BarData;
    return bar.data !== undefined &&
        bar.shapeType !== undefined &&
        bar.width !== undefined;
}

const extractCharCode = (data: BarData[]) => {
    const charSet: string[] = []
    data.forEach((d) => {
        const text = d.text;
        if (text) {
            for (let i = 0; i < text.length; i++) {
                charSet.push(text[i])
            }
        }

    })
    return charSet;
}

export default class BarLayer extends CompositeLayer<BarLayerProps> {

  constructor(props: BarLayerProps){
    super({...props, pickable: true});
  }

  static layerName = 'BarLayer'

  getPickingInfo(obj: any) {
    if (obj.mode !== 'query') {
        return;
    }
    const { selectBarGraph } = this.props;
    const o = obj.info.object;
    if (o) {
        const data = obj.info.object;
        selectBarGraph(data);
    }
  }

  renderLayers () {
      const { data, currentTime, showTitle, visible, movesbase, heightRatio, widthRatio, radiusRatio, titlePositionOffset,titleSize } = this.props
    const barData = data.filter((b) => isBarData(b)) as BarData[]
    movesbase.forEach((base) => {
        const isExist = barData.some((data) => data.id === (base as any).id)
        if (!isExist) {
            const index = currentTime > (base.departuretime as number) ?
                base.operation.length -1:
                0;
            const tempData = base.operation[index] as BarData
            if (isBarData(tempData)) {
                barData.push(tempData)
            }
        }
    })
    const charset = extractCharCode(barData)

    const layers = [
        new ScatterplotLayer({
            id: 'bargraph-scatterplot-layer',
            visible,
            extruded: true,
            opacity: 1,
            data: barData,
            radiusScale: radiusRatio,
            pickable: true,
            onClick: (ev) => {
            },
            onHover: (ev) => {
            },
            getRadius: (d: BarData) => d.radius,
            getPosition: (d: BarData) => d.position,
            getFillColor: (d: BarData) =>  d.areaColor,
        }),

    ] as Layer[];

    if (showTitle) {
     layers.push(new TextLayer({
            id: 'bargraph-text-layer',
            data: barData,
            characterSet: charset,
            getPosition: (d: BarData) => d.position,
            getPixelOffset: () => [0, titlePositionOffset],
            fontFamily: 'Noto Sans JP',
            getSize: titleSize,
            getColor: [255,255,255],
            getTextAnchor: 'middle',
            getAlignmentBaseline: 'top',
            getText: (d: BarData) => {
                return d.text
            },
        })
     );
    }

    const columnDataMap = barData
        .flatMap( d => {
            const step = 2.5
            const numOfBar = d.data.length
            const isEven = numOfBar%2 === 0;
            const calcOffset = (index: number) => {
                const half = Math.floor(numOfBar/2)
                if (isEven) {
                    const evenOffset = index*step - half*step + step/2
                    return evenOffset
                } else {
                    return index*step - half*step
                }
            } 
            return d.data.map((vdata, index) => {
                return {
                    offset: calcOffset(index),
                    name: d.text,
                    shapeType: d.shapeType,
                    width: d.width,
                    value: vdata.value,
                    color: vdata.color,
                    label: vdata.label,
                    position: d.position
                };
            });
        })
        .reduce((prev, data) => {
            const key = data.offset+'_'+data.shapeType+'_'+data.width
            const prevData = prev[key]
            if (prevData) {
                prevData.push(data)
            } else {
                prev[key] = [data]
            }
            return prev
        }, {} as any)
    const columnlayers = Object.values(columnDataMap).map((column: any) => {
        const shapeType = column[0].shapeType;
        const width = column[0].width;
        const offset = column[0].offset;
        return new ColumnLayer({
            id: 'grid-cell-layer-' + offset + shapeType +window,
            data: column,
            extruded: true,
            pickable: true,
            diskResolution: shapeType,
            offset: [offset, 0],
            radius: width * widthRatio,
            elevationScale: heightRatio,
            getPosition: (d: any) => d.position,
            getFillColor: (d: any) => {
                return d.color
            },
            getElevation: (d: any) => d.value,
        });
    });
    return layers.concat(columnlayers)
  }
}
