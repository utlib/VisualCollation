import React from 'react';
import PropTypes from 'prop-types';

/**
 * List the projects in a table format
 */
const ListView = ({selectedProjectIndex, selectProject, allProjects=[], doubleClick, tabIndex}) => {
  const selectedProjectID = selectedProjectIndex>=0? allProjects[selectedProjectIndex].id : null;
  const viewDate = {year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'}
  const ariaDate = {year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'}
  const projectsList = allProjects.map((project, i) => {
    return (    
      <button 
        key={project.id}
        onClick={()=>selectProject(i)}
        onDoubleClick={()=>doubleClick(project.id)} 
        className={selectedProjectID===project.id? "selected":""}
        tabIndex={tabIndex}
      >
        <div aria-label={"Project: " + project.title}>{project.title}</div>
        <div aria-label={"Last modified: " + new Date(project.updated_at).toLocaleString('en-US', ariaDate)} >{new Date(project.updated_at).toLocaleString('en-US',viewDate)}</div>
      </button>
    );
  });
  return (
    <div id="listView" aria-label="List of your projects"
      style={{background:"#f2f2f2"}} 
    >
      <div className="header" role="presentation">
        <div style={{color: "#606060"}}>Name</div>
        <div style={{color: "#606060"}}>Date Modified</div>
      </div>
      <div>
        {projectsList}
      </div>
    </div>
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
