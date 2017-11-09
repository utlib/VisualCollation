import {
  loadProject,
  createProject,
  updateProject,
  deleteProject,
  loadProjects
} from '../../src/actions/projectActions';


describe('>>>A C T I O N --- Test projectActions', () => {

  // it('+++ actionCreator loadProject', () => {
  //   const projectID = "123456";
  //   const loadProjectAction = loadProject(projectID);
  //   expect(loadProjectAction).toEqual({
  //     types: ['SHOW_LOADING','LOAD_PROJECT_SUCCESS','LOAD_PROJECT_FAILED'],
  //     payload: {
  //       request : {
  //         url: `/projects/${projectID}`,
  //         method: 'get',
  //         successMessage: "" ,
  //         errorMessage: "Ooops! Something went wrong",
  //       },
  //     }
  //   })
  // });

  it('+++ actionCreator createProject', () => {
    const project = "new project object";
    const createProjectAction = createProject(project);
    expect(createProjectAction).toEqual({
      types: ['SHOW_LOADING','CREATE_PROJECT_SUCCESS','CREATE_PROJECT_FAILED'],
      payload: {
        request : {
          url: `/projects`,
          method: 'post',
          data: project,
          successMessage: "Successfully created the project" ,
          errorMessage: "Ooops! Something went wrong"
        }
      }
    })
  });

  it('+++ actionCreator updateProject', () => {
    const project = "new project object";
    const projectID = "123456";
    const updateProjectAction = updateProject(projectID, project);
    expect(updateProjectAction).toEqual({
      types: ['NO_LOADING','UPDATE_PROJECT_SUCCESS','UPDATE_PROJECT_FAILED'],
      payload: {
        request : {
          url: `/projects/${projectID}`,
          method: 'put',
          data: {project},
          successMessage: "Successfully updated the project" ,
          errorMessage: "Ooops! Something went wrong"
        }
      }
    })
  });

  it('+++ actionCreator deleteProject', () => {
    const projectID = "123456";
    const deleteProjectAction = deleteProject(projectID);
    expect(deleteProjectAction).toEqual({
      types: ['SHOW_LOADING','DELETE_PROJECT_SUCCESS','DELETE_PROJECT_FAILED'],
      payload: {
        request : {
          url: `/projects/${projectID}`,
          method: 'delete',
          successMessage: "Successfully deleted the project" ,
          errorMessage: "Ooops! Something went wrong"
        }
      }
    })
  });

  it('+++ actionCreator loadProjects', () => {
    const loadProjectsAction = loadProjects();
    expect(loadProjectsAction).toEqual({
      types: ['NO_LOADING','LOAD_PROJECTS_SUCCESS','LOAD_PROJECTS_FAILED'],
      payload: {
        request : {
          url: `/projects`,
          method: 'get',
          successMessage: "" ,
          errorMessage: "Ooops! Something went wrong"
        }
      }
    })
  });

});
