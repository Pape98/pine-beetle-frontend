import { connect } from 'react-redux';

import SelectionBar from './component';

import {
  clearSelections,
  setCounty,
  setRangerDistrict,
  setState,
  setYearRange,
} from '../../../../state/actions';

const mapStateToProps = (state) => {
  const {
    selections: {
      yearRange: {
        startYear,
        endYear,
      },
      state: selectedState,
      county,
      rangerDistrict,
      allStates,
    },
    trappings: {
      data: trappingData,
    },
  } = state;

  return {
    allStates,
    county,
    endYear,
    rangerDistrict,
    selectedState,
    startYear,
    trappingData,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    clearAllSelections: () => {
      dispatch(clearSelections());
    },
    setStartYear: (startYear) => {
      dispatch(setYearRange(startYear, undefined));
    },
    setEndYear: (endYear) => {
      dispatch(setYearRange(undefined, endYear));
    },
    setCounty: (county) => {
      dispatch(setCounty(county));
    },
    setRangerDistrict: (rangerDistrict) => {
      dispatch(setRangerDistrict(rangerDistrict));
    },
    setState: (state) => {
      dispatch(setState(state));
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(SelectionBar);
