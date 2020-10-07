import React from 'react';
import Chip from 'material-ui/Chip';

export function renderTermChip(props, term) {
  let deleteFn = () => {
    props.action.unlinkTerm(term.id);
  };
  if (props.isReadOnly) deleteFn = null;
  return (
    <Chip
      key={term.id}
      style={{ marginRight: 4, marginBottom: 4 }}
      onRequestDelete={deleteFn}
      onClick={() => props.openTermDialog(term)}
      tabIndex={props.tabIndex}
      labelStyle={{ fontSize: props.windowWidth <= 1024 ? 12 : null }}
    >
      {term.title}
    </Chip>
  );
}
