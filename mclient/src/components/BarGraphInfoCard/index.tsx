import * as React from 'react'
import { BarData } from "../../constants/bargraph";
import InfoItem from './InfoItem';
import './style.scss'

const BarGraphInfoCard: React.FC<{ data: BarData, onClose: () => void }> = props => {
    const { data, onClose } = props;
    return (<div className={'bargraph-card'}>
        <div className={'bargraph-card__header'}>
            <div>
                {data.text}
            </div>
            <div  role="button" onClick={onClose}>
                <img src="./close.png" />     
            </div>
        </div>
        <div className={'bargraph-card__content'}>
        {
            data.data &&
            data.data.map(d => {
                return <InfoItem
                    dataItem={d}
                />
            })
        }
        </div>
    </div>);
}

export default BarGraphInfoCard; 
