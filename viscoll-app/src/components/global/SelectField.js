import React from 'react';
import AutoComplete from 'material-ui/AutoComplete';
import {floatFieldLight} from '../../styles/textfield';

/** Custom select field */
export default class SelectField extends React.Component {

  constructor(props) {
    super(props);
    let searchText = "";
    if (props.value!==undefined) {
      const targetData = props.data.find((data)=>data.value===props.value);
      if (targetData) searchText = targetData.text;
    }
    this.state = {
      searchText: searchText.toString(),
      prevSearchText: searchText.toString(),
      filteredDropDown: [],
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.value && nextProps.value!==this.props.value) {
      const targetData = nextProps.data.find((data)=>data.value===nextProps.value);
      if (targetData) this.setState({searchText: targetData.text, prevSearchText: targetData.text});
    } else if (nextProps.value==="") {
      this.setState({searchText:"", prevSearchText:""});
    }
  }

  onMenuClose = () => {
    const targetIndex = this.props.data.findIndex((data)=>data.text===this.state.searchText);
    if (targetIndex>=0) {
      const target = this.props.data[targetIndex];
      if (this.state.searchText!==this.state.prevSearchText) {
        const searchTextExists = target !==undefined;
        if (searchTextExists) {
          // User entered a valid value 
          this.setState({prevSearchText: this.state.searchText});
          // Return selected value to caller component
          this.props.onChange(target.value, targetIndex);
        } else {
          // Reset text field to have the previous valid search text
          this.setState({searchText: this.state.prevSearchText});
        }
      }
    }
    
    // Unfocus the input field
    document.querySelector("#"+this.props.id).blur();
  }

  filter = (searchText, key) => {
    if (searchText===this.state.prevSearchText || searchText.length===0) { 
      return AutoComplete.noFilter(searchText, key);
    } else {
      return AutoComplete.caseInsensitiveFilter(searchText, key);
    }
  }

  render() {
    let style=this.props.style? this.props.style : {};
    if (this.props.width) style["width"] = this.props.width.width;
    return <AutoComplete
      id={this.props.id}
      aria-label={this.props.label}
      floatingLabelText={this.props.floatingLabelText}
      hintText={this.props.hintText}
      openOnFocus
      filter={this.filter}
      dataSource={this.props.data}
      dataSourceConfig={{text:'text',value:'value'}}
      searchText={this.state.searchText}
      onUpdateInput={(v,d,p)=>{this.setState({searchText:v})}}
      onClose={this.onMenuClose}
      fullWidth
      style={style}
      textFieldStyle={{fontSize:window.innerWidth<=1024?"12px":null}}
      disabled={this.props.disabled}
      errorText={this.props.errorText}
      {...floatFieldLight}
      menuProps={{maxHeight:this.props.maxHeight?this.props.maxHeight:300}}
    />
  }

}