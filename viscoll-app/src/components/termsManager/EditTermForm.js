import React, { Component } from 'react';
import DeleteConfirmation from './DeleteConfirmation';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import IconSubmit from 'material-ui/svg-icons/action/done';
import IconClear from 'material-ui/svg-icons/content/clear';
import Checkbox from 'material-ui/Checkbox';
import SelectField from '../global/SelectField';
import ChipInput from 'material-ui-chip-input';

/** Create New Term tab in the Term Manager */
export default class EditTermForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      id: props.term.id,
      title: props.term.title,
      taxonomy: props.term.taxonomy,
      description: props.term.description,
      uri: props.term.uri,
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
      id: nextProps.term.id,
      title: nextProps.term.title,
      taxonomy: nextProps.term.taxonomy,
      description: nextProps.term.description,
      uri: nextProps.term.uri, // added URI
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
    for (let termID in this.props.Terms) {
      const term = this.props.Terms[termID];
      if (term.title === title && term.id !== this.state.id) {
        this.setState({ errors: { title: 'This term title already exists.' } });
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
    if (name === 'taxonomy') {
      let editing = {
        title: this.state.title,
        taxonomy: value,
        description: this.state.description,
        uri: this.state.uri, // added URI
      };
      if (this.props.term)
        this.props.action.updateTerm(this.props.term.id, editing);
    }
  };

  update = (event, name) => {
    event.preventDefault();
    if (this.props.term) {
      let editing = {
        title: this.state.title,
        taxonomy: this.state.taxonomy,
        description: this.state.description,
        uri: this.state.uri, // added URI
      };
      this.setState({ editing: { ...this.state.editing, [name]: false } });
      this.props.action.updateTerm(this.props.term.id, editing);
    }
  };

  /**
   * Reset input field to original value
   */
  onCancelUpdate = name => {
    this.setState({
      [name]: this.props.term[name],
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

  renderTaxonomies = name => {
    return { value: name, text: name };
  };

  renderSubmitButtons = name => {
    if (
      this.state.editing[name] &&
      this.props.term !== null &&
      this.props.term !== undefined
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
    this.props.action.linkTerm(this.props.term.id, [{ type, id: chip.value }]);
  };

  handleDeleteChip = (id, index, type) => {
    this.props.action.unlinkTerm(this.props.term.id, [{ type, id }]);
  };

  render() {
    let title = this.props.isReadOnly
      ? this.props.term.title
      : 'Edit ' + this.props.term.title;
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
            hintText="Click here to attach groups to this term"
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
            hintText="Click here to attach leaves to this term"
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
            hintText="Click here to attach sides to this term"
            menuProps={{ maxHeight: 200 }}
            tabIndex={this.props.tabIndex}
          />
        </div>
      </div>
    );

    if (this.props.term) {
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
            item={this.props.term ? 'term' : ''}
            termID={this.props.term ? this.props.term.id : ''}
            action={{ deleteTerm: this.props.action.deleteTerm }}
            togglePopUp={this.props.togglePopUp}
            tabIndex={this.props.tabIndex}
          />
        </div>
      );
    }
    return (
      <div className="container">
        <h1>{title}</h1>
        <div className="termForm">
          <div className="label" id="termTitleLabel">
            Title
          </div>
          <div className="input">
            {this.props.isReadOnly ? (
              <div className="textOnly">{this.state.title}</div>
            ) : (
              <form onSubmit={e => this.update(e, 'title')}>
                <TextField
                  aria-labelledby="termTitleLabel"
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
          <div className="label" id="taxonomyLabel">
            Taxonomy
          </div>
          <div className="input">
            {this.props.isReadOnly ? (
              <div className="textOnly">{this.state.taxonomy}</div>
            ) : (
              <SelectField
                id="taxonomySelect"
                label="taxonomyLabel"
                value={this.state.taxonomy}
                onChange={v => this.onChange('taxonomy', v)}
                tabIndex={this.props.tabIndex}
                data={this.props.Taxonomies.map(this.renderTaxonomies)}
              />
            )}
          </div>
          <div className="label" id="termDescriptionLabel">
            Description
          </div>
          <div className="input">
            {this.props.isReadOnly ? (
              <div className="textOnly">{this.state.description}</div>
            ) : (
              <form onSubmit={e => this.update(e, 'description')}>
                <TextField
                  aria-labelledby="termDescriptionLabel"
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
          <div className="label" id="termURILabel">
            URI
          </div>
          <div className="input">
            {this.props.isReadOnly ? (
              <div className="textOnly">{this.state.uri}</div>
            ) : (
              <form onSubmit={e => this.update(e, 'uri')}>
                <TextField
                  aria-labelledby="termURILabel"
                  name="uri"
                  value={this.state.uri}
                  //value="URI"
                  onChange={(e, v) => this.onChange('uri', v)}
                  multiLine
                  fullWidth
                  tabIndex={this.props.tabIndex}
                />
                {this.renderSubmitButtons('uri')}
              </form>
            )}
          </div>
          {!this.props.isReadOnly && (
            <div>
              <div className="label" id="termShowLabel">
                Show in diagram
              </div>
              <div className="input">
                <Checkbox
                  aria-labelledby="termShowLabel"
                  checked={this.props.term.show}
                  style={{ paddingTop: 20 }}
                  onClick={() =>
                    this.props.action.updateTerm(this.props.term.id, {
                      title: this.state.title,
                      taxonomy: this.state.taxonomy,
                      description: this.state.description,
                      show: !this.props.term.show,
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
