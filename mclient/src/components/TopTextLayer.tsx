import * as React from 'react';

interface TopTextLayerProps {
    labelText: string,
    labelStyle: string
};
  
interface State {}

export default class TopTextLayer extends React.Component<TopTextLayerProps, State> {
    constructor (props:TopTextLayerProps) {
      super(props)
    } 
    render() {
        const { labelText, labelStyle } = this.props
        
        const css = "div.top_text_layer {"+labelStyle+"}"
        
        return (
            <div>
            <style scoped>
                {css}
            </style>
            <div className='top_text_layer' >
                {labelText}
            </div>
            </div>
     )
    }
}
