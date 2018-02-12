
export function addGroups(group, additional) {
    return {
        types: ['CREATE_GROUPS_FRONTEND','CREATE_GROUPS_SUCCESS_BACKEND','CREATE_GROUPS_FAILED_BACKEND'],
        payload: {
            request : {
                url: `/groups`,
                method: 'post',
                data: {group, additional},
                successMessage: "Successfully added the groups" ,
                errorMessage: "Ooops! Something went wrong"
            }
        },
        isUndoable: true,
    };
}

export function updateGroup(groupID, group) {
    return {
        types: ['UPDATE_GROUP_FRONTEND','UPDATE_GROUP_SUCCESS_BACKEND','UPDATE_GROUP_FAILED_BACKEND'],
        payload: {
            request : {
                url: `/groups/${groupID}`,
                method: 'put',
                data: {group},
                successMessage: "Successfully updated the group" ,
                errorMessage: "Ooops! Something went wrong"
            }
        },
        isUndoable: true,
    };
}

export function updateGroups(groups) {
    return {
        types: ['UPDATE_GROUPS_FRONTEND','UPDATE_GROUPS_SUCCESS_BACKEND','UPDATE_GROUPS_FAILED_BACKEND'],
        payload: {
            request : {
                url: `/groups`,
                method: 'put',
                data: {groups},
                successMessage: "Successfully updated the groups" ,
                errorMessage: "Ooops! Something went wrong"
            }
        },
        isUndoable: true,
    };
}

export function deleteGroup(groupID) {
    return {
        types: ['DELETE_GROUP_FRONTEND','DELETE_GROUP_SUCCESS_BACKEND','DELETE_GROUP_FAILED_BACKEND'],
        payload: {
            request : {
                url: `/groups/${groupID}`,
                method: 'delete',
                successMessage: "Successfully deleted the group" ,
                errorMessage: "Ooops! Something went wrong"
            }
        },
        isUndoable: true,
    };
}

export function deleteGroups(groups, projectID) {
    return {
        types: ['DELETE_GROUPS_FRONTEND','DELETE_GROUPS_SUCCESS_BACKEND','DELETE_GROUPS_FAILED_BACKEND'],
        payload: {
            request : {
                url: `/groups`,
                method: 'delete',
                data: {...groups, projectID},
                successMessage: "Successfully deleted the groups" ,
                errorMessage: "Ooops! Something went wrong"
            }
        },
        isUndoable: true,
    };
}