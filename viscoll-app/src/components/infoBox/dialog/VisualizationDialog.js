import React from 'react';
import {getLeafsOfGroup} from '../../../helpers/getLeafsOfGroup';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import SelectField from '../../global/SelectField';

/** Dialog for creating/editing sewing or tacketed attribute */
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
      return { 
        value:item.id,
        text:"Leaf " + (this.props.leafIDs.indexOf(item.id)+1),
      }
    } else {
      return { 
        value:"spine",
        text:"Spine",
      }
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
    let leafMembersOfCurrentGroup = [{id:null}].concat(getLeafsOfGroup(this.props.activeGroup, this.props.Leafs, false));
    if (isCreateAction) {
      // Create new sewing/tacket
      let selectField1 = (
        <SelectField
          key="GroupVizSelect1"
          id="GroupVizSelect1"
          floatingLabelText={"Start of " + this.props.type}
          label={"Start of " + this.props.type}
          value={this.state.startLeaf}
          onChange={(v)=>this.handleChange("startLeaf",v)}
          data={leafMembersOfCurrentGroup.map((v,i)=>this.renderMenuItem(v,0))}
        />)
        let selectField2 = (
          <SelectField
            key="GroupVizSelect2"
            id="GroupVizSelect2"
            floatingLabelText={"End of " + this.props.type}
            value={this.state.endLeaf}
            onChange={(v)=>this.handleChange("endLeaf",v)}
            data={leafMembersOfCurrentGroup.filter((item) => (item.id !== null && (this.state.startLeaf === null || this.state.startLeaf === "spine" || this.props.leafIDs.indexOf(item.id) > this.props.leafIDs.indexOf(this.state.startLeaf)))).map((v,i,a)=>this.renderMenuItem(v,1))}
          />)
        selectFields.push(selectField1);
        selectFields.push(selectField2);
    } else if (this.props.type!=="" && this.props.group[this.props.type].length>0) {
      // Edit existing sewing/tacket

      const leafStart = this.props.group[this.props.type].length===2? this.props.Leafs[this.props.group[this.props.type][0]] : null;
      const leafEnd = this.props.group[this.props.type].length===2? this.props.Leafs[this.props.group[this.props.type][1]] : this.props.Leafs[this.props.group[this.props.type][0]];
      const data1 = [{ id: null }].concat(leafMembersOfCurrentGroup.filter((item) => (item.id !== null && this.props.leafIDs.indexOf(item.id) < this.props.leafIDs.indexOf(leafEnd.id)+1)));
      const data2 = leafMembersOfCurrentGroup.filter((item) => (leafStart === null && item.id !== null) || (leafStart !== null && item.id !== null && this.props.leafIDs.indexOf(item.id) > this.props.leafIDs.indexOf(leafStart.id)+1));
      let selectField1 = (
        <SelectField
          key="GroupVizSelect1"
          id="GroupVizSelect1"
          floatingLabelText={"Start of " + this.props.type}
          value={leafStart!==null?leafStart.id:"spine"}
          onChange={(v)=>this.props.handleTacketSewingChange(this.props.type, v, 0)}
          data={data1.map((v,i)=>this.renderMenuItem(v,0))}
        />)
      let selectField2 = (
        <SelectField
          key="GroupVizSelect2"
          id="GroupVizSelect2"
          floatingLabelText={"End of " + this.props.type}
          value={leafEnd.id}
          onChange={(v)=>this.props.handleTacketSewingChange(this.props.type, v, 1)}
          data={data2.map((v,i)=>this.renderMenuItem(v,1))}
        />)
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