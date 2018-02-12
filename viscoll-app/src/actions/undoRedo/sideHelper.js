import {
  updateSide,
  updateSides,
} from '../backend/sideActions';

export function undoUpdateSide(action, state) {
  const sideID = action.payload.request.url.split("/").pop();
  const attribute = Object.keys(action.payload.request.data.side)[0];
  const sideType = sideID.split("_")[0] + "s";
  const side = {
    [attribute]: state.project[sideType][sideID][attribute],
  };
  const historyAction = updateSide(sideID, side);
  return [historyAction];
}

export function undoUpdateSides(action, state) {
  const requests = action.payload.request.data.sides;
  const sides = [];

  for (const request of requests) {
    const sideType = request.id.split("_")[0] + "s";
    const side = state.project[sideType][request.id];
    const item = {
      id: request.id,
      attributes: {},
    }
    for (const attribute in request.attributes) {
      if (!request.attributes.hasOwnProperty(attribute)) continue;
      item.attributes[attribute] = side[attribute];
    }
    sides.push(item);
  }
  const historyActions = updateSides(sides);
  return [historyActions];
}