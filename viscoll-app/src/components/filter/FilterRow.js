import React, {Component} from 'react';
import {floatFieldLight} from '../../styles/textfield';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import TextField from 'material-ui/TextField';
import IconClear from 'material-ui/svg-icons/content/clear';
import ContentAdd from 'material-ui/svg-icons/content/add';
import IconButton from 'material-ui/IconButton';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import AutoComplete from 'material-ui/AutoComplete';

/** A row of filter query */
class FilterRow extends Component {

  renderAttributeMenuItems = () => {
    if (this.props.type) {
      return this.props.defaultAttributes[this.props.type].map(this.mapAttributeMenuItems);
    } else {
      return null;
    }
  }
  mapNoteAttributeMenuItems = (noteType, index) => {
    return <MenuItem key={noteType+index} value={noteType} primaryText={noteType} />
  }
  mapAttributeMenuItems = (item, index) => {
    return <MenuItem key={item.name+index} value={item.name} primaryText={item.displayName} />
  }
  renderValueItems = (item, index) => {
    return <MenuItem insetChildren key={item} value={item} primaryText={item} checked={this.props.values && this.props.values.indexOf(item) > -1} />;
  }

  mapConditionItems = (item) => {
    return <MenuItem key={item} value={item} primaryText={item} />
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
            input = 
            (<SelectField
              floatingLabelText="Value"
              value={this.props.values}
              onChange={(e,i,v)=>this.props.onChange(this.props.queryIndex,"values",e,i,v)}
              multiple
              errorText={(this.props.type!==null && this.props.values.length===0)?"Required":""}
              style={{width:'100%'}}
              tabIndex={this.props.tabIndex}
              {...floatFieldLight}
            >
              {this.props.defaultAttributes[this.props.type][this.props.attributeIndex]['options'].map(this.renderValueItems)}
            </SelectField>);
        } 
        else if (this.props.defaultAttributes[this.props.type] && this.props.defaultAttributes[this.props.type][this.props.attributeIndex]['name']==="conjoined_leaf_order"){
          const dataSourceConfig = {
            text: 'textKey',
            value: 'valueKey',
          };
          input = 
            (<AutoComplete
              floatingLabelText="Value"
              onUpdateInput={(v,s,p)=>this.props.onChange(this.props.queryIndex, "values", null, null, v, s)}
              filter={AutoComplete.caseInsensitiveFilter}
              dataSource={this.props.conjoinedToAutoComplete}
              dataSourceConfig={dataSourceConfig}
              listStyle={{ maxHeight: 300, overflow: 'auto' }}
              openOnFocus={true}
              style={{width:'100%'}}
              tabIndex={this.props.tabIndex}
            />);
        } 
        else if (this.props.defaultAttributes[this.props.type] && this.props.defaultAttributes[this.props.type][this.props.attributeIndex]['name']==="type"){
          const dataSourceConfig = {
            text: 'textKey',
            value: 'valueKey',
          };
          let dataSource = this.props.noteTypes.map((noteType) => {
            return {textKey: noteType, valueKey: noteType}
          })
          input = 
            (<AutoComplete
              floatingLabelText="Value"
              onUpdateInput={(v,s,p)=>this.props.onChange(this.props.queryIndex, "values", null, null, v, s)}
              filter={AutoComplete.caseInsensitiveFilter}
              dataSource={dataSource}
              dataSourceConfig={dataSourceConfig}
              listStyle={{ maxHeight: 300, overflow: 'auto' }}
              openOnFocus={true}
              style={{width:'100%'}}
              tabIndex={this.props.tabIndex}
            />);
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
            floatingLabelText="Type"
            value={this.props.type}
            onChange={(e,i,v)=>{let queryIndex = this.props.queryIndex; this.props.onChange(queryIndex,"type",e,i,v);}}
            style={{width:'100%'}}
            disabled={this.props.disableNewRow}
            tabIndex={this.props.tabIndex}
            {...floatFieldLight}
          >
            <MenuItem value={"leaf"} primaryText="Leaf" />
            <MenuItem value={"group"} primaryText="Group" />
            <MenuItem value={"side"} primaryText="Side" />
            <MenuItem value={"note"} primaryText="Note" />
          </SelectField>
        </div>

        <div className="filterField">
          <SelectField
            floatingLabelText="Attribute"
            value={this.props.attribute}
            onChange={(e,i,v)=>{let queryIndex = this.props.queryIndex; this.props.clearFilterRowOnAttribute(queryIndex, v, i); this.props.onChange(this.props.queryIndex,"attribute",e,i,v)}}
            style={{width:'100%'}}
            errorText={(this.props.type!==null && this.props.attribute==="")?"Required":""}
            autoWidth
            disabled={this.props.disableNewRow}
            tabIndex={this.props.tabIndex}
            {...floatFieldLight}
          >
            {this.renderAttributeMenuItems()}
          </SelectField>
        </div>

        <div className="filterField">
          <SelectField
            floatingLabelText="Condition"
            value={this.props.condition}
            onChange={(e,i,v)=>this.props.onChange(this.props.queryIndex,"condition",e,i,v)}
            style={{width:'100%'}}
            errorText={(this.props.type!==null && this.props.condition==="")?"Required":""}
            disabled={this.props.disableNewRow}
            tabIndex={this.props.tabIndex}
            {...floatFieldLight}
          >
            {['equals', 'contains', 'not equals', 'not contains'].filter((item)=>this.filterConditionItems(item)).map(this.mapConditionItems)}
          </SelectField>
        </div>

        <div className="filterField">
          {this.renderValueField()}
        </div>

        <div className="filterField">
          <SelectField
            floatingLabelText="Conjunction"
            value={this.props.conjunction}
            onChange={(e,i,v)=>this.props.onChange(this.props.queryIndex,"conjunction",e,i,v)}
            style={{width:'100%'}}
            disabled={this.props.lastRow}
            errorText={(!this.props.lastRow && this.props.conjunction==="")?"Required":""}
            tabIndex={this.props.tabIndex}
            {...floatFieldLight}
          >
            <MenuItem key={"and"} value={"AND"} primaryText={"AND"} />
            <MenuItem key={"or"} value={"OR"} primaryText={"OR"} />
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
