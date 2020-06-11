import React, { Component } from 'react';
import DeleteConfirmation from './DeleteConfirmation';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import IconSubmit from 'material-ui/svg-icons/action/done';
import IconClear from 'material-ui/svg-icons/content/clear';
import Checkbox from 'material-ui/Checkbox';
import SelectField from '../global/SelectField';
import ChipInput from 'material-ui-chip-input';

/** Create New Note tab in the Note Manager */
export default class EditNoteForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      id: props.note.id,
      title: props.note.title,
      type: props.note.type,
      description: props.note.description,
      URI: props.note.URI, // added URI
      editing: {
        title: false,
        description: false,
      },
      errors: {
        title: '',
      },
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      id: nextProps.note.id,
      title: nextProps.note.title,
      type: nextProps.note.type,
      description: nextProps.note.description,
      URI: props.note.URI, // added URI
      editing: {
        title: false,
        description: false,
      },
      errors: {
        title: '',
      },
    });
  }

  validateTitle = title => {
    for (let noteID in this.props.Notes) {
      const note = this.props.Notes[noteID];
      if (note.title === title && note.id !== this.state.id) {
        this.setState({ errors: { title: 'This note title already exists.' } });
        return;
      }
    }
    if (title.length > 100) {
      this.setState({
        errors: { title: 'Title must be less than 100 characters.' },
      });
    } else if (title.length === 0) {
      this.setState({ errors: { title: 'Title must not be empty.' } });
    } else {
      this.setState({ errors: { title: '' } });
    }
  };

  onChange = (name, value) => {
    this.setState({
      [name]: value,
      editing: { ...this.state.editing, [name]: true },
    });
    if (name === 'title') this.validateTitle(value.trim());
    if (name === 'type') {
      let editing = {
        title: this.state.title,
        type: value,
        description: this.state.description,
        URI: this.state.URI, // added URI
      };
      if (this.props.note)
        this.props.action.updateNote(this.props.note.id, editing);
    }
  };

  update = (event, name) => {
    event.preventDefault();
    if (this.props.note) {
      let editing = {
        title: this.state.title,
        type: this.state.type,
        description: this.state.description,
        URI: this.state.URI, // added URI
      };
      this.setState({ editing: { ...this.state.editing, [name]: false } });
      this.props.action.updateNote(this.props.note.id, editing);
    }
  };

  /**
   * Reset input field to original value
   */
  onCancelUpdate = name => {
    this.setState({
      [name]: this.props.note[name],
      editing: {
        ...this.state.editing,
        [name]: false,
      },
      errors: {
        ...this.state.errors,
        [name]: '',
      },
    });
  };

  renderNoteTypes = name => {
    return { value: name, text: name };
  };

  renderSubmitButtons = name => {
    if (
      this.state.editing[name] &&
      this.props.note !== null &&
      this.props.note !== undefined
    ) {
      return (
        <div style={{ width: '100%', textAlign: 'right' }}>
          <RaisedButton
            aria-label="Submit"
            primary
            icon={<IconSubmit />}
            style={{ minWidth: '60px', marginLeft: '5px' }}
            name="submit"
            type="submit"
            disabled={name === 'title' && this.state.errors.title !== ''}
          />
          <RaisedButton
            aria-label="Cancel"
            secondary
            icon={<IconClear />}
            style={{ minWidth: '60px', marginLeft: '5px' }}
            onClick={e => this.onCancelUpdate(name)}
          />
        </div>
      );
    } else {
      return '';
    }
  };

  handleAddChip = (chip, type) => {
    this.props.action.linkNote(this.props.note.id, [{ type, id: chip.value }]);
  };

  handleDeleteChip = (id, index, type) => {
    this.props.action.unlinkNote(this.props.note.id, [{ type, id }]);
  };

  render() {
    let title = this.props.isReadOnly
      ? this.props.note.title
      : 'Edit ' + this.props.note.title;
    let linkedObjects = '';
    let deleteButton = '';
    let sideData = [];
    for (let i = 0; i < this.props.leafIDs.length; i++) {
      const leaf = this.props.Leafs[this.props.leafIDs[i]];
      const recto = this.props.Rectos[leaf.rectoID];
      const verso = this.props.Versos[leaf.versoID];
      const rectoFolioNumber =
        recto.folio_number && recto.folio_number !== ''
          ? '(' + recto.folio_number + ')'
          : '';
      const rectoPageNumber =
        recto.page_number && recto.page_number !== ''
          ? '(' + recto.page_number + ')'
          : '';
      const versoFolioNumber =
        verso.folio_number && verso.folio_number !== ''
          ? '(' + verso.folio_number + ')'
          : '';
      const versoPageNumber =
        verso.page_number && verso.page_number !== ''
          ? '(' + verso.page_number + ')'
          : '';
      sideData.push({
        value: leaf.rectoID,
        label:
          'L' +
          (this.props.leafIDs.indexOf(leaf.id) + 1) +
          ' Recto ' +
          rectoFolioNumber +
          ' ' +
          rectoPageNumber,
      });
      sideData.push({
        value: leaf.versoID,
        label:
          'L' +
          (this.props.leafIDs.indexOf(leaf.id) + 1) +
          ' Verso ' +
          versoFolioNumber +
          ' ' +
          versoPageNumber,
      });
    }
    const linkToGroups = (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ width: 100 }}>Groups</div>
        <div style={{ width: '100%' }}>
          <ChipInput
            value={this.props.linkedGroups}
            dataSourceConfig={{ text: 'label', value: 'value' }}
            dataSource={Object.keys(this.props.Groups).map((itemID, index) => {
              return { value: itemID, label: 'Group ' + (index + 1) };
            })}
            onRequestAdd={chip => this.handleAddChip(chip, 'Group')}
            onRequestDelete={(chip, index) =>
              this.handleDeleteChip(chip, index, 'Group')
            }
            openOnFocus={true}
            fullWidth={true}
            fullWidthInput={false}
            hintText="Click here to attach groups to this note"
            menuProps={{ maxHeight: 200 }}
            tabIndex={this.props.tabIndex}
          />
        </div>
      </div>
    );
    const linkToLeaves = (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ width: 100 }}>Leaves</div>
        <div style={{ width: '100%' }}>
          <ChipInput
            value={this.props.linkedLeaves}
            dataSourceConfig={{ text: 'label', value: 'value' }}
            dataSource={this.props.leafIDs.map((itemID, index) => {
              return { value: itemID, label: 'Leaf ' + (index + 1) };
            })}
            onRequestAdd={chip => this.handleAddChip(chip, 'Leaf')}
            onRequestDelete={(chip, index) =>
              this.handleDeleteChip(chip, index, 'Leaf')
            }
            openOnFocus={true}
            fullWidth={true}
            fullWidthInput={false}
            hintText="Click here to attach leaves to this note"
            menuProps={{ maxHeight: 200 }}
            tabIndex={this.props.tabIndex}
          />
        </div>
      </div>
    );
    const linkToSides = (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ width: 100 }}>Sides</div>
        <div style={{ width: '100%' }}>
          <ChipInput
            value={this.props.linkedSides}
            dataSourceConfig={{ text: 'label', value: 'value' }}
            dataSource={sideData}
            onRequestAdd={chip => this.handleAddChip(chip, 'Side')}
            onRequestDelete={(chip, index) =>
              this.handleDeleteChip(chip, index, chip.split('_')[0])
            }
            openOnFocus={true}
            fullWidth={true}
            fullWidthInput={false}
            hintText="Click here to attach sides to this note"
            menuProps={{ maxHeight: 200 }}
            tabIndex={this.props.tabIndex}
          />
        </div>
      </div>
    );

    if (this.props.note) {
      linkedObjects = (
        <div className="objectAttachments">
          {this.props.isReadOnly ? (
            ''
          ) : (
            <div>
              <h2>Attached to</h2>
              {linkToSides}
              {linkToLeaves}
              {linkToGroups}
            </div>
          )}
        </div>
      );
      deleteButton = this.props.isReadOnly ? (
        ''
      ) : (
        <div style={{ width: '100%', textAlign: 'right' }}>
          <DeleteConfirmation
            item={this.props.note ? 'note' : ''}
            noteID={this.props.note ? this.props.note.id : ''}
            action={{ deleteNote: this.props.action.deleteNote }}
            togglePopUp={this.props.togglePopUp}
            tabIndex={this.props.tabIndex}
          />
        </div>
      );
    }
    return (
      <div className="container">
        <h1>{title}</h1>
        <div className="noteForm">
          <div className="label" id="noteTitleLabel">
            Title
          </div>
          <div className="input">
            {this.props.isReadOnly ? (
              <div className="textOnly">{this.state.title}</div>
            ) : (
              <form onSubmit={e => this.update(e, 'title')}>
                <TextField
                  aria-labelledby="noteTitleLabel"
                  name="title"
                  value={this.state.title}
                  errorText={this.state.errors.title}
                  onChange={(e, v) => this.onChange('title', v)}
                  fullWidth
                  autoFocus
                  aria-invalid={this.state.errors.title.length > 0}
                  tabIndex={this.props.tabIndex}
                />
                {this.renderSubmitButtons('title')}
              </form>
            )}
          </div>
          <div className="label" id="noteTypeLabel">
            Type
          </div>
          <div className="input">
            {this.props.isReadOnly ? (
              <div className="textOnly">{this.state.type}</div>
            ) : (
              <SelectField
                id="noteTypeSelect"
                label="noteTypeLabel"
                value={this.state.type}
                onChange={v => this.onChange('type', v)}
                tabIndex={this.props.tabIndex}
                data={this.props.noteTypes.map(this.renderNoteTypes)}
              />
            )}
          </div>
          <div className="label" id="noteDescriptionLabel">
            Description
          </div>
          <div className="input">
            {this.props.isReadOnly ? (
              <div className="textOnly">{this.state.description}</div>
            ) : (
              <form onSubmit={e => this.update(e, 'description')}>
                <TextField
                  aria-labelledby="noteDescriptionLabel"
                  name="description"
                  value={this.state.description}
                  onChange={(e, v) => this.onChange('description', v)}
                  multiLine
                  fullWidth
                  tabIndex={this.props.tabIndex}
                />
                {this.renderSubmitButtons('description')}
              </form>
            )}
          </div>
          {/* added URI input to view */}
          <div className="label" id="noteURILabel">
            URI
          </div>
          <div className="input">
            {this.props.isReadOnly ? (
              <div className="textOnly">{this.state.URI}</div>
            ) : (
              <form onSubmit={e => this.update(e, 'URI')}>
                <TextField
                  aria-labelledby="noteURILabel"
                  name="URI"
                  value={this.state.URI}
                  onChange={(e, v) => this.onChange('URI', v)}
                  multiLine
                  fullWidth
                  tabIndex={this.props.tabIndex}
                />
                {this.renderSubmitButtons('URI')}
              </form>
            )}
          </div>
          {!this.props.isReadOnly && (
            <div>
              <div className="label" id="noteShowLabel">
                Show in diagram
              </div>
              <div className="input">
                <Checkbox
                  aria-labelledby="noteShowLabel"
                  checked={this.props.note.show}
                  style={{ paddingTop: 20 }}
                  onClick={() =>
                    this.props.action.updateNote(this.props.note.id, {
                      title: this.state.title,
                      type: this.state.type,
                      description: this.state.description,
                      show: !this.props.note.show,
                    })
                  }
                  tabIndex={this.props.tabIndex}
                />
              </div>
            </div>
          )}

          {linkedObjects}
          {deleteButton}
        </div>
      </div>
    );
  }
}
