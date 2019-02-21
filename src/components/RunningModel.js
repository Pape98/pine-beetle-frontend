import React, { Component } from 'react';
import '../styles/LoadingContainer.css';

class RunningModel extends Component {
    render() {
        return(
            <div id="loading-area">
                <div id="loading-gif-area">
                    <h2>Running Model...</h2>
                    <img src={require("../assets/load-icon.gif")} width="150" height="150" alt="loading-gif"></img>
                </div>

                <div id="suggestion-section">
                    <p>Please be patient as this can take a bit to run.</p>
                </div>
            </div>
        );
    }
}

export default RunningModel
