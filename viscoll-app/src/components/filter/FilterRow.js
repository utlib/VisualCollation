import React, {Component} from 'react';
import {floatFieldLight} from '../../styles/textfield';
import MenuItem from 'material-ui/MenuItem';
import TextField from 'material-ui/TextField';
import IconClear from 'material-ui/svg-icons/content/clear';
import ContentAdd from 'material-ui/svg-icons/content/add';
import IconButton from 'material-ui/IconButton';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import SelectField from '../global/SelectField';

/** A row of filter query */
class FilterRow extends Component {

  renderAttributeMenuItems = () => {
    if (this.props.type) {
      return this.props.defaultAttributes[this.props.type].map(this.mapAttributeMenuItems);
    } else {
      return [];
    }
  }
  mapNoteAttributeMenuItems = (noteType, index) => {
    return { key:noteType+index, value:noteType, text:noteType }
  }
  mapAttributeMenuItems = (item, index) => {
    return { key:item.name+index, value:item.name, text:item.displayName}
  }
  renderValueItems = (item, index) => {
    return <MenuItem insetChildren key={item} value={item} primaryText={item} checked={this.props.values && this.props.values.indexOf(item) > -1} />;
  }

  mapConditionItems = (item) => {
    return { key:item, value:item, text:item}
  }

  filterConditionItems = (item) => {
    let isDropdown = false;
    try {
      isDropdown = (this.props.defaultAttributes[this.props.type][this.props.attributeIndex]['isDropdown']);
    } catch (e) { }
    return ((!isDropdown && item && !item.includes("equal"))|| (isDropdown && item && !item.includes("contain")));
  }

  renderValueField = () => {
    let input =<TextField 
        aria-label="Query value"
        hintText="Value" 
        style={{paddingTop: 24, width: '100%'}}
        disabled
        tabIndex={this.props.tabIndex}
        {...floatFieldLight}
      />;
    if (this.props.attributeIndex!=="") {
      try {
        if (this.props.defaultAttributes[this.props.type] && this.props.defaultAttributes[this.props.type][this.props.attributeIndex]['options']!==undefined) {
            input = <SelectField
              id="valueSelectField"
              label="Select a value"
              floatingLabelText="Value"
              data={this.props.defaultAttributes[this.props.type][this.props.attributeIndex]['options'].map((x)=>{return{text:x,value:x}})}
              tabIndex={this.props.tabIndex}
              errorText={(this.props.type!==null && this.props.values.length===0)?"Required":""}
              onChange={(v,i)=>this.props.onChange(this.props.queryIndex,"values",i,[v])}
            />
        } 
        else if (this.props.defaultAttributes[this.props.type] && this.props.defaultAttributes[this.props.type][this.props.attributeIndex]['name']==="conjoined_to"){
          input = 
          (
            <SelectField
              id="conjoinSelectField"
              label="Select a value"
              floatingLabelText="Value"
              data={this.props.conjoinedToAutoComplete}
              tabIndex={this.props.tabIndex}
              onChange={(v,i)=>this.props.onChange(this.props.queryIndex,"values",i,[v])}
            />
          );
        } 
        else if (this.props.defaultAttributes[this.props.type] && this.props.defaultAttributes[this.props.type][this.props.attributeIndex]['name']==="type"){
          let dataSource = this.props.noteTypes.map((noteType) => {
            return {text: noteType, value: noteType}
          })
          input = 
            (
              <SelectField
                id="noteTypeSelectField"
                label="Select a value"
                floatingLabelText="Value"
                data={dataSource}
                tabIndex={this.props.tabIndex}
                onChange={(v,i)=>this.props.onChange(this.props.queryIndex,"values",i,[v])}
              />
            );
        } 
        else {
          input = 
            <TextField 
              hintText="Value" 
              style={{paddingTop: 24, width: '100%'}}
              onChange={(e,v)=>this.props.onChange(this.props.queryIndex,"values",e,0,[v])}
              tabIndex={this.props.tabIndex}
              {...floatFieldLight}
            />;
        }
      } catch (e) {}
    }
    return input;
  }

