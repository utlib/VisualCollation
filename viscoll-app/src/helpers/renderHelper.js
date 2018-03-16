import React from 'react';
import Chip from 'material-ui/Chip';

export function renderNoteChip(props, note) {
  let deleteFn = () => {props.action.unlinkNote(note.id)};
  if (props.isReadOnly) deleteFn = null;
  return <Chip 
    key={note.id}
    style={{marginRight:4, marginBottom:4}}
    onRequestDelete={deleteFn}
    onClick={()=>props.openNoteDialog(note)}
    tabIndex={props.tabIndex}
    labelStyle={{fontSize:props.windowWidth<=1024?12:null}}
  >
    {note.title}
  </Chip>
}