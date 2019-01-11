import React, { Component } from 'react';
import '../../../styles/historical-data/InputFields.css';

class ChoiceInput extends Component {
    constructor(props) {
        super(props);

        this.state = {
            firstOptionText: this.props.instructions,
            options: []
        }
        this.submit = this.submit.bind(this);
        this.resetOptionText = this.resetOptionText.bind(this);
        this.selectField = React.createRef();
    }
    render() {
        return(
            <div className="selection">
                <h3>{this.props.instructions}</h3>
                    <select className="selection-no-button" id={this.props.idName + "-select"} name={this.props.idName} onChange={this.submit} ref={this.selectField}>
                        {this.state.options}
                    </select>
            </div>
        );
    }

    componentWillReceiveProps(nextProps) {
        this.updateStateFromProps(nextProps);
    }

    // update the options in the selection menu
    updateStateFromProps(props) {
        var options = [];
        options.push(<option key={0}>{this.state.firstOptionText}</option>);

        for (var op in props.availableOptions) {
            options.push(<option key={op+1}>{props.availableOptions[op]}</option>);
        }

        this.setState({
            options: options
        });
    }

    resetOptionText() {
        this.setState({
            firstOptionText: this.props.instructions
        });
    }

    // submit a new value for the given selection
    submit(event) {
        if (event.target.value === this.state.firstOptionText) {
            this.props.submitFunction(null);
            this.setState({
                firstOptionText: this.props.instructions
            });
        }
        else {
            this.props.submitFunction(event.target.value);
            this.setState({
                firstOptionText: "Clear Selection"
            });
        }
    }
}

export default ChoiceInput
