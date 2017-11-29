import React, {Component} from 'react';
import IconButton from 'material-ui/IconButton';
import ExpandMore from 'material-ui/svg-icons/navigation/expand-more';
import ExpandLess from 'material-ui/svg-icons/navigation/expand-less';

/** Expandable panel component for the project sidebar. Panel examples: Filter, export.. */
export default class Panel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: props.defaultOpen,
    }
  }
  
  handleChange = (type, value) => {
    this.setState({[type]: value});
  }

  render() {
    let paddingStyle = this.props.noPadding?{padding:0}:{};
    return (
      <div className="panel">
        <div className="header">
          <h1>{this.props.title}</h1>
          <IconButton 
            onClick={(e)=>{e.preventDefault(); e.stopPropagation(); this.handleChange("open", !this.state.open)}}
            aria-label={this.state.open?"Hide " + this.props.title + " panel" :  "Expand " + this.props.title + " panel"}
            iconStyle={{color:"white"}}
            tooltip={this.state.open?"Hide panel":"Expand panel"}
            style={{padding:0,width:"inherit",height:"inherit"}}
            tooltipPosition="bottom-left"
            tabIndex={this.props.tabIndex}
          >
            {this.state.open? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </div>
        <div className={this.state.open?"content":"content hidden"} style={paddingStyle}>
          {this.props.children}
        </div>
      </div>
    )
  }

}
