import React from 'react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import IconButton from 'material-ui/IconButton';
import IconAdd from 'material-ui/svg-icons/content/add';
import AutoComplete from 'material-ui/AutoComplete';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import TextField from 'material-ui/TextField';
import Checkbox from 'material-ui/Checkbox';

/** Dialog to add a term to an object (leaf, side, or group).  This component is used in the visual and tabular edit modes.  */
export default class AddTerm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      type: '',
      description: '',
      show: false,
      searchText: '',
      termID: null,
    };
  }

  /** Open this modal component */
  handleOpen = () => {
    this.setState({
      open: true,
      type: '',
      description: '',
      show: false,
      searchText: '',
      termID: null,
    });
    this.props.togglePopUp(true);
  };

  /** Close this modal component */
  handleClose = () => {
    this.setState({ open: false });
    this.props.togglePopUp(false);
  };

  handleUpdateInput = searchText => {
    this.setState({
      searchText: searchText,
      termID: null,
    });
  };

  handleNewRequest = request => {
    // User pressed enter instead of selecting a term in drop down
    // Look for key associated with user input
    let termID = null;
    for (let id in this.props.Terms) {
      const term = this.props.Terms[id];
      if (term.title === request) {
        termID = term.id;
      }
    }
    this.setState({ termID }, () => {
      if (termID) this.submit();
    });
  };

  submit = () => {
    if (this.state.termID !== null) {
      // Attach existing term to selected objects
      this.props.action.linkTerm(this.state.termID);
    } else {
      // Check if term exists (in case user types and did not press enter)
      let termID = null;
      for (let id in this.props.Terms) {
        const term = this.props.Terms[id];
        if (term.title === this.state.searchText) termID = term.id;
      }
      if (termID) {
        this.props.action.linkTerm(termID);
      } else {
        // Did not find term, so create and attach new term to object
        this.props.action.createAndAttachTerm(
          this.state.searchText,
          this.state.type,
          this.state.description,
          this.state.show
        );
      }
    }
    this.handleClose();
  };

  termExists = () => {
    for (let termID in this.props.Terms) {
      const term = this.props.Terms[termID];
      if (term.title === this.state.searchText) {
        return true;
      }
    }
    return false;
  };

  /**
   * Mapping function to render one term type menu item
   */
  renderNoteTypes = name => {
    return <MenuItem key={name} value={name} primaryText={name} />;
  };

  onChange = (name, value) => {
    this.setState({ [name]: value });
  };

  getFilteredTermTitlesDropDown = () => {
    return Object.keys(this.props.Terms).filter(termID => {
      return !this.props.commonTerms.includes(termID);
    });
  };

  render() {
    const dataSourceConfig = {
      text: 'textKey',
      value: 'valueKey',
    };

    const actions = [
      <FlatButton
        label="Cancel"
        onClick={this.handleClose}
        style={{ width: '49%', marginRight: '1%', border: '1px solid #ddd' }}
        keyboardFocused
      />,
      <RaisedButton
        label={
          this.termExists() || this.state.searchText.length === 0
            ? 'Attach term'
            : 'Create & attach term'
        }
        primary
        onClick={this.submit}
        style={{ width: '49%' }}
        disabled={!this.termExists() && this.state.type === ''}
      />,
    ];

    let newTermForm = <div></div>;
    if (!this.termExists() && this.state.searchText.length > 1) {
      newTermForm = (
        <div>
          <SelectField
            value={this.state.type}
            onChange={(e, i, v) => this.onChange('type', v)}
            floatingLabelText="Taxonomy"
            fullWidth
            style={{ marginTop: -20 }}
          >
            {this.props.noteTypes.map(this.renderNoteTypes)}
          </SelectField>
          <TextField
            floatingLabelText="Description"
            name="description"
            value={this.state.description}
            onChange={(e, v) => this.onChange('description', v)}
            multiLine
            fullWidth
            style={{ marginTop: -20 }}
          />
          <div className="label" style={{ paddingTop: 20 }}>
            Show in diagram
          </div>
          <div className="input">
            <Checkbox
              name="show"
              value={this.state.show}
              checked={this.state.show}
              style={{ paddingTop: 20 }}
              onClick={() => this.onChange('show', !this.state.show)}
            />
          </div>
        </div>
      );
    }

    let dialog = (
      <Dialog
        title={'Attach Term'}
        actions={actions}
        modal={false}
        open={this.state.open}
        onRequestClose={this.handleClose}
        autoScrollBodyContent
        contentStyle={{ width: '450px', height: '500px' }}
        titleStyle={{ textAlign: 'center' }}
        paperClassName="addDialog"
      >
        <AutoComplete
          floatingLabelText={'Search for term title'}
          searchText={this.state.searchText}
          onUpdateInput={this.handleUpdateInput}
          onNewRequest={this.handleNewRequest}
          dataSource={this.getFilteredTermTitlesDropDown().map(termID => {
            return {
              textKey: this.props.Terms[termID].title,
              valueKey: termID,
            };
          })}
          filter={(searchText, key) => key.indexOf(searchText) !== -1}
          openOnFocus={true}
          dataSourceConfig={dataSourceConfig}
          fullWidth
          listStyle={{ maxHeight: 300, overflow: 'auto' }}
          errorText={
            !this.termExists() && this.state.searchText.length > 0
              ? "This term doesn't exist. To create and attach it, fill out its taxonomy and description."
              : ''
          }
          errorStyle={{ color: '#727272' }}
          floatingLabelFocusStyle={{ color: '#3A4B55' }}
        />
        {newTermForm}
      </Dialog>
    );

    return (
      <div style={{ float: 'right' }}>
        <IconButton
          tooltip="Attach a term"
          tabIndex={this.props.tabIndex}
          onClick={this.handleOpen}
        >
          <IconAdd />
        </IconButton>
        {dialog}
      </div>
    );
  }
}
