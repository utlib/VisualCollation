import React, {Component} from 'react';
import PropTypes from 'prop-types';
import DeleteConfirmation from './DeleteConfirmation';
import TextField from 'material-ui/TextField';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import RaisedButton from 'material-ui/RaisedButton';
import IconSubmit from 'material-ui/svg-icons/action/done';
import IconClear from 'material-ui/svg-icons/content/clear';
import Chip from 'material-ui/Chip';
import MultiSelectAutoComplete from '../../helpers/MultiSelectAutoComplete';
import Checkbox from 'material-ui/Checkbox';


/** Create New Note tab in the Note Manager */
export default class EditNoteForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      id: props.note.id,
      title: props.note.title,
      type: props.note.type,
      description: props.note.description,
      linkType: "",
      editing: {
        title: false,
        description: false,
      },
      errors: {
        title: "",
      }
    };
  }


  componentWillReceiveProps(nextProps) {
    this.setState({
      id: nextProps.note.id,
      title: nextProps.note.title,
      type: nextProps.note.type,
      description: nextProps.note.description,
      linkType: "",
      editing: {
        title: false,
        description: false,
      },
      errors: {
        title: "",
      }
    })
  }


  /**
   * Validates title
   * @param {string} title
   * @public
   */
  validateTitle = (title) => {
    for (let noteID in this.props.Notes) {
      const note = this.props.Notes[noteID];
      if (note.title===title && note.id!==this.state.id) {
        this.setState({errors:{title:"This note title already exists."}});
        return;
      };
    }
    if (title.length>100) {
        this.setState({errors:{title:"Title must be less than 100 characters."}});
    } else if (title.length===0) {
        this.setState({errors:{title:"Title must not be empty."}});
    } else {
      this.setState({errors:{title:""}});
    }
  }

  /**
   * Update state on input change
   * @param {string} name input name
   * @param {string} value new value
   * @public
   */
  onChange = (name, value) => {
    this.setState({[name]:value, editing: {...this.state.editing, [name]: true}});
    if (name==="title") this.validateTitle(value.trim());
    if (name==="type") {
      let editing = {
        title: this.state.title,
        type: value,
        description: this.state.description,
      }
      if (this.props.note)
        this.props.action.updateNote(this.props.note.id, editing);
    }
  }

  /**
   * Update new note 
   * @public
   */
  update = (event, name) => {
    event.preventDefault();
    if (this.props.note) {
      let editing = {
        title: this.state.title,
        type: this.state.type,
        description: this.state.description,
      }
      this.setState({editing: {...this.state.editing, [name]:false}});
      this.props.action.updateNote(this.props.note.id, editing);
    }
  }
  
  /**
   * Reset input field to original value
   * @param {string} name input field name
   * @public
   */
  onCancelUpdate = (name) => {
    this.setState({
      [name]: this.props.note[name], 
      editing: {
        ...this.state.editing, 
        [name]: false
      }, 
      errors: {
        ...this.state.errors, 
        [name]: ""
      }
    });
  }


  /**
   * Mapping function to render one note type menu item 
   * @param {string} name note type name
   * @public
   */
  renderNoteTypes = (name) => {
    return <MenuItem key={name} value={name} primaryText={name} />;
  }


  renderMenuItem = (itemID, type, index) => {
    const item = this.props[type+"s"][itemID];
    let label = `${type} ${item.order}`;
    if (type==="Side") {
      const leaf = this.props.Leafs[item.parentID];
      let sideName = item.memberType;
      label = `Leaf ${leaf.order}: ${type} ${sideName}`
    }
    return (
      <div key={item.id} value={item.id} label={label}>
        {label}
      </div>
    );      
  }

  getCurrentValues = (type) => {
    let resultIDs;
    switch (type) {
      case "Group":
        resultIDs = this.props.linkedGroups.map((item)=>{return item.value})
        break;
      case "Leaf":
        resultIDs = this.props.linkedLeaves.map((item)=>{return item.value})
        break;
      case "Side":
        resultIDs = this.props.linkedSides.map((item)=>{return item.value})
        break;
      default:
        break;
    }
    return resultIDs;
  }


  getNonIntersectingItems = (newList, oldList) => {
    let newListUniqueItems = newList.filter((item)=>{return !oldList.includes(item)});
    let oldListUniqueItems = oldList.filter((item)=>{return !newList.includes(item)});
    return [...newListUniqueItems, ...oldListUniqueItems]
  }


  updatedObjects = (values, type) => {
    let objIDs = [];
    for (let item of values) {
      objIDs.push(item.value)
    }
    let currentValues = this.getCurrentValues(type);
    let diff = this.getNonIntersectingItems(objIDs, currentValues);
    let objectsToUnlink = [];
    let objectsToLink = [];
    for (let objID of diff) {
      if (currentValues.includes(objID)){
        objectsToUnlink.push({id:objID, type})    
      }
      if (objIDs.includes(objID)){
        objectsToLink.push({id:objID, type})
      }
    }
    let linkedObjects;
    switch (type) {
      case "Group":
        linkedObjects = "linkedGroups"
        break;
      case "Leaf":
        linkedObjects = "linkedLeaves"
        break;
      case "Side":
        linkedObjects = "linkedSides"
        break;
      default:
        break;
    }
    if (diff.length > 0){
      this.setState({[linkedObjects]: values}, ()=>{
        this.props.action.linkAndUnlinkNotes(this.props.note.id, objectsToLink, objectsToUnlink);
      });
    }
  }


  /**
   * Return a generated HTML of submit and cancel buttons for a specific input name
   * @param {string} name name of input field
   * @public
   */
  renderSubmitButtons = (name) => {
    if (this.state.editing[name] && this.props.note!==null && this.props.note!==undefined) {
      return (
        <div style={{width: '100%', textAlign:'right'}}>
          <RaisedButton
            primary
            icon={<IconSubmit />}
            style={{minWidth:"60px",marginLeft:"5px"}}
            name="submit"
            type="submit"
            disabled={name==="title" && this.state.errors.title!==""}
          />
          <RaisedButton
            secondary
            icon={<IconClear />}
            style={{minWidth:"60px",marginLeft:"5px"}}
            onTouchTap={(e)=>this.onCancelUpdate(name)}
          />
        </div>
      )
    } else {
      return "";
    }
  }

  /**
   * Render all group, leaf and side chips that this note is attached to  
   * @public
   */
  renderChips = () => {
    let chips = [];
    if (this.props.note) {
      for (let key of this.props.note.objects.Group) {
        chips.push(this.renderChip("Group", key));
      }
      for (let key of this.props.note.objects.Leaf) {
        chips.push(this.renderChip("Leaf", key));
      }
      for (let key of this.props.note.objects.Recto) {
        chips.push(this.renderChip("Side", key));
      }
      for (let key of this.props.note.objects.Verso) {
        chips.push(this.renderChip("Side", key));
      }
    }
    return chips;
  }

  /**
   * Render a single chip
   * @param {string} type
   * @param {array} order [object order, leaf order (if object is a side)]
   * @public
   */
  renderChip = (type, id) => {
    let name;
    if (type==="Side") {
      if (this.props.Rectos.hasOwnProperty(id)){
        const recto = this.props.Rectos[id];
        const leafOrder = this.props.Leafs[recto.parentID].order
        name = `Leaf ${leafOrder}: Side Recto`;
        type = "Recto"
      } else {
        const verso = this.props.Versos[id];
        const leafOrder = this.props.Leafs[verso.parentID].order
        name = `Leaf ${leafOrder}: Side Verso`;
        type = "Verso"
      }
    } else if (type==="Group"){
      const group = this.props.Groups[id];
      name = `Group ${group.order}`;
    } else {
      const leaf = this.props.Leafs[id];
      name = `Leaf ${leaf.order}`;
    }
    let deleteFn = ()=>this.props.action.unlinkNote(this.props.note.id, [{type, id}]);
    if (this.props.isReadOnly) deleteFn = null;
    return (
      <Chip 
        key={id}
        style={{marginRight:4, marginBottom:4}}
        onRequestDelete={deleteFn}
        onClick={()=>{}}
      >
        {name}
      </Chip>
    );
  }


  render() {
    let title = this.props.isReadOnly? this.props.note.title : "Edit " + this.props.note.title;
    let linkedObjects = "";
    let deleteButton = "";
    let chips = this.renderChips();
    let objectDropDown = "";
    if (this.state.linkType==="Group") {
      objectDropDown = (
        <div style={{ display: 'inline-block',verticalAlign:'top',marginTop:8,marginLeft:10}}>
          <MultiSelectAutoComplete 
            updateSelectedItems={(selected) => this.updatedObjects(selected, "Group")}
            selectedItems={this.props.linkedGroups}
          >
            {Object.keys(this.props.Groups).map((itemID)=>this.renderMenuItem(itemID, "Group"))}
          </MultiSelectAutoComplete >
        </div>
      );
    } else if (this.state.linkType==="Leaf") {
      objectDropDown = (
        <div style={{ display: 'inline-block',verticalAlign:'top',marginTop:8,marginLeft:10}}>
          <MultiSelectAutoComplete 
            updateSelectedItems={(selected) => this.updatedObjects(selected, "Leaf")}
            selectedItems={this.props.linkedLeaves}
          >
            {Object.keys(this.props.Leafs).map((itemID)=>this.renderMenuItem(itemID, "Leaf"))}
          </MultiSelectAutoComplete >
        </div>
      );
    } else if (this.state.linkType==="Side") {
      objectDropDown = (
        <div style={{ display: 'inline-block',verticalAlign:'top',marginTop:8,marginLeft:10}}>
          <MultiSelectAutoComplete 
            updateSelectedItems={(selected) => this.updatedObjects(selected, "Side")}
            selectedItems={this.props.linkedSides}
          >
            {Object.keys(this.props.Sides).map((itemID, index)=>this.renderMenuItem(itemID, "Side", index))}
          </MultiSelectAutoComplete >
        </div>
      );
    }
    if (this.props.note) {
      linkedObjects = (
        <div className="objectAttachments">
          { chips.length>0? 
          <div>
            <h2>Attached to</h2>
            <div style={{overflowY:"auto",maxHeight:120}}>
              <div style={{display:"flex",flexWrap:"wrap"}}>
                {chips}
              </div>
            </div>
          </div>
          : ""
          }
          {this.props.isReadOnly?"":<div>
          <h2>Attach a new item</h2>
          <SelectField
            floatingLabelText="Type"
            maxHeight={300}
            onChange={(e,i,v)=>this.setState({linkType:v})}
            value={this.state.linkType}
            style={{marginTop:"-2em",width:120}}
          >
            {["Group", "Leaf", "Side"].map((type) => {
              return <MenuItem key={`${type}`} value={`${type}`} primaryText={`${type}`} /> ;
            })}
          </SelectField>
          {objectDropDown}
          </div>
          }
        </div>);
      deleteButton = this.props.isReadOnly?"":<div style={{width: "100%", textAlign:"right"}}>
        <DeleteConfirmation 
            item={this.props.note?"note": ""}
            noteID={this.props.note? this.props.note.id : ""}
            action={{deleteNote: this.props.action.deleteNote}}
          />
        </div>
    }
    return (
      <div className="container">
        <h1>{title}</h1> 
        <div className="noteForm">
          <div className="label">
            Title
          </div>
          <div className="input">
            {this.props.isReadOnly? <div className="textOnly">{this.state.title}</div> :
            <form onSubmit={(e)=>this.update(e, "title")}>
              <TextField
              name="title"
              value={this.state.title}
              errorText={this.state.errors.title}
              onChange={(e,v)=>this.onChange("title",v)}
              fullWidth
              />
              {this.renderSubmitButtons("title")}
            </form>}
          </div>
          <div className="label">
            Type
          </div>
          <div className="input">
            {this.props.isReadOnly? <div className="textOnly">{this.state.type}</div> :
            <SelectField
              value={this.state.type}
              onChange={(e,i,v)=>this.onChange("type",v)}
            >
              {this.props.noteTypes.map(this.renderNoteTypes)}
            </SelectField>}
          </div>
          <div className="label">
            Description
          </div>
          <div className="input">
            {this.props.isReadOnly? <div className="textOnly">{this.state.description}</div> :
            <form onSubmit={(e)=>this.update(e, "description")}>
              <TextField
                name="description"
                value={this.state.description}
                onChange={(e,v)=>this.onChange("description",v)}
                multiLine
                fullWidth
              />
              {this.renderSubmitButtons("description")}
            </form>}
          </div>
          <div className="label">
            Show in diagram
          </div>
          <div className="input">
            <Checkbox
              checked={this.props.note.show}
              style={{paddingTop:20}}
              onCheck={(e,v)=>this.props.action.updateNote(this.props.note.id, {title:this.state.title,type:this.state.type,description:this.state.description,show:v})}
            />
          </div>
          {linkedObjects}
          {deleteButton}
        </div>
      </div>
    );
  }
  static propTypes = {
    /** Active project ID */
    projectID: PropTypes.string
  }
}
