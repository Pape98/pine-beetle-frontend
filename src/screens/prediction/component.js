/* eslint-disable no-unused-vars */
import React from 'react';

import {
  BarChart,
  OverviewText,
  PredictionDetails,
  PredictionMap,
  SelectionBar,
} from './components';

import './style.scss';

const histogrambin1 = require('../../assets/images/spb-histogram-bin1.jpg');
const histogrambin2 = require('../../assets/images/spb-histogram-bin2.jpg');
const histogrambin3 = require('../../assets/images/spb-histogram-bin3.jpg');
const histogrambin4 = require('../../assets/images/spb-histogram-bin4.jpg');
const histogrambin5 = require('../../assets/images/spb-histogram-bin5.jpg');
const histogrambin6 = require('../../assets/images/spb-histogram-bin6.jpg');

const Prediction = (props) => {
  const {
    isLoading,
    predictionData,
    predictionsErrorText,
    selectedState,
  } = props;

  const getHistogram = (predProb50) => {
    if (predProb50 < 0.025) {
      return histogrambin1;
    } else if (predProb50 < 0.05) {
      return histogrambin2;
    } else if (predProb50 < 0.15) {
      return histogrambin3;
    } else if (predProb50 < 0.25) {
      return histogrambin4;
    } else if (predProb50 < 0.4) {
      return histogrambin5;
    } else {
      return histogrambin6;
    }
  };

  const createHistogramJSX = (bool) => {
    if (bool) {
      const predProb50 = predictionData[0].prediction['prob.Spots>53'];
      const histogram = getHistogram(predProb50);
      return (
        <img
          src={histogram}
          alt="Histogram for Predicted % Chance of >50 Spots"
          style={{ width: '800px' }}
          className="container"
        />
      );
    } else { return null; }
  };

  const predDetails = (bool) => {
    if (bool) {
      return (
        <div>
          <div className="container" id="pred-header">Prediction Details</div>
          <div className="container" id="predictions">
            <div className="bar-chart">
              <BarChart data={predictionData} />
            </div>
            <div className="prediction-details">
              <PredictionDetails data={predictionData} />
            </div>
          </div>
        </div>
      );
    } else { return null; }
  };

  return (
    <div>
      {/* TODO: make this a spinner */}
      {isLoading && <p>Loading...</p>}
      {predictionsErrorText.length > 0 && predictionsErrorText.map(t => <p>{t}</p>)}
      <OverviewText />
      <SelectionBar />
      <PredictionMap data={selectedState} />
      {/* TODO: Dynamically Change header */}
      { predDetails(predictionData.length === 1) }
      { createHistogramJSX(predictionData.length === 1) }
    </div>
  );
};

export default Prediction;
