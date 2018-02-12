import React from 'react';
import SuperSelectField from 'material-ui-superselectfield';

const selectionsRenderer = (values) => {
  if (values.length===1) return "1 item selected"
  if (values.length>1) return `${values.length} items selected`
  return "Select item(s)..."
}

const MultiSelectAutoComplete = (props) => {
  return (
    <SuperSelectField
      multiple={true}
      selectionsRenderer={selectionsRenderer}
      value={props.selectedItems}
      onChange={props.updateSelectedItems}
      checkPosition='left'
      showAutocompleteThreshold={0}
      hintTextAutocomplete={"Search items"}
      style={{width: 250}}
    >
      {props.children}
    </SuperSelectField>
  );
}

export default MultiSelectAutoComplete;
