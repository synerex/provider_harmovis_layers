import * as React from 'react'
import BarWidth from './BarWidth'
import BarRadius from './AreaRadius'
import BarHeight from './BarHeight'
import TitleOffset from './TitlePositionOffset'
import ShowTitle from './ShowTitle'

export default function BargraphController() {

    return (
              <ul>
                <li>
                  エリアの広さ(倍率): <BarRadius/>
                </li>
                <li>
                  グラフの高さ(倍率): <BarHeight />
                </li>
                <li>
                  グラフの幅(倍率): <BarWidth />
                </li>
                <li>
                  タイトル表示・サイズ: <ShowTitle /> 
                </li>
                <li>
                  タイトルのオフセット(px): <TitleOffset />
                </li>
              </ul>
    )
}

