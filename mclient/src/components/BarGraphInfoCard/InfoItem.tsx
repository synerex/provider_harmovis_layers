import * as React from 'react'
import { DataItem } from "../../constants/bargraph";
import './style.scss'

const InfoItem: React.FC<{dataItem: DataItem}> = props => {
    const { color, label, value } = props.dataItem;
    const colorStyle = `rgb(${color[0]}, ${color[1]}, ${color[2]})`
    return (<div>
        <div className={'bargraph-carditem'}>
            <div className={'bargraph-carditem__content'}>
                <div className="bargraph-carditem__start">
                    <div style={{
                        backgroundColor: colorStyle,
                        width: '20px',
                        height: '20px'
                    }}/>
                </div>
                <div className="bargraph-carditem__end">
                    <div>
                        {label}
                    </div>
                    <div>
                        {value}
                    </div>
                </div>
            </div>
        </div>
    </div>);
}

export default React.memo(InfoItem);
