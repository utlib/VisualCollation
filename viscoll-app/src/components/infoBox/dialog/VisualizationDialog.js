import React from 'react';
import {getLeafsOfGroup} from '../../../helpers/getLeafsOfGroup';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';

export default class VisualizationDialog extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      startLeaf: null,
      endLeaf: null,
    }
  }

  componentWillReceiveProps() {
    this.setState({
      startLeaf: null,
      endLeaf: null,
    });
  }

  handleChange = (type, value) => {
    this.setState({[type]:value});
  }

  renderMenuItem = (item, index) => {
    if (item.id) {
      return <MenuItem 
        key={item.id+index} 
        value={item.id} 
        primaryText={"Leaf " + item.order} 
      />
    } else {
      return <MenuItem 
        key={"spine"} 
        value={"spine"} 
        primaryText={"Spine"} 
      />
    }
  }

  onCreate = () => {
    let attributeValue = this.state.startLeaf==="spine"?[this.state.endLeaf]:[this.state.startLeaf,this.state.endLeaf];
    this.props.updateGroup(this.props.type, attributeValue); 
    this.props.closeDialog();
  }

  render() {
    let isCreateAction = (this.props.type!=="" && this.props.group[this.props.type].length===0);
    const actions = [
      <FlatButton
        label={isCreateAction?"Cancel" : "Close"}
        primary={true}
        keyboardFocused={true}
        onClick={()=>{this.props.closeDialog()}}
      />,
      <RaisedButton
        label={"Submit"}
        primary={true}
        onClick={this.onCreate}
        style={isCreateAction?{marginLeft:10}:{display:"none"}}
      />,
      <RaisedButton
        label={"Remove " + this.props.type}
        style={isCreateAction?{display:"none"}:{float:"left"}}
        labelStyle={{color:"#b53c3c"}}
        onClick={()=>{this.props.delete(); this.props.closeDialog()}}
    />,
    ];
    let selectFields = [];
    const leafMembersOfCurrentGroup = getLeafsOfGroup(this.props.activeGroup, this.props.Leafs);
    if (isCreateAction) {
      // Create new sewing/tacket
      let selectField1 = (
        <SelectField
          key="GroupVizSelect1"
          floatingLabelText={"Start of " + this.props.type}
          value={this.state.startLeaf}
          onChange={(e,i,v)=>this.handleChange("startLeaf",v)}
          fullWidth
        >
          {leafMembersOfCurrentGroup.map((v,i,a)=>this.renderMenuItem(v,0))}
        </SelectField>)
        let selectField2 = (
          <SelectField
            key="GroupVizSelect2"
            floatingLabelText={"End of " + this.props.type}
            value={this.state.endLeaf}
            onChange={(e,i,v)=>this.handleChange("endLeaf",v)}
            fullWidth
          >
          {leafMembersOfCurrentGroup.filter((item)=>(item.id!==null&&(this.state.startLeaf===null||this.state.startLeaf==="spine"|| item.order>this.props.Leafs[this.state.startLeaf].order))).map((v,i,a)=>this.renderMenuItem(v,1))}
          </SelectField>)
        selectFields.push(selectField1);
        selectFields.push(selectField2);
    } else if (this.props.type!=="" && this.props.group[this.props.type].length>0) {
      // Edit existing sewing/tacket

      const leafStart = this.props.group[this.props.type].length===2? this.props.Leafs[this.props.group[this.props.type][0]] : null;
      const leafEnd = this.props.group[this.props.type].length===2? this.props.Leafs[this.props.group[this.props.type][1]] : this.props.Leafs[this.props.group[this.props.type][0]];
      
      let selectField1 = (
        <SelectField
          key="GroupVizSelect1"
          floatingLabelText={"Start of " + this.props.type}
          value={leafStart!==null?leafStart.id:"spine"}
          onChange={(e,i,v)=>this.props.handleTacketSewingChange(this.props.type, v, 0)}
          fullWidth
        >
          {this.renderMenuItem({id:null},0)}
          {leafMembersOfCurrentGroup.filter((item)=>(item.id!==null && item.order<leafEnd.order)).map((v,i,a)=>this.renderMenuItem(v,0))}
        </SelectField>)
      let selectField2 = (
        <SelectField
          key="GroupVizSelect2"
          floatingLabelText={"End of " + this.props.type}
          value={leafEnd.id}
          onChange={(e,i,v)=>this.props.handleTacketSewingChange(this.props.type, v, 1)}
          fullWidth
        >
        {leafMembersOfCurrentGroup.filter((item)=>(leafStart===null && item.id!==null)||(leafStart!==null && item.id!==null && item.order>leafStart.order)).map((v,i,a)=>this.renderMenuItem(v,1))}
        </SelectField>)
      selectFields.push(selectField1);
      selectFields.push(selectField2);
    }  
    
    return (
      <div>
        <Dialog
          title={isCreateAction? "Add " + this.props.type + " attribute" : "Edit " + this.props.type + " attribute"}
          actions={actions}
          modal={false}
          open={this.props.open}
          onRequestClose={()=>this.props.closeDialog()}
          contentStyle={{width: "30%", minWidth:"320px", maxWidth:"450px"}}
        >
          {selectFields}
        </Dialog>
      </div>
    );
  }
}