import React from 'react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import Checkbox from 'material-ui/Checkbox';
import {RadioButton, RadioButtonGroup} from 'material-ui/RadioButton';
import TextField from 'material-ui/TextField';
import IconButton from 'material-ui/IconButton';
import AddCircle from 'material-ui/svg-icons/content/add-circle';
import RemoveCircle from 'material-ui/svg-icons/content/remove-circle-outline';
import light from '../../../styles/light';
import { getMemberOrder } from '../../../helpers/getMemberOrder';


/** Dialog to add groups in a collation.  This component is used in the visual and tabular edit modes.  It is mounted by `InfoBox` and `GroupInfoBox` components. */
export default class AddGroupDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      numberOfGroups: 1,
      hasLeaves: props.addLeafs || false,
      numberOfLeaves: 1,
      direction: "left-to-right",
      conjoin: false,
      oddLeaf: 2,
      copies: 1,
      location: "inside",
      errorText: {
        numberOfGroups: "",
        numberOfLeaves: "",
        oddLeaf: "",
        copies: "",
      },
    }
  };

  componentWillReceiveProps() {
    this.resetForm();
  }

  /**
   * Increment a state's value by one, bounded by `max` and `min`. If the user previously 
   * entered an invalid value, the value is set to `min`.  
   */
  incrementNumber = (name, min, max, e) => {
    if (e) e.preventDefault();
    let newCount = 0;
    if (!this.isNormalInteger(this.state[name])) {
      newCount = min; 
    } else {
      newCount = Math.min(max, this.state[name]+1);
    }
    let newState = {errorText:{}};
    newState[name]=(isNaN(newCount))?min:newCount;
    newState.errorText[name]="";
    this.setState({...newState});
  }

  /**
   * Decrement a state by one, bounded by `max` and `min`. If the user previously 
   * entered an invalid value, the value is set to min. 
   */
  decrementNumber = (name, min, max, e) => {
    if (e) e.preventDefault();
    let newCount = Math.min(max, Math.max(min, this.state[name]-1));
    let newState = {errorText:{}};
    newState[name]=(isNaN(newCount))?min:newCount;
    newState.errorText[name]="";
    this.setState({...newState});
  }
  
  /**
   * Validate user input. If invalid, display error message, otherwise update relevant state 
   */
  onNumberChange = (name, value) => {
    let errorState = this.state.errorText;
    errorState[name] = "";
    if (!this.isNormalInteger(value)) {
      errorState[name] = "Must be a number";
    } else {
      value = parseInt(value, 10);
    }
    if ((name==="numberOfGroups"||name==="copies") && (value<1 || value>99)) {
      errorState[name] = "Number must be between 1 and 99";
    } else if (name==="numberOfLeaves" && (value<1 || value>999)) {
      errorState[name] = "Number must be between 1 and 999";
    } else if (name==="oddLeaf" && (value<1 || value>this.state.numberOfLeaves)) {
      errorState[name] = "Number must be between 1 and " + this.state.numberOfLeaves;
    } 
    let newState = {};
    newState[name] = value;
    this.setState({...newState, errorText: errorState});
  }

  /**
   * Check if string is an integer
   */
  isNormalInteger = (str) => {
    return /^([1-9]\d*)$/.test(str);
  }

  /**
   * Toggle a checkbox
   */
  onToggleCheckbox = (stateName, value) => {
    let newState = {};
    newState[stateName] = value;
    this.setState(newState);
  }

  /**
   * Update location radio button group
   */
  onLocationChange = (value) => {
    this.setState({location: value});;
  }
  /**
   * Returns next sibling of a group
   */
  getNextSibling = () => {
    let activeGroup = this.props.Groups[this.props.selectedGroups[0]];
    for (let groupID of this.props.groupIDs.slice(this.props.groupIDs.indexOf(activeGroup.id)+1)) {
      const group = this.props.Groups[groupID]
      if (group.nestLevel===activeGroup.nestLevel)
        return group
    }
    return null;
  }

  /**
   * Returns the last child group
   */
  findLastChildGroup = (memberIDs) => {
    let lastGroup = null;
    for (let memberID of memberIDs) {
      if (memberID.charAt(0)==="G") {
        const member = this.props.Groups[memberID]
        if (lastGroup===null || (this.props.groupIDs.indexOf(member.id)>this.props.groupIDs.indexOf(lastGroup.id))) {
          lastGroup = member;
        }
        if (member.memberIDs.length>0) {
          let result = this.findLastChildGroup(member.memberIDs);
          if (result && this.props.groupIDs.indexOf(result.id) > this.props.groupIDs.indexOf(lastGroup.id)) lastGroup = result;
        }
      }
    }
    return lastGroup;
  }

  /**
   * Submit add group request
   */
  submit = () => {
    if (this.props.addLeafs || !this.isDisabled()) {
      let data = {group:{}, additional:{}};
      data.additional["noOfGroups"] = this.state.numberOfGroups;
      if (this.state.hasLeaves) {
        data.additional["noOfLeafs"] = this.state.numberOfLeaves;
        data.additional["conjoin"] = (this.state.numberOfLeaves>1)? this.state.conjoin : false;
        if (this.state.numberOfLeaves>1 && this.state.conjoin && !(this.state.numberOfLeaves%2===0)) {
          data.additional["oddMemberLeftOut"] = this.state.oddLeaf;
        }
      }
      if (this.props.selectedGroups.length===0){
        // Empty project. Add new group
        data.additional["order"] = 1;
        data.additional["memberOrder"] = 1;
        data.group["direction"] = this.state.direction;
        data.group["type"] = "Quire";
        data.group["title"] = "None";
      } else if(this.props.addLeafs) {
        // Add Leafs inside
        data = {leaf:{}, additional:{...data.additional}};
        delete data.additional.noOfGroups
        data.leaf["project_id"] = this.props.projectID;
        data.leaf["parentID"] = this.props.selectedGroups[0];
        data.additional["memberOrder"] = 1;  
        this.props.action.addLeafs(data);
        this.props.closeDialog();
        return;
      }
      else {
        // Add group(s)
        const group = this.props.Groups[this.props.selectedGroups[0]];
        let memberOrder = getMemberOrder(group, this.props.Groups, this.props.groupIDs);
        let groupOrder = this.props.groupIDs.indexOf(group.id)+1;
        data.group = {
          title: "None", 
          type: "Quire"
        };
        data.group["direction"]=this.state.direction;
        if (group.parentID) {
          // If active group is nested, the new group(s) must have the same parent as the active group
          data.additional["parentGroupID"] = group.parentID;
        }
        if (this.state.location==="below") {
          // Add group below
          memberOrder += 1;
          let sibling = this.getNextSibling();
          if (sibling) {
            groupOrder = this.props.groupIDs.indexOf(sibling.id)+1;
          } else {
            // No sibling.. 
            if (!group.parentID) {
              // Active group is a root group with no next sibling
              groupOrder = this.props.groupIDs.length+1;
            } else {
              if (group.memberIDs.length>0) {
                // Find the last child (possibly multi-nested) 
                let lastChild = this.findLastChildGroup(group.memberIDs);
                if (lastChild===null) {
                  groupOrder = this.props.groupIDs.indexOf(group.id) + 2;
                } else {
                  groupOrder = this.props.groupIDs.indexOf(lastChild.id) + 2;
                }
              } else {
                // If no children
                groupOrder = groupOrder+1;
              }
            }
          }
        } else if (this.state.location==="inside") {
          // Add group inside
          groupOrder += 1;
          memberOrder = 1;
          if(!group.direction){
            data.group["direction"] = "left-to-right";
          } else {
            data.group["direction"] = group.direction;
          }
          data.additional["parentGroupID"] = group.id;
        }
        data.additional["memberOrder"] = memberOrder;
        data.additional["order"] = groupOrder;
      }
      data.group["project_id"] = this.props.projectID
      this.props.action.addGroups(data);
      this.props.closeDialog();
      this.setState({location: "below"});
      this.resetForm();
    }
  }

   /**
   * Return `true` if there are any errors in the input fields
   */
  isDisabled = () => {
    let copiesError = !(this.state.errorText.copies===undefined) && this.state.errorText.copies.length>0;
    let numberOfGroupsError = !(this.state.errorText.numberOfGroups===undefined) && this.state.errorText.numberOfGroups.length>0;
    let numberOfLeavesError = !(this.state.errorText.numberOfLeaves===undefined) && this.state.errorText.numberOfLeaves.length>0;
    let oddLeafError = !(this.state.errorText.oddLeaf===undefined) && this.state.errorText.oddLeaf.length>0;
    return this.state.location==="" || copiesError || numberOfGroupsError || numberOfLeavesError || oddLeafError;
  }

  /**
   * Reset state
   */
  resetForm = () => {
    this.setState({
      numberOfGroups: 1,
      hasLeaves: this.props.addLeafs || false,
      numberOfLeaves: 1,
      direction: "left-to-right",
      conjoin: false,
      oddLeaf: 2,
      copies: 1,
      location: this.props.selectedGroups.length>0?"":"inside",
      errorText: {
        numberOfGroups: "",
        numberOfLeaves: "",
        oddLeaf: "",
        copies: "",
      },
    });
  }

  render() {
    const actions = [
      <FlatButton
        label="Cancel"
        onClick={()=>{this.props.closeDialog()}}
        style={{width:"49%", marginRight:"1%",border:"1px solid #ddd"}}
      />,
      <RaisedButton
        label="Submit"
        type="submit"
        name="submit"
        primary
        onClick={this.submit}
        disabled={this.props.addLeafs? false : this.isDisabled()}
        style={{width:"49%"}}
      />,
    ];

    const styles = {
      radioButton: {
        marginBottom: 5,
      },
    };

    let conjoinOption = "";
    let directionOption = "";
    let oddLeaf = "";
    // let copies = "";
    let numberOfLeaves = "";
    if (this.state.hasLeaves) {
      numberOfLeaves =
        <div>
          <div className="label">
            <h4>Number of leaves</h4>
          </div>
          <div className="input">
            <TextField
              aria-label="Number of leaves"
              name="numberOfLeaves"
              value={this.state.numberOfLeaves}
              errorText={this.state.errorText.numberOfLeaves}
              onChange={(e,v)=>this.onNumberChange("numberOfLeaves", v)}
              style={{width:"100px"}}
              inputStyle={{textAlign:"center"}}
            />
            <IconButton
              onClick={(e) => this.decrementNumber("numberOfLeaves", 1, 999, e)}
              aria-label="Decrement number of leaves"
            >
              <RemoveCircle color={light.palette.primary1Color} />
            </IconButton>
            <IconButton
              onClick={(e) => this.incrementNumber("numberOfLeaves", 1, 999, e)}
              aria-label="Increment number of leaves"
            >
              <AddCircle color={light.palette.primary1Color}/>
            </IconButton >
          </div>
        </div>;
    }
    
    if (this.state.hasLeaves && this.state.numberOfLeaves>1) {
      conjoinOption = 
      <div>
        <div className="label">
          <h4>Conjoin leaves?</h4>
        </div>
        <div className="input">
          <Checkbox
            aria-label="Conjoin leaves"
            checked={this.state.conjoin}
            onClick={()=>this.onToggleCheckbox("conjoin", !this.state.conjoin)}
            />
        </div>
      </div>
    }
    if (this.state.hasLeaves && this.state.conjoin && !(this.state.numberOfLeaves%2===0)) {
      oddLeaf = 
        <div>
          <div className="label">
            <h4>Odd leaf to not conjoin</h4>
          </div>
          <div className="input">
            <TextField
              aria-label="Odd leaf to not conjoin"
              name="oddLeaf"
              value={this.state.oddLeaf}
              errorText={this.state.errorText.oddLeaf}
              onChange={(e,v)=>this.onNumberChange("oddLeaf", v)}
              style={{width:"100px"}}
              inputStyle={{textAlign:"center"}}
            />
            <IconButton
              onClick={(e) => this.decrementNumber("oddLeaf", 1, this.state.numberOfLeaves, e)}
              aria-label="Decrement leaf number"
            >
              <RemoveCircle color={light.palette.primary1Color} />
            </IconButton>
            <IconButton
              onClick={(e) => this.incrementNumber("oddLeaf", 1, this.state.numberOfLeaves, e)}
              aria-label="Increment leaf number"
            >
              <AddCircle color={light.palette.primary1Color}/>
            </IconButton >
          </div>
        </div>
    }
    if(this.state.location !== "inside" && !this.props.addLeafs){
      directionOption = 
        <div>
          <div className="label">
            <h4>Right-to-Left Direction</h4>
          </div>
          <div className="input">
            <Checkbox
              aria-label="Right-to-Left Direction"
              checked={this.state.direction === "right-to-left"}
              onClick={()=>{if(this.state.direction === "right-to-left"){this.onToggleCheckbox("direction", "left-to-right")}else if(this.state.direction === "left-to-right"){this.onToggleCheckbox("direction", "right-to-left")}}}
              />
          </div>
        </div>
    }

    let numberOfGroups = this.state.location? <div>
                            <div className="label">
                              <h4>Number of groups</h4>
                            </div>
                            <div className="input">
                              <TextField
                                aria-label="Number of groups"
                                name="numberOfGroups"
                                value={this.state.numberOfGroups}
                                errorText={this.state.errorText.numberOfGroups}
                                onChange={(e,v)=>this.onNumberChange("numberOfGroups", v)}
                                style={{width:"100px"}}
                                inputStyle={{textAlign:"center"}}
                              />
                              <IconButton
                                aria-label="Decrement number of groups"
                                name="Decrement number of groups"
                                onClick={(e) => this.decrementNumber("numberOfGroups", 1, 999, e)}
                              >
                                <RemoveCircle color={light.palette.primary1Color} />
                              </IconButton>
                              <IconButton
                                aria-label="Increment number of groups"
                                name="Increment number of groups"
                                onClick={(e) => this.incrementNumber("numberOfGroups", 1, 999, e)}
                              >
                                <AddCircle color={light.palette.primary1Color}/>
                              </IconButton >
                            </div>
                          </div> : "";

    let radioButtonGroupHeader = <h4 style={{marginBottom:"1em"}}>Add new group(s)</h4>;
    let radioButtonGroup = <RadioButtonGroup name="add_location" defaultSelected={this.state.location} onChange={(e,v)=>this.onLocationChange(v)}>
                              <RadioButton
                                aria-label="Add new group above selected item"
                                value="above"
                                label="above selected item"
                                style={styles.radioButton}
                              />
                              <RadioButton
                                aria-label="Add new group below selected item"
                                value="below"
                                label="below selected item"
                                style={styles.radioButton}
                                autoFocus
                              />
                              <RadioButton
                                aria-label="Add new group inside selected item"
                                value="inside"
                                label="inside selected item"
                                style={styles.radioButton}
                              />
                            </RadioButtonGroup>

    let addLeafsCheckbox = this.state.location!==""? <div>
                              <div className="label">
                                <h4>Add leaves inside?</h4>
                              </div>
                              <div className="input">
                                <Checkbox 
                                  aria-label="Add leaves inside"
                                  checked={this.state.hasLeaves}
                                  onClick={()=>this.onToggleCheckbox("hasLeaves", !this.state.hasLeaves)}
                                />
                              </div>
                            </div> : "";


    if (!this.props.selectedGroups) {
      radioButtonGroupHeader="";
      radioButtonGroup="";
    }

    if (this.props.selectedGroups.length===0){
      radioButtonGroup="";
    } 

    if (this.props.addLeafs) {
      numberOfGroups="";
      radioButtonGroupHeader="";
      radioButtonGroup="";
      addLeafsCheckbox="";
    }

    const dialog = (
      <Dialog
          title={this.props.addLeafs ? "Add Leafs Inside" : "Add Groups"}
          actions={actions}
          modal={false}
          open={this.props.open}
          onRequestClose={this.props.closeDialog}
          autoScrollBodyContent
          contentStyle={{width:"465px"}}
          titleStyle={{textAlign:"center"}}
          paperClassName="addDialog"
        >
          {radioButtonGroupHeader}
          {radioButtonGroup}
          {numberOfGroups}
          {addLeafsCheckbox}         
          {numberOfLeaves}
          {directionOption}
          {conjoinOption}
          {oddLeaf}
        </Dialog>
    );

    return (
      <div>
        {dialog}
      </div>
    );
  }
}
