import React, {Component} from 'react';
import TextField from 'material-ui/TextField';
import Checkbox from 'material-ui/Checkbox';
import {floatFieldLight} from '../../styles/textfield';

/** Filter terms */
class TermsFilter extends Component {

  constructor(props) {
    super(props);
    this.state = {
      value: "",
    }
  }
 
  render() {
    return ( 
      <div className="termSearch">
        <div className="searchTextbox">
          <TextField 
            aria-label="Search terms"
            id="searchTermField"
            hintText="Search terms ..."
            onChange={(e,value)=>{this.setState({value});this.props.onValueChange(e,value)}}
            style={window.innerWidth<=890?{marginLeft:10,marginRight:10, width:150}:{marginLeft:10,marginRight:10, width:200}}
            value={this.state.value}
            {...floatFieldLight}
            tabIndex={this.props.tabIndex}
          />
        </div>
        <div className={(this.state.value.length>0)?"searchOptions active":"searchOptions"}>
          <Checkbox 
            aria-label="Search term titles"
            label="Title" 
            iconStyle={{marginRight: 0, height:20, width:20}} 
            style={{width: 60, paddingRight: 0, display: 'inline-flex', fontSize:14}}
            checked={this.props.filterTypes["title"]}
            onClick={()=>this.props.onTypeChange("title", !this.props.filterTypes["title"])}
            tabIndex={this.props.tabIndex}
          />
          <Checkbox 
            aria-label="Search taxonomies"
            label="Taxonomy"
            iconStyle={{marginRight: 0, height:20, width:20}} 
            style={{width: 55, paddingRight: 0, display: 'inline-flex', fontSize:14}}
            checked={this.props.filterTypes["type"]}
            onClick={()=>this.props.onTypeChange("type", !this.props.filterTypes["type"])}
            tabIndex={this.props.tabIndex}
          />
          <Checkbox 
            aria-label="Search term descriptions"
            label="Description" 
            iconStyle={{marginRight: 0, height:20, width:20}} 
            style={{width: 50, paddingRight: 0, display: 'inline-flex', fontSize:14}}
            checked={this.props.filterTypes["description"]}
            onClick={()=>this.props.onTypeChange("description", !this.props.filterTypes["description"])}
            tabIndex={this.props.tabIndex}
          />
        </div>
      </div>
    );
  }
}


export default TermsFilter;
