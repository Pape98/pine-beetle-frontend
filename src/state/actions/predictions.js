import { predictions } from '../../services';

export const ActionTypes = {
  SET_COUNTY_PREDICTIONS: 'SET_COUNTY_PREDICTIONS',
  SET_RANGER_DISTRICT_PREDICTIONS: 'SET_RANGER_DISTRICT_PREDICTIONS',

  FETCHING_COUNTY_PREDICTIONS: 'FETCHING_COUNTY_PREDICTIONS',
  FETCHING_RANGER_DISTRICT_PREDICTIONS: 'FETCHING_RANGER_DISTRICT_PREDICTIONS',

  SET_PREDICTIONS_ERROR: 'SET_PREDICTIONS_ERROR',
  CLEAR_PREDICTIONS_ERROR: 'CLEAR_PREDICTIONS_ERROR',
};

/**
 * @description action creator for setting county prediction data
 */
export const getCountyPredictions = (filters = {}) => {
  return async (dispatch) => {
    dispatch({ type: ActionTypes.FETCHING_COUNTY_PREDICTIONS, payload: true });

    try {
      const response = await predictions.getAllCountyData(filters);
      dispatch({ type: ActionTypes.SET_COUNTY_PREDICTIONS, payload: response });
    } catch (error) {
      dispatch({
        type: ActionTypes.SET_PREDICTIONS_ERROR,
        payload: {
          error,
          text: 'Failed to fetch county predictions',
        },
      });
    } finally {
      dispatch({ type: ActionTypes.FETCHING_COUNTY_PREDICTIONS, payload: false });
    }
  };
};

/**
 * @description action creator for setting ranger district prediction data
 */
export const getRangerDistrictPredictions = (filters = {}) => {
  return async (dispatch) => {
    dispatch({ type: ActionTypes.FETCHING_RANGER_DISTRICT_PREDICTIONS, payload: true });

    try {
      const response = await predictions.getAllRDData(filters);
      dispatch({ type: ActionTypes.SET_RANGER_DISTRICT_PREDICTIONS, payload: response });
    } catch (error) {
      dispatch({
        type: ActionTypes.SET_PREDICTIONS_ERROR,
        payload: {
          error,
          text: 'Failed to fetch ranger district predictions',
        },
      });
    } finally {
      dispatch({ type: ActionTypes.FETCHING_RANGER_DISTRICT_PREDICTIONS, payload: false });
    }
  };
};
