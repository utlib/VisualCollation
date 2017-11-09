import React from 'react';
import PropTypes from 'prop-types';
import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
} from 'material-ui/Table';

/**
 * List the projects in a table format
 */
const ListView = ({singleClickIndex, selectProject, allProjects=[], doubleClick}) => {

  const projectsList = allProjects.map((project, i) => {
    var selected = singleClickIndex === i;
    return (    
      <TableRow 
        key={project.id} 
        onDoubleClick={()=>doubleClick(project.id)} 
        selected={selected} 
        style={{background:"rgba(255,255,255,0.2)", cursor:"pointer"}}
      >
        <TableRowColumn>{project.title}</TableRowColumn>
        <TableRowColumn>{new Date(project.updated_at).toLocaleString('en-US')}</TableRowColumn>
      </TableRow>
    );
  });
  return (
    <Table  
      style={{background:"#f2f2f2"}} 
      bodyStyle={{background:"#fff"}} 
      onRowSelection={(index)=>{selectProject(index[0])}}
    >
      <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
        <TableRow>
          <TableHeaderColumn>Name</TableHeaderColumn>
          <TableHeaderColumn>Date Modified</TableHeaderColumn>
        </TableRow>
      </TableHeader>
      <TableBody deselectOnClickaway={false} displayRowCheckbox={false}>
        {projectsList}
      </TableBody>
    </Table>
  );
};
ListView.propTypes = {
    /** Index of project that was selected through singleclick by user */
    singleClickIndex: PropTypes.number,
    /** Callback used when user selects a project */
    selectProject: PropTypes.func,
    /** Array of projects belonging to the user */
    allProjects: PropTypes.array,
    /** Callback for doubleclicking on a project  */
    doubleClick: PropTypes.func,
  }
export default ListView;
