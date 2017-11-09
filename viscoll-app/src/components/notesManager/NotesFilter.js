import React, {Component} from 'react';
import TextField from 'material-ui/TextField';
import Checkbox from 'material-ui/Checkbox';

/** Filter notes */
class NotesFilter extends Component {

  constructor(props) {
    super(props);
    this.state = {
      value: "",
    }
  }
 
  render() {
    return ( 
      <div className="noteSearch">
        <div className="searchTextbox">
          <TextField 
            id="searchNoteField"
            hintText="Search notes ..."
            onChange={(e,value)=>{this.setState({value});this.props.onValueChange(e,value)}}
            style={{marginLeft:10,marginRight:10}}
            value={this.state.value}
          />
        </div>
        <div className={(this.state.value.length>0)?"searchOptions active":"searchOptions"}>
          <Checkbox 
            label="Title" 
            iconStyle={{marginRight: 0}} 
            style={{width: 60, paddingRight: 10, display: 'inline-flex', fontSize:14}}
            checked={this.props.filterTypes["title"]}
            onCheck={(e, checked)=>this.props.onTypeChange("title", checked)}
          />
          <Checkbox 
            label="Type" 
            iconStyle={{marginRight: 0}} 
            style={{width: 55, paddingRight: 15, display: 'inline-flex', fontSize:14}}
            checked={this.props.filterTypes["type"]}
            onCheck={(e, checked)=>this.props.onTypeChange("type", checked)}
          />
          <Checkbox 
            label="Description" 
            iconStyle={{marginRight: 0}} 
            style={{width: 50, paddingRight: 15, display: 'inline-flex', fontSize:14}}
            checked={this.props.filterTypes["description"]}
            onCheck={(e, checked)=>this.props.onTypeChange("description", checked)}
          />
        </div>
      </div>
    );
  }
}


export default NotesFilter;
