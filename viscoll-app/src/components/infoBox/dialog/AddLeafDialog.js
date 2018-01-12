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
import { btnBase } from '../../../styles/button';

/** Dialog to add leaves in a collation.  This component is used in the visual and tabular edit modes. */
export default class AddLeafDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      numberOfLeaves: 1,
      conjoin: false,
      oddLeaf: 2,
      location: "",
      errorText: {
        numberOfLeaves: "",
        oddLeaf: "",
      },
      disabledAbove: false,
      disabledBelow: false,
    };
  }

  /** Open this modal component */
  handleOpen = () => {
    this.setState({open: true});
    this.props.togglePopUp(true);
  };

  /** Close this modal component */
  handleClose = () => {
    this.clearForm();
    this.setState({open: false});
    this.props.togglePopUp(false);
  };

  /**
   * Increment a state's value by one, bounded by `max` and `min`. If the user previously 
   * entered an invalid value, the value is set to `min`.  
   * 
   * @param {string} name state name
   * @param {number} min
   * @param {number} max
   * @public
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
    newState[name]=(isNaN(newCount))?1:newCount;
    newState.errorText[name]="";
    this.setState({...newState});
  }

  /**
   * Decrement a state by one, bounded by `max` and `min`. If the user previously 
   * entered an invalid value, the value is set to min. 
   * 
   * @param {string} name state name
   * @param {number} min
   * @param {number} max
   * @public
   */
  decrementNumber = (name, min, max, e) => {
    if (e) e.preventDefault();
    let newCount = Math.min(max, Math.max(min, this.state[name]-1));
    let newState = {errorText:{}};
    newState[name]=(isNaN(newCount))?1:newCount;
    newState.errorText[name]="";
    this.setState({...newState});
  }

  /**
   * Validate user input. If invalid, display error message, otherwise update relevant state 
   * 
   * @param {string} name state name
   * @param {number} value new input value
   * @public
   */
  onNumberChange = (stateName, value) => {
    let errorState = this.state.errorText;
    errorState[stateName] = "";
    if (!this.isNormalInteger(value)) {
      errorState[stateName] = "Must be a number";
    } else {
      value = parseInt(value, 10);
    }
    if (stateName==="numberOfLeaves" && (value<1 || value>999)) {
      errorState[stateName] = "Number must be between 1 and 999";
    } else if (stateName==="oddLeaf" && (value<1 || value>this.state.numberOfLeaves)) {
      errorState[stateName] = "Number must be between 1 and " + this.state.numberOfLeaves;
    }
    let newState = {};
    newState[stateName] = value;
    this.setState({...newState, errorText: errorState});
  }

  /**
   * Check if string is an integer
   * 
   * @param {string} str 
   * @public
   */
  isNormalInteger = (str) => {
    return /^([1-9]\d*)$/.test(str);
  }

  /**
   * Toggle conjoin checkbox
   * 
   * @public
   */
  onToggleConjoin = () => {
    this.setState({conjoin: !this.state.conjoin});
  }

  /**
   * Update location radio button group
   * 
   * @param {string} value 
   * @public
   */
  onLocationChange = (value) => {
    this.setState({location: value});;
  }

  /**
   * Return `true` if there are any errors in the input fields
   * @public
   */
  isDisabled = (activeLeaf) => {
    let addable = activeLeaf.attached_above!=="None" && activeLeaf.attached_below!=="None";
    let numberOfLeavesError = !(this.state.errorText.numberOfLeaves===undefined) && this.state.errorText.numberOfLeaves.length>0;
    let oddLeafError = !(this.state.errorText.oddLeaf===undefined) && this.state.errorText.oddLeaf.length>0;
    return this.state.location==="" || addable || numberOfLeavesError || oddLeafError;
  }

  /**
   * Submit add leaf request
   * @public
   */
  submit = () => {
    const leaf = this.props.Leafs[this.props.selectedLeaves[0]];
    let data = {leaf:{}, additional:{}};
    data["additional"]["noOfLeafs"] = this.state.numberOfLeaves;
    data["additional"]["conjoin"] = (this.state.numberOfLeaves>1)? this.state.conjoin : false;
    if (this.state.conjoin && this.state.numberOfLeaves>1 && !(this.state.numberOfLeaves%2===0)) {
      data["additional"]["oddMemberLeftOut"] = this.state.oddLeaf;
    }    
    let memberOrder = getMemberOrder(leaf, this.props.Groups, this.props.groupIDs);
    if (this.state.location==="below") {
      memberOrder += 1;
      data["additional"]["order"] = this.props.leafIDs.indexOf(leaf.id) + 2;
    } else {
      data["additional"]["order"] = this.props.leafIDs.indexOf(leaf.id) + 1;
    }

    data["additional"]["memberOrder"] = memberOrder;
    data["leaf"]["project_id"] = this.props.projectID;
    data["leaf"]["parentID"] = leaf.parentID;

    this.props.action.addLeafs(data);
    this.handleClose();
    this.clearForm();
  }

  /**
   * Reset state
   * @public
   */
  clearForm = () => {
    this.setState({
      numberOfLeaves: 1,
      conjoin: false,
      oddLeaf: 2,
      location: "",
      errorText: {
        numberOfLeaves: "",
        oddLeaf: "",
      },
      disabledAbove: false,
      disabledBelow: false,
    })
  }

  render() {
    const activeLeaf = this.props.Leafs[this.props.selectedLeaves[0]];
    const activeLeafOrder = this.props.leafIDs.indexOf(activeLeaf.id)+1
    let defaultAddLocation = "";

    const actions = [
      <FlatButton
        label="Cancel"
        onClick={this.handleClose}
        style={{width:"49%", marginRight:"1%",border:"1px solid #ddd"}}
        
      />,
      <RaisedButton
        label="Submit"
        primary
        onClick={this.submit}
        disabled={this.isDisabled(activeLeaf)}
        style={{width:"49%"}}
      />,
    ];

    const styles = {
      radioButton: {
        marginBottom: 5,
      },
    };

    let noOfLeafs = "";
    let conjoinOption = "";
    let oddLeaf = "";

    if (this.state.location!=="") {
      noOfLeafs = 
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
              aria-label="Decrement number of leaves"
              name="Decrement number of leaves"
              onClick={(e) => this.decrementNumber("numberOfLeaves", 1, 999, e)}
            >
              <RemoveCircle color={light.palette.primary1Color} />
            </IconButton>
            <IconButton
              aria-label="Increment number of leaves"
              name="Increment number of leaves"
              onClick={(e) => this.incrementNumber("numberOfLeaves", 1, 999, e)}
            >
              <AddCircle color={light.palette.primary1Color} />
            </IconButton>
          </div>
        </div>;
    } 

    if (this.state.numberOfLeaves>1) {
      conjoinOption = 
      <div>
        <div className="label">
            <h4>Conjoin leaves?</h4>
          </div>
        <div className="input">
          <Checkbox
            aria-label="Conjoin leaves"
            onClick={()=>this.onToggleConjoin()}
            checked={this.state.conjoin && this.state.numberOfLeaves>1}
            style={{verticalAlign:"bottom"}}
          />
        </div>
      </div>
    }
    if (this.state.conjoin && this.state.numberOfLeaves>1 && !(this.state.numberOfLeaves%2===0)) {
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
              aria-label="Decrement leaf number"
              name="Decrement leaf number"
              onClick={(e) => this.decrementNumber("oddLeaf", 1, this.state.numberOfLeaves, e)}
            >
              <RemoveCircle color={light.palette.primary1Color} />
            </IconButton>
            <IconButton
              aria-label="Increment leaf number"
              name="Increment leaf number"
              onClick={(e) => this.incrementNumber("oddLeaf", 1, this.state.numberOfLeaves, e)}
            >
              <AddCircle color={light.palette.primary1Color} />
            </IconButton>
          </div>
        </div>
    }
    
    let disabledAddAbove = (activeLeaf.attached_above!=="None"?
      <div className="tooltip addDialog">
        <div style={{marginLeft: '40px'}} onMouseEnter={()=>{this.setState({disabledAbove:true})}}
            onMouseOut={()=>{this.setState({disabledAbove:false})}}>
            above leaf {activeLeafOrder}
        </div>
        <div className={this.state.disabledAbove===true?"text active":"text"}>
          Cannot insert a new leaf above leaf {activeLeafOrder} because leaf {activeLeafOrder} attached to leaf {activeLeafOrder-1}
        </div>
      </div>
      : ""
    );
    let disabledAddBelow = (activeLeaf.attached_below!=="None"?
      <div className="tooltip addDialog">
        <div style={{marginLeft: '40px'}} onMouseEnter={()=>{this.setState({disabledBelow:true})}}
        onMouseOut={()=>{this.setState({disabledBelow:false})}}>
         below leaf {activeLeafOrder}
        </div>
        <div className={this.state.disabledBelow===true?"text active":"text"}>
          Cannot insert a new leaf below leaf {activeLeafOrder} because leaf {activeLeafOrder} is attached to leaf {activeLeafOrder+1}
        </div>
      </div>
      : ""
    );

    let addLeaves = 
      <div>
        <h4 style={{marginBottom:"1em"}}>Add new leaves...</h4>
        {disabledAddBelow}
        <RadioButtonGroup 
          name="add_location" 
          defaultSelected={defaultAddLocation} 
          onChange={(e,v)=>this.onLocationChange(v)}
        >
          <RadioButton
            aria-label="Add new leaf above selected item"
            value="above"
            label={"above leaf " + activeLeafOrder}
            style={(activeLeaf.attached_above!=="None")? {display:"none"}: styles.radioButton}
          /> 
          <RadioButton
            aria-label="Add new leaf below selected item"
            value="below"
            label= {"below leaf " + activeLeafOrder}
            style={(activeLeaf.attached_below!=="None")? {display:"none"}: styles.radioButton}
          />
        </RadioButtonGroup>
        {disabledAddAbove}
      </div>
      
    const dialog = (
      <Dialog
          title="Add Leaves"
          actions={actions}
          modal={false}
          open={this.state.open}
          onRequestClose={this.handleClose}
          autoScrollBodyContent
          contentStyle={{width:"450px"}}
          titleStyle={{textAlign:"center"}}
          paperClassName="addDialog"
        >
          {addLeaves}
          {noOfLeafs}
          {conjoinOption}
          {oddLeaf}
        </Dialog>
    );

    return (
      <div>
        <RaisedButton 
          primary 
          label="Add" 
          onClick={this.handleOpen} 
          tabIndex={this.props.tabIndex}
          {...btnBase()}
          style={{...btnBase().style, width:"49%",float:"left",marginRight:"2%"}}
        />
        {dialog}
      </div>
    );
  }
}
