import {
  linkImages,
  unlinkImages,
} from '../backend/imageActions';

export function undoLinkImages(action) {
  const projectIDs = action.payload.request.data.projectIDs;
  const imageIDs = action.payload.request.data.imageIDs;
  const historyAction = unlinkImages(projectIDs, imageIDs);
  return [historyAction];
}

export function undoUnlinkImages(action) {
  const projectIDs = action.payload.request.data.projectIDs;
  const imageIDs = action.payload.request.data.imageIDs;
  const historyAction = linkImages(projectIDs, imageIDs);
  return [historyAction];
}