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
    endYear,
    rangerDistrict,
    selectedState,
    setCounty,
    setDataMode,
    setEndYear,
    setRangerDistrict,
    setStartYear,
    setState,
    startYear,
    trappingData,
  } = props;

  const countyMode = dataMode === DATA_MODES.COUNTY;

  const allStates = [...new Set(trappingData.map(obj => obj.state))].sort();
  const allCounties = selectedState ? [...new Set(trappingData.map((obj => obj.county)))].sort() : [];
  const allRangerDistricts = selectedState ? [...new Set(trappingData.map((obj => obj.rangerDistrict)))].sort() : [];

  const statesMappedToNames = allStates.map(abbrev => getStateNameFromAbbreviation(abbrev));
  const selectedStateName = getStateNameFromAbbreviation(selectedState);
  const setStateAbbrev = stateName => setState(getStateAbbreviationFromStateName(stateName));

  return (
    <div id="predictionbar" className="container" style={{ display: 'flex' }}>
      <div id="start-year-selection"><TextInput instructions="Year" setValue={setStartYear} value={startYear} /></div>
      <div id="vl3" />
      {/* TODO: "to" */}
      <div id="end-year-selection"><TextInput setValue={setEndYear} value={endYear} /></div>
      <div id="vl1" />
      <ChoiceInput instructions="Select State" value={selectedStateName} setValue={setStateAbbrev} options={statesMappedToNames} firstOptionText="State" />
      <div id="vl1" />
      <div className="menuInstruction">
        <div id="mode-selection">
          <button
            id="mode-btn"
            onClick={() => { setDataMode(DATA_MODES.COUNTY); }}
            className={(countyMode) ? 'county-rd-selection' : null}
          >
            County
          </button>
          <div id="vl2" />
          <button
            id="mode-btn"
            onClick={() => { setDataMode(DATA_MODES.RANGER_DISTRICT); }}
            className={(!countyMode) ? 'county-rd-selection' : null}
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
      {/* <ChoiceInput
        instructions={countyMode ? 'Select County' : 'Select Ranger District'}
        value={countyMode ? county : rangerDistrict}
        setValue={countyMode ? setCounty : setRangerDistrict}
        options={countyMode ? allCounties : allRangerDistricts}
        firstOptionText={countyMode ? 'County' : 'Ranger District'}
      /> */}

      {/* <ChoiceInput instructions="Select State" submitFunction={updateState} availableOptions={availableStates} idName="state" value={this.state.stateName} firstOptionText="State" /> */}
      {/* <OptgroupChoiceInput
        instructions="Select County / Parish"
        submitFunction={this.props.dataController.updateForestSelection}
        availableOptions={sortedAvailableForests}
        idName="forest"
        value={this.state.forest}
        ref={this.forestInput}
        showAboveText
        firstOptionText="County / Parish"
      /> */}
      <button id="reset-current-data-button" className="submit static-button clear-button" onClick={clearAllSelections}>Clear Filters</button>
    </div>
  );
};

export default SelectionBar;
