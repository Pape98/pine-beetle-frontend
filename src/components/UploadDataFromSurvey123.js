import React, { Component } from 'react';
import '../styles/UploadDataFromSurvey123.css';

class UploadDataFromSurvey123 extends Component {
    constructor(props) {
        super(props);

        this.state = {
            sentQuery: false,
            responseOutput: {},
            url: ""
        }

        this.uploadSurvey123Data = this.uploadSurvey123Data.bind(this);
    }

    render() {
        return(
            <div>
                <div className="container">
                    <button id="survey123-button" className="submit static-button" onClick={this.uploadSurvey123Data}>Upload Survey123 Data</button>
                </div>
                <div className="container">
                    {JSON.stringify(this.state.responseOutput)}
                </div>
            </div>
        );
    }

    componentWillMount() {
        this.setState({
            url: this.props.url
        });
    }

    uploadSurvey123Data() {
        if (!this.state.sentQuery) {
            var url = this.state.url + "uploadSurvey123Fake";
            var xmlHttp = new XMLHttpRequest();

            xmlHttp.onload = function() {
                // if the request was successful hold onto the data
                if (xmlHttp.readyState === 4 && xmlHttp.status === 200) {
                    this.setState({
                        responseOutput: xmlHttp.response,
                        sentQuery: true
                    });
                }
            }.bind(this);

            xmlHttp.open("POST", url, true);
            xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            xmlHttp.responseType = 'json';
            xmlHttp.send();
        }
        else {
            alert("Already uploading data. Please be patient while we grab new survey entries.")
        }
    }
}

export default UploadDataFromSurvey123
