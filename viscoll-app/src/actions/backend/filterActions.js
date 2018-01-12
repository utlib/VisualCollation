
export function filterProject(projectID, queries) {
    /**
     "queries": [
     {
       "type": "Leaf",
       "attribute": "material",
       "condition": "equals",
       "values": ["paper"],
       "conjunction": "AND"
     }
     ]
     */
    return {
        types: ['SHOW_LOADING','FILTER_PROJECT_SUCCESS','FILTER_PROJECT_FAILED'],
        payload: {
            request : {
                url: `/projects/${projectID}/filter`,
                method: 'put',
                data: queries,
                successMessage: "Successfully filtered the project" ,
                errorMessage: "Ooops! Something went wrong"
            }
        }
    };
}

export function reapplyFilterProject(projectID, filters) {
    const { queries, active } = filters;
    if (!active)
        return {type: "NO_FILTER_CHANGE"}
    let index = 0;
    let haveErrors = false;
    for (let query of queries) {
        if (query.type === null)
            haveErrors = true
        if (query.attribute === "")
            haveErrors = true
        if (query.values.length === 0)
            haveErrors = true
        if (query.condition === "")
            haveErrors = true
        if (index !== queries.length-1)
            if (query.conjunction === "")
                haveErrors = true
        index += 1;
    }
    if (!haveErrors){
        return {
            types: ['NO_LOADING','FILTER_PROJECT_SUCCESS','FILTER_PROJECT_FAILED'],
            payload: {
                request : {
                    url: `/projects/${projectID}/filter`,
                    method: 'put',
                    data: {queries},
                    successMessage: "" ,
                    errorMessage: "Ooops! Something went wrong"
                }
            }
        };
    }
    return { type: "NO_FILTER_CHANGE" }
}


export function resetFilters(queries) {
    return {
        type: 'RESET_FILTERS',
        payload: queries,
    };
}


export function toggleFilterDisplay() {
    return {
        type: 'TOGGLE_FILTER_DISPLAY'
    };
}


export function updateFilterQuery(newQueries) {
    return {
        type: 'UPDATE_FILTER_QUERY',
        payload: newQueries
    };
}


export function updateFilterSelection(selection, matchingFilterObjects, allObjects) {
    let type = selection.split("_")[0];
    const select = selection.split("_")[1];
    let selectedObjects = { type: type? type.slice(0,-1) : type, members: [], lastSelected: "" };
    if (select==="all"){
        selectedObjects.members = Object.keys(allObjects[type]);
    } else if (select==="matching"){
        selectedObjects.members = Object.keys(allObjects[type]).filter((id) => {
            if (type==="Rectos" || type==="Versos")
                return matchingFilterObjects.Sides.includes(id)
            else
                return matchingFilterObjects[type].includes(id)
        })
    }
    return {
        type: 'UPDATE_FILTER_SELECTION',
        payload: {
            selection,
            selectedObjects
        }
    };
}