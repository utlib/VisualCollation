import React from 'react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import IconButton from 'material-ui/IconButton';
import AddCircle from 'material-ui/svg-icons/content/add-circle';
import RemoveCircle from 'material-ui/svg-icons/content/remove-circle-outline';
import light from '../../../styles/light';

/** Dialog to add leaves in a collation.  This component is used in the visual and tabular edit modes. */
export default class AddLeafDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      folioNumber: this.props.defaultFolioNumber,
      errorText: {
        folioNumber: "",
      },
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({folioNumber: nextProps.defaultFolioNumber});
  }

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
   * @param {string} stateName state name
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
    if (stateName==="folioNumber" && (value<1 || value>9999)) {
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
      errorText: { folioNumber: "" }, 
    })
  }

  submit = () => {
    this.props.action.generateFolioNumbers(this.state.folioNumber);
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
        disabled={this.state.errorText.folioNumber!==""}
        style={{width:"49%"}}
      />,
    ];

    return (<Dialog
    title="Generate folio numbers"
    actions={actions}
    modal={false}
    open={this.props.folioModalOpen}
    onRequestClose={()=>{this.clearForm();this.props.toggleFolioModal(false)}}
    contentStyle={{width:"450px"}}
    titleStyle={{textAlign:"center"}}
    paperClassName="addDialog"
    >
    <div>
      <div className="label">
        <h4>Starting folio number</h4>
      </div>
      <div className="input">
        <TextField
          aria-label="Starting folio number"
          name="folioNumber"
          value={this.state.folioNumber}
          errorText={this.state.errorText.folioNumber}
          onChange={(e,v)=>this.onNumberChange("folioNumber", v)}
          style={{width:"100px"}}
          inputStyle={{textAlign:"center"}}
        />
        <IconButton
          aria-label="Decrement folio number"
          name="Decrement folio number"
          onClick={(e) => this.decrementNumber("folioNumber", 1, 9999, e)}
        >
          <RemoveCircle color={light.palette.primary1Color} />
        </IconButton>
        <IconButton
          aria-label="Increment folio number"
          name="Increment folio number"
          onClick={(e) => this.incrementNumber("folioNumber", 1, 9999, e)}
        >
          <AddCircle color={light.palette.primary1Color} />
        </IconButton>
      </div>
    </div>
    </Dialog>);
  }

}