  renderRow = () => {
    let row =
      <div className="filterRow">
        <div className="filterField">
          <SelectField
            id={"filterRowType"+this.props.queryIndex}
            floatingLabelText="Type"
            value={this.props.type}
            onChange={(v,i)=>{let queryIndex = this.props.queryIndex; this.props.onChange(queryIndex,"type",i,v);}}
            disabled={this.props.disableNewRow}
            tabIndex={this.props.tabIndex}
            {...floatFieldLight}
            data={[{value:"leaf",text:"Leaf"},{value:"group",text:"Group"},{value:"side",text:"Side"},{value:"note",text:"Note"}]}
          />
        </div>
        <div className="filterField">
          <SelectField
            id={"filterRowAttribute"+this.props.queryIndex}
            floatingLabelText="Attribute"
            value={this.props.attribute}
            onChange={(v,i)=>{let queryIndex = this.props.queryIndex; this.props.clearFilterRowOnAttribute(queryIndex, v, i); this.props.onChange(this.props.queryIndex,"attribute",i,v)}}
            errorText={(this.props.type!=="" && this.props.type!==null && this.props.attribute==="")?"Required":""}
            disabled={this.props.disableNewRow||!this.props.type}
            tabIndex={this.props.tabIndex}
            data={this.renderAttributeMenuItems()}
            {...floatFieldLight}
          >
          </SelectField>
        </div>
        <div className="filterField">
          <SelectField
            id={"filterRowCondition"+this.props.queryIndex}
            floatingLabelText="Condition"
            value={this.props.condition}
            onChange={(v,i)=>this.props.onChange(this.props.queryIndex,"condition",i,v)}
            errorText={(this.props.type!=="" && this.props.type!==null && this.props.condition==="")?"Required":""}
            disabled={this.props.disableNewRow}
            tabIndex={this.props.tabIndex}
            data={['equals', 'contains', 'not equals', 'not contains'].filter((item)=>this.filterConditionItems(item)).map(this.mapConditionItems)}
            {...floatFieldLight}
          >
          </SelectField>
        </div>
        <div className="filterField">
          {this.renderValueField()}
        </div>
        <div className="filterField">
          <SelectField
            id={"filterRowConjunction"+this.props.queryIndex}
            floatingLabelText="Conjunction"
            value={this.props.conjunction}
            onChange={(v,i)=>this.props.onChange(this.props.queryIndex,"conjunction",i,v)}
            disabled={this.props.lastRow}
            errorText={(!this.props.lastRow && this.props.conjunction==="")?"Required":""}
            tabIndex={this.props.tabIndex}
            data={[{value:"AND", text:"AND"},{value:"OR", text:"OR"}]}
            {...floatFieldLight}
          >
          </SelectField>
        </div>
        <div className="filterField" style={{paddingTop: 20, flexGrow:1}}>
              <IconButton 
                aria-label="Remove filter query row"
                onClick={()=>this.props.removeRow(this.props.queryIndex)}
                style={(this.props.queryIndex===0 && this.props.queriesLength===1)? {display:"none"}: {}}
              >
                <IconClear/>
              </IconButton>
              <FloatingActionButton 
                aria-label="Add new filter query row"
                mini
                onClick={()=>this.props.addRow()}
                style={(this.props.queryIndex===this.props.queriesLength-1)? {marginLeft:10} : {opacity:0,pointerEvents:'none',marginLeft:10}}
                secondary
                disabled={this.props.disableAddRow}
                tabIndex={this.props.tabIndex}
              >
                <ContentAdd/>
              </FloatingActionButton>
          </div>
      </div>
    return row;
  }

  render() {
      return this.renderRow();
  }

}
export default FilterRow;
