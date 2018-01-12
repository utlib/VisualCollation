import React from 'react';

/**
 * List the projects in a table format
 */
const ListView = ({selectedProjectID, selectProject, allProjects=[], doubleClick, tabIndex}) => {
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
export default ListView;
