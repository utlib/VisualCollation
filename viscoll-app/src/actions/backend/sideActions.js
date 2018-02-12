export function updateSide(sideID, side) {
    return {
        types: ['UPDATE_SIDE_FRONTEND','UPDATE_SIDE_SUCCESS_BACKEND','UPDATE_SIDE_FAILED_BACKEND'],
        payload: {
            request : {
                url: `/sides/${sideID}`,
                method: 'put',
                data: {side},
                successMessage: "Successfully updated the side" ,
                errorMessage: "Ooops! Something went wrong"
            }
        },
        isUndoable: true,
    };
}

export function updateSides(sides) {
    return {
        types: ['UPDATE_SIDES_FRONTEND','UPDATE_SIDES_SUCCESS_BACKEND','UPDATE_SIDES_FAILED_BACKEND'],
        payload: {
            request : {
                url: `/sides`,
                method: 'put',
                data: {sides},
                successMessage: "Successfully updated the sides" ,
                errorMessage: "Ooops! Something went wrong"
            }
        },
        isUndoable: true,
    };
}