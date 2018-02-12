import { cloneDeep } from 'lodash';

import {
  updateImagesAfterUpload,
} from '../../actions/frontend/after/imageActions';

const frontendAfterActionsMiddleware = store => next => action => {
  switch (action.type) {
    // Image Actions
    case "UPLOAD_IMAGES_SUCCESS_BACKEND":
      action.payload.response = updateImagesAfterUpload(action, cloneDeep(store.getState().dashboard), cloneDeep(store.getState().active))
      break;
    default:
      break;
  }
  next(action);
}


export default frontendAfterActionsMiddleware;