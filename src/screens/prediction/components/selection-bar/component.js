/* eslint-disable react/button-has-type */
import React from 'react';

import { TextInput, ChoiceInput } from '../../../../components/input-components';

import { DATA_MODES } from '../../../../constants';

import {
  getStateNameFromAbbreviation,
  getStateAbbreviationFromStateName,
} from './utils';

import './style.scss';

const SelectionBar = (props) => {
  const {
    clearAllSelections,
    county,
    dataMode,
    predictionsData,
    rangerDistrict,
    selectedState,
    setCounty,
    setDataMode,
    setRangerDistrict,
    setState,
    setYear,
    year,
  } = props;

  const allStates = [...new Set(predictionsData.map(obj => obj.state))].sort();
  const allCounties = selectedState ? [...new Set(predictionsData.map((obj => obj.county)))].sort() : [];
  const allRangerDistricts = selectedState ? [...new Set(predictionsData.map((obj => obj.rangerDistrict)))].sort() : [];

  const statesMappedToNames = allStates.map(abbrev => getStateNameFromAbbreviation(abbrev));
  const selectedStateName = getStateNameFromAbbreviation(selectedState);
  const setStateAbbrev = stateName => setState(getStateAbbreviationFromStateName(stateName));

  const countyMode = dataMode === DATA_MODES.COUNTY;

  const boldenSelection = (mode) => {
    if ((mode === DATA_MODES.COUNTY && countyMode) || (mode === DATA_MODES.RANGER_DISTRICT && !countyMode)) {
      return ({ color: '#2d2d2d' });
    }
    return null;
  };

  return (
    <div id="predictionbar" className="container">
      <TextInput instructions="Year" setValue={setYear} value={year} />
      <div id="vl1" />
      <ChoiceInput instructions="State" value={selectedStateName} setValue={setStateAbbrev} options={statesMappedToNames} firstOptionText="State" />
      <div id="vl1" />
      <div className="menuInstruction">
        <div id="mode-selection">
          <button
            id="mode-btn"
            onClick={() => setDataMode(DATA_MODES.COUNTY)}
            style={boldenSelection(DATA_MODES.COUNTY)}
          >
            County
          </button>
          <div id="vl2" />
          <button
            id="mode-btn"
            onClick={() => setDataMode(DATA_MODES.RANGER_DISTRICT)}
            style={boldenSelection(DATA_MODES.RANGER_DISTRICT)}
          >
            Ranger District
          </button>
        </div>
        <div style={{ width: '50px' }}>
          <ChoiceInput
            // instructions={countyMode ? 'County' : 'RD'}
            value={countyMode ? county : rangerDistrict}
            setValue={countyMode ? setCounty : setRangerDistrict}
            options={countyMode ? allCounties : allRangerDistricts}
            firstOptionText={countyMode ? 'County' : 'Ranger District'}
          />
        </div>
      </div>
      <button id="reset-current-data-button" className="submit static-button clear-button" onClick={clearAllSelections}>Clear Filters</button>
    </div>
  );
};

export default SelectionBar;
