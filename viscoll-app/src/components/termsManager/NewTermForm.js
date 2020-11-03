import React, { Component } from 'react';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import Checkbox from 'material-ui/Checkbox';
import SelectField from '../global/SelectField';

/** Create New Term tab in the Term Manager */
export default class NewTermForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      //the state is managed from the component itself
      title: '', //this is why a class component was used
      taxonomy: '',
      description: '',
      uri: '',
      show: false,
      errors: {
        title: '',
      },
    };
  }

  initialState = {};

  //ensure title validates (is not a duplicate, too long etc)
  validateTitle = title => {
    for (let termID in this.props.Terms) {
      const term = this.props.Terms[termID];
      if (term.title === title) {
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
        show: this.state.show,
      };
      if (this.props.term)
        this.props.action.updateTerm(this.props.term.id, editing);
    }
  };

  create = () => {
    let term = {
      project_id: this.props.projectID,
      title: this.state.title,
      taxonomy: this.state.taxonomy,
      description: this.state.description,
      uri: this.state.uri,
      show: this.state.show,
    };
    this.props.action.addTerm(term);
    // Reset form
    this.setState({
      title: '',
      taxonomy: '',
      description: '',
      uri: '',
      show: false,
      errors: {
        title: '',
      },
    });
  };

  /**
   * Clear values in the input fields if we are creating a new term
   * Reset to original values if we are editing an existing term
   */
  reset = props => {
    this.setState({
      title: '',
      taxonomy: '',
      description: '',
      uri: '',
      errors: {
        title: '',
        taxonomy: '',
        description: '',
        uri: '',
        show: false,
      },
    });
  };

  renderTaxonomies = name => {
    return { value: name, text: name };
  };

  renderMenuItem = (item, type, index) => {
    let label = '';
    if (type === 'Side') {
      let sideName = item.charAt(0) === 'R' ? 'Recto' : 'Verso';
      label = `Leaf ${Math.ceil((index - 3) / 2)}: ${type} ${sideName}`;
    } else {
      const itemOrder =
        this.props[`${type.toLowerCase()}IDs`].indexOf(item.id) + 1;
      label = `${type} ${itemOrder}`;
    }
    return (
      <div key={item.id} value={item.id} label={label}>
        {label}
      </div>
    );
  };

  render() {
    let title = 'Create a new term';
    let createButtons = (
      <div className="buttons">
        <RaisedButton
          label={'Reset'}
          onClick={() => this.reset()}
          style={{ width: 120 }}
        />{' '}
        &nbsp;
        <RaisedButton
          label={'Create'}
          primary
          style={{ width: 120 }}
          onClick={() => this.create()}
          disabled={
            this.state.errors.title !== '' ||
            this.state.taxonomy === '' ||
            this.state.title === ''
          }
        />
      </div>
    );

    return (
      <div className="container">
        <h1>{title}</h1>
        <div className="termForm">
          <div className="label" id="newTermTitle">
            Title
          </div>
          <div className="input">
            <TextField
              aria-labelledby="newTermTitle"
              name="title"
              value={this.state.title}
              errorText={this.state.errors.title}
              onChange={(e, v) => this.onChange('title', v)}
              fullWidth
              aria-invalid={this.state.errors.title.length > 0}
            />
          </div>
          <div className="label" id="newTaxonomy">
            Taxonomy
          </div>
          <div className="input">
            <SelectField
              label="newTaxonomy"
              id="newTaxonomy"
              value={this.state.taxonomy}
              onChange={(v, i) => this.onChange('taxonomy', v)}
              data={this.props.Taxonomies.map(this.renderTaxonomies)}
            ></SelectField>
          </div>
          <div className="label" id="newTermDescription">
            Description
          </div>
          <div className="input">
            <TextField
              aria-labelledby="newTermDescription"
              name="description"
              value={this.state.description}
              onChange={(e, v) => this.onChange('description', v)}
              multiLine
              fullWidth
            />
          </div>
          <div className="label" id="newTermURI">
            URI
          </div>
          <div className="input">
            <TextField
              aria-labelledby="newTermURI"
              name="uri"
              value={this.state.uri}
              onChange={(e, v) => this.onChange('uri', v)}
              multiLine
              fullWidth
            />
          </div>
          <div className="label" style={{ paddingTop: 20 }} id="newTermShow">
            Show in diagram
          </div>
          <div className="input">
            <Checkbox
              aria-labelledby="newTermShow"
              name="show"
              value={this.state.show}
              checked={this.state.show}
              style={{ paddingTop: 20 }}
              onClick={() => this.onChange('show', !this.state.show)}
            />
          </div>
          {createButtons}
        </div>
      </div>
    );
  }
}
