import React, { Component } from 'react';
import '../../styles/predictive-model-page/PredictionsVersusOutcome.css';
import { CircularProgressbarWithChildren, buildStyles} from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

export default class PredictionVsOutcome extends Component {
    constructor(props) {
        super(props);

        this.state = {
            confidence: 'high',
            outbreakChance: 100.0,
            outbreakOccurred: false,
        }

        this.calculateConfidence();
        this.getAssessment();
    }

    /**
     * This method will calculate the confidence of a given prediction
     * by finding the percentage error between the predicted and grouth
     * truth number of recorded spot.
     * @calculateConfidence
     */

    calculateConfidence() {
        this.props.prediction().then((res) => {
            const outputs = res.outputs;

            let previousKey = "0";

            console.log(outputs)

            for (const key in outputs) {
                var probability = outputs[key];

                // once the probability becomes less than 50%, each subsequent reading becomes less probable
                if(probability <= 0.5) {
                    // use regex to extract out the integer from key e.g. prob50spots -> '50'
                    const prevProbability = parseInt(previousKey.match("([0-9]+)")[0]);
                    const currentProbability = parseFloat(key.match("([0-9]+)")[0]);
                    const predictedValue = (currentProbability + prevProbability) / 2;
                    const actualValue = Math.max(parseFloat(outputs["expSpotsIfOutbreak"]), 1);

                    // error is calculated as the percentage error of the predicted and known value
                    const error = Math.abs(actualValue - predictedValue) / actualValue;

                    /*console.log(prevProbability);
                    console.log(currentProbability);
                    console.log("Value between " + previousKey + " and " + key);
                    console.log("Predicted Value: " + predictedValue);
                    console.log("Percentage Error: " + error)*/

                    let confidenceLevel = 'low'

                    if(error <= 0.5) {
                        confidenceLevel = 'high';
                    }

                    this.setState({
                        confidence: confidenceLevel,
                        percentageError: error,
                    });

                    break;
                
                
                }

                previousKey = key;
            }
        })
        .catch((err) => console.log(err));
    }

    getAssessment() {
        this.props.assessment().then((res) => {
            if(res) {
                console.log("outbreak")
                console.log(res.outbreakOcurred);
                var occurred = "N/A";
                if (res.outbreakOcurred!=null){occurred = res.outbreakOcurred ? "Yes": "No"}

                this.setState({
                    outbreakOccurred: occurred,
                    outbreakChance: (res.outbreakPredicted == null) ? "N/A" : (res.outbreakPredicted * 100).toFixed(2),
                });
            } else {
                console.log('res failed')
            }
        });
    }

    render() {
        return (
            <center>
                <div className="container" style={{ textAlign: 'left' }}>
                    <h1 style={{ marginBottom: 20 }}>How well did we do?</h1>
                    <div className="classification_information">
                        <div className="classification_prediction">
                            <CircularProgressbarWithChildren value={this.state.outbreakChance} styles={buildStyles({pathColor: "#9FBC96", trailColor: "#F1F1F1"})}>
                                <h1 style={{ fontSize: '4em', marginBottom: 10 }}>{this.state.outbreakChance}%</h1>
                                <div style={{ fontSize: 12, marginTop: -5 }}>
                                    <strong>Chances of an outbreak<span id="asterisk">*</span></strong>
                                </div>
                            </CircularProgressbarWithChildren>
                        </div>
                        <div className="classification_actual">
                            <CircularProgressbarWithChildren value={100} styles={buildStyles({pathColor: "#EDC475", trailColor: "#F1F1F1"})}>
                                <h1 style={{ fontSize: '4em', marginBottom: 10 }}>{this.state.outbreakOccurred}</h1>
                                <div style={{ fontSize: 12, marginTop: -5 }}>
                                    <strong>Was there an outbreak?</strong>
                                </div>
                            </CircularProgressbarWithChildren>
                        </div>
                   </div>
                   <p className="outbreak_disclaimer"><span id="asterisk">*</span> Outbreak defined as >50 spots in a particular year.</p>
                </div>
            </center>
        );
    }
}
