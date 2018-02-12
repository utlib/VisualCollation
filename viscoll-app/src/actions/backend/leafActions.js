
export function addLeafs(leaf, additional) {
    return {
        types: ['CREATE_LEAVES_FRONTEND','CREATE_LEAVES_SUCCESS_BACKEND','CREATE_LEAVES_FAILED_BACKEND'],
        payload: {
            request : {
                url: `/leafs`,
                method: 'post',
                data: { leaf, additional },
                successMessage: "Successfully added the leaf(s)" ,
                errorMessage: "Ooops! Something went wrong"
            }
        },
        isUndoable: true,
    };
}

export function updateLeaf(leafID, leaf) {
    return {
        types: ['UPDATE_LEAF_FRONTEND','UPDATE_LEAF_SUCCESS_BACKEND','UPDATE_LEAF_FAILED_BACKEND'],
        payload: {
            request : {
                url: `/leafs/${leafID}`,
                method: 'put',
                data: {leaf},
                successMessage: "Successfully updated the leaf" ,
                errorMessage: "Ooops! Something went wrong"
            }
        },
        isUndoable: true,
    };
}

export function updateLeafs(leafs, project_id) {
    return {
        types: ['UPDATE_LEAVES_FRONTEND','UPDATE_LEAVES_SUCCESS_BACKEND','UPDATE_LEAVES_FAILED_BACKEND'],
        payload: {
            request : {
                url: `/leafs`,
                method: 'put',
                data: {leafs, project_id},
                successMessage: "Successfully updated the leafs" ,
                errorMessage: "Ooops! Something went wrong"
            }
        },
        isUndoable: true,
    };
}


/**
 leafs: [
 "59ea025c3b0eb7168e9591de",
 "59ea025c3b0eb7168e9591de",
 "59ea025c3b0eb7168e9591de",
 "59ea025c3b0eb7168e9591de"
 ]
 */
export function autoConjoinLeafs(leafs) {
    return {
        types: ['AUTOCONJOIN_LEAFS_FRONTEND','AUTOCONJOIN_LEAFS_SUCCESS_BACKEND','AUTOCONJOIN_LEAFS_FAILED_BACKEND'],
        payload: {
            request : {
                url: `/leafs/conjoin`,
                method: 'put',
                data: {leafs},
                successMessage: "Successfully conjoined the leafs" ,
                errorMessage: "Ooops! Something went wrong"
            }
        },
        isUndoable: true,
    };
}



export function deleteLeaf(leafID) {
    return {
        types: ['DELETE_LEAF_FRONTEND','DELETE_LEAF_SUCCESS_BACKEND','DELETE_LEAF_FAILED_BACKEND'],
        payload: {
            request : {
                url: `/leafs/${leafID}`,
                method: 'delete',
                successMessage: "Successfully deleted the leaf" ,
                errorMessage: "Ooops! Something went wrong"
            }
        },
        isUndoable: true,
    };
}

export function deleteLeafs(leafs) {
    return {
        types: ['DELETE_LEAVES_FRONTEND','DELETE_LEAFS_SUCCESS_BACKEND','DELETE_LEAFS_FAILED_BACKEND'],
        payload: {
            request : {
                url: `/leafs`,
                method: 'delete',
                data: leafs,
                successMessage: "Successfully deleted the leafs" ,
                errorMessage: "Ooops! Something went wrong"
            }
        },
        isUndoable: true,
    };
}

export function generateFolioNumbers(startNumber, rectoIDs, versoIDs) {
    return {
        types: ['GENERATE_FOLIO_NUMBERS_FRONTEND','GENERATE_FOLIO_NUMBERS_SUCCESS_BACKEND','GENERATE_FOLIO_NUMBERS_FAILED_BACKEND'],
        payload: {
            request : {
                url: `/leafs/generateFolio`,
                method: 'put',
                data: {startNumber, rectoIDs, versoIDs},
                successMessage: "Successfully generated the folio numbers" ,
                errorMessage: "Ooops! Something went wrong"
            }
        },
        isUndoable: true,
    };
}