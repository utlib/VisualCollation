import React from 'react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import IconButton from 'material-ui/IconButton';
import AddCircle from 'material-ui/svg-icons/content/add-circle';
import RemoveCircle from 'material-ui/svg-icons/content/remove-circle-outline';
import {RadioButton, RadioButtonGroup} from 'material-ui/RadioButton';
import light from '../../../styles/light';

/** Dialog to add leaves in a collation.  This component is used in the visual and tabular edit modes. */
export default class FolioNumberDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      folioOrPage: null,
      startNumber: this.props.defaultStartNumber,
      errorText: {
        startNumber: "",
      },
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({startNumber: nextProps.defaultStartNumber});
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
    newState[name]=(isNaN(newCount))?1:newCount;
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
    newState[name]=(isNaN(newCount))?1:newCount;
    newState.errorText[name]="";
    this.setState({...newState});
  }

  /**
   * Validate user input. If invalid, display error message, otherwise update relevant state 
   */
  onNumberChange = (stateName, value) => {
    let errorState = this.state.errorText;
    errorState[stateName] = "";
    if (!this.isNormalInteger(value)) {
      errorState[stateName] = "Must be a number";
    } else {
      value = parseInt(value, 10);
    }
    if (stateName==="startNumber" && (value<1 || value>9999)) {
      errorState[stateName] = "Number must be between 1 and 9999";
    }
    let newState = {};
    newState[stateName] = value;
    this.setState({...newState, errorText: errorState});
  }

  isNormalInteger = (str) => {
    return /^([1-9]\d*)$/.test(str);
  }

  clearForm = () => {
    this.setState({
      folioOrPage: null,
      errorText: { startNumber: "" }, 
    })
  }

  submit = () => {
    if (this.state.folioOrPage==="folio_number") {
      this.props.action.generateFolioNumbers(this.state.startNumber);
    } else {
      this.props.action.generatePageNumbers(this.state.startNumber);
    }
    this.clearForm();
    this.props.toggleFolioModal(false);
  }

  render() {
    const actions = [
      <FlatButton
        label="Cancel"
        onClick={()=>{this.clearForm();this.props.toggleFolioModal(false)}}
        style={{width:"49%", marginRight:"1%",border:"1px solid #ddd"}}
        
      />,
      <RaisedButton
        label="Submit"
        primary
        onClick={this.submit}
        disabled={this.state.errorText.startNumber!==""}
        style={{width:"49%"}}
      />,
    ];

    return (<Dialog
    title="Generate folio or page numbers"
    actions={actions}
    modal={false}
    open={this.props.folioModalOpen}
    onRequestClose={()=>{this.clearForm();this.props.toggleFolioModal(false)}}
    contentStyle={{width:"450px"}}
    titleStyle={{textAlign:"center"}}
    paperClassName="addDialog"
    >
    <div>
      <h4 style={{marginBottom:"1em"}}>Generate...</h4>
      <RadioButtonGroup 
        name="folioOrPage" 
        defaultSelected={""} 
        onChange={(e,v)=>this.setState({folioOrPage: v})}
      >
        <RadioButton
          aria-label="Generate folio numbers"
          value="folio_number"
          label="Folio numbers"
        /> 
        <RadioButton
          aria-label="Generate page numbers"
          value="page_number"
          label="Page numbers"
        /> 
      </RadioButtonGroup>

      {this.state.folioOrPage? 
        <div>
          <div className="label">
            <h4>Starting number</h4>
          </div>
          <div className="input">
            <TextField
              aria-label="Starting folio number"
              name="startNumber"
              value={this.state.startNumber}
              errorText={this.state.errorText.startNumber}
              onChange={(e,v)=>this.onNumberChange("startNumber", v)}
              style={{width:"100px"}}
              inputStyle={{textAlign:"center"}}
            />
            <IconButton
              aria-label="Decrement folio number"
              name="Decrement folio number"
              onClick={(e) => this.decrementNumber("startNumber", 1, 9999, e)}
            >
              <RemoveCircle color={light.palette.primary1Color} />
            </IconButton>
            <IconButton
              aria-label="Increment folio number"
              name="Increment folio number"
              onClick={(e) => this.incrementNumber("startNumber", 1, 9999, e)}
            >
              <AddCircle color={light.palette.primary1Color} />
            </IconButton>
          </div>
        </div>
      :""}
    </div>
    </Dialog>);
  }
}
