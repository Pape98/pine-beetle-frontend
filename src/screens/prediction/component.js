import React, { Fragment } from 'react';

import { OverviewText, StateMap, PredictionMap } from './components';

import './style.scss';

const Prediction = (props) => {
  const {
    isLoading,
    predictionsErrorText,
    selectedState,
  } = props;

  return (
    <div>
      {/* TODO: make this a spinner */}
      {isLoading && <p>Loading...</p>}
      {predictionsErrorText.length > 0 && predictionsErrorText.map(t => <p>{t}</p>)}
      <OverviewText />
      {!selectedState ? (
        <Fragment>
          <div className="container" id="pred-select-state-text">
            <h3>Please select a state to run the predictive model.</h3>
            <p>It will take a few seconds to run. Please be patient.</p>
          </div>
          <StateMap />
        </Fragment>
      ) : (
      // render either loading icon here if fetching predictions or the prediction output
        <PredictionMap />
      )}
    </div>
  );
};

export default Prediction;
