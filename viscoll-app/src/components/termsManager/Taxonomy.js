import React, { Component } from 'react';
import DeleteConfirmation from './DeleteConfirmation';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import IconSubmit from 'material-ui/svg-icons/action/done';
import IconClear from 'material-ui/svg-icons/content/clear';

/** Taxonomy page to add, edit and delete taxonomies */
export default class Taxonomy extends Component {
  constructor(props) {
    super(props);
    this.state = {
      newTaxonomy: '',
      Taxonomies: [...props.Taxonomies],
      editing: new Array(props.Taxonomies.length).fill(false),
      errorNewTaxonomy: '',
      errorTypes: new Array(props.Taxonomies.length).fill(''),
      lastSubmitted: -2,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (
      this.state.Taxonomies.length !== nextProps.Taxonomies.length ||
      this.props.Taxonomies !== nextProps.Taxonomies
    ) {
      this.setState({ Taxonomies: [...nextProps.Taxonomies] });
      this.resetEditing();
    }
  }

  resetEditing = () => {
    this.setState({
      editing: new Array(this.props.Taxonomies.length).fill(false),
      newTaxonomy: '',
    });
  };

  onNewTaxonomyChange = newTaxonomy => {
    this.setState({ newTaxonomy }, () => {
      if (!this.isValid(newTaxonomy.trim())) {
        let errorMessage = `Taxonomy with name ${newTaxonomy} already exists in this project`;
        if (newTaxonomy.length === 0) errorMessage = '';
        this.setState({ errorNewTaxonomy: errorMessage });
      } else {
        this.setState({ errorNewTaxonomy: '' });
      }
    });
  };

  onChange = (newTaxonomy, index) => {
    this.setTaxonomy(index, newTaxonomy);
    this.setEditing(index, true);
    if (!this.isValid(newTaxonomy)) {
      let errorMessage = `Taxonomy with name ${newTaxonomy} already exists in this project`;
      if (newTaxonomy === this.props.Taxonomies[index]) errorMessage = '';
      if (newTaxonomy.length === 0) errorMessage = `Taxonomy cannot be blank`;
      this.setError(index, errorMessage);
    } else {
      this.setError(index, '');
    }
  };

  onUpdate = (event, index) => {
    event.preventDefault();
    const newTaxonomy = this.state.Taxonomies[index];
    if (newTaxonomy !== this.props.Taxonomies[index]) {
      this.setState({ lastSubmitted: index });
      let taxonomy = {
        project_id: this.props.projectID,
        taxonomy: newTaxonomy,
        old_taxonomy: this.props.Taxonomies[index],
      };
      this.props.action.updateTaxonomy(taxonomy);
    }
    this.setEditing(index, false);
  };

  isValid = newTaxonomy => {
    return !this.props.Taxonomies.includes(newTaxonomy) && newTaxonomy.length !== 0;
  };

  onDelete = index => {
    let taxonomy = {
      project_id: this.props.projectID,
      taxonomy: this.state.Taxonomies[index],
    };
    let updatedEditing = [...this.state.editing];
    updatedEditing.splice(index, 1);
    this.setState({ editing: updatedEditing }, () => {
      this.props.action.deleteTaxonomy(taxonomy);
    });
  };

  onCreate = event => {
    event.preventDefault();
    let taxonomy = {
      project_id: this.props.projectID,
      taxonomy: this.state.newTaxonomy.trim(),
    };
    this.props.action.createTaxonomy(taxonomy);
    this.resetEditing();
    this.setState({ lastSubmitted: -1 });
  };

  onCancelUpdate = index => {
    this.setTaxonomy(index, this.props.Taxonomies[index]);
    this.setError(index, '');
    this.setEditing(index, false);
  };

  setTaxonomy = (index, value) => {
    let newTaxonomies = [...this.state.Taxonomies];
    newTaxonomies[index] = value;
    this.setState({ Taxonomies: newTaxonomies });
  };

  setEditing = (index, value) => {
    let newEditing = [...this.state.editing];
    newEditing[index] = value;
    this.setState({ editing: newEditing });
  };

  setError = (index, value) => {
    let newErrors = [...this.state.errorTypes];
    newErrors[index] = value;
    this.setState({ errorTypes: newErrors });
  };

  renderSubmitButtons = index => {
    if (this.state.editing[index]) {
      return (
        <div style={{ float: 'right', marginRight: '25%' }}>
          <RaisedButton
            aria-label="Submit"
            primary
            icon={<IconSubmit />}
            style={{ minWidth: '60px', marginLeft: '5px' }}
            name="submit"
            type="submit"
            disabled={!this.isValid(this.state.Taxonomies[index])}
          />
          <RaisedButton
            aria-label="Cancel"
            secondary
            icon={<IconClear />}
            style={{ minWidth: '60px', marginLeft: '5px' }}
            onClick={e => this.onCancelUpdate(index)}
          />
        </div>
      );
    } else {
      return '';
    }
  };

  renderTaxonomy = (taxonomy, index) => {
    return (
      <div key={'taxonomy_' + index} className="item">
        <form onSubmit={e => this.onUpdate(e, index)}>
          <TextField
            aria-label={taxonomy + ' taxonomy'}
            name={'taxonomy_' + index}
            value={this.state.Taxonomies[index]}
            onChange={(e, v) => this.onChange(v, index)}
            errorText={this.state.errorTypes[index]}
            aria-invalid={
              this.state.errorTypes[index] !== undefined &&
              this.state.errorTypes[index].length > 0
            }
            style={{ width: '75%' }}
            tabIndex={this.props.tabIndex}
          />
          {taxonomy === 'Unknown' ? (
            ''
          ) : (
            <DeleteConfirmation
              item="taxonomy"
              onDelete={this.onDelete}
              index={index}
              itemName={taxonomy}
              togglePopUp={this.props.togglePopUp}
              tabIndex={this.props.tabIndex}
            />
          )}
          {this.renderSubmitButtons(index)}
        </form>
      </div>
    );
  };

  filterTaxonomy = (object, index) => {
    return object.key !== 'taxonomy_0';
  };

  render() {
    return (
      <div className="taxonomy" role="region" aria-label="main">
        <h2 style={{ paddingTop: 0 }}>Add a new taxonomy</h2>
        <form onSubmit={e => this.onCreate(e)}>
          <div className="create">
            <div className="input">
              <TextField
                aria-label="New taxonomy"
                name="newTaxonomy"
                value={this.state.newTaxonomy}
                onChange={(e, v) => this.onNewTaxonomyChange(v)}
                errorText={this.state.errorNewTaxonomy}
                aria-invalid={this.state.errorNewTaxonomy.length > 0}
                style={{ width: 300 }}
                tabIndex={this.props.tabIndex}
              />
            </div>
            <div className="submit">
              <RaisedButton
                label="Create"
                primary
                type="submit"
                disabled={!this.isValid(this.state.newTaxonomy)}
                tabIndex={this.props.tabIndex}
              />
            </div>
          </div>
        </form>
        <h2>Your taxonomies</h2>
        <div className="items">
          {this.props.Taxonomies
            .map(this.renderTaxonomy)
            .filter(this.filterTaxonomy)}
        </div>
      </div>
    );
  }
}
