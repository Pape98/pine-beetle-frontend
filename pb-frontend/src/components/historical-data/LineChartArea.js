import React, { Component } from 'react';
import {Line} from 'react-chartjs-2';
import ReactTooltip from 'react-tooltip'
import math from 'mathjs';
import '../../styles/historical-data/LineChartArea.css';

class LineChartArea extends Component {
    constructor(props) {
        super(props);

        this.state = {
            chartData: {
                labels: [],
                datasets: [
                    {
                        data: [],
                        label: "Total Spots",
                        borderColor: "#1f77b4",
                        fill: false
                    },
                    {
                        data: [],
                        label: "Total SPB Per Two Weeks",
                        borderColor: "#ff7f0e",
                        fill: false
                    },
                    {
                        data: [],
                        label: "Total Clerids Per Two Weeks",
                        borderColor: "#2ca02c",
                        fill: false
                    }
                ]
            }, // used for chartjs line chart
            chartOptions: {
                maintainAspectRatio: false,
                scales: {
                    yAxes : [{
                        ticks : {
                            max : 1000,
                            min : 0
                        }
                    }]
                }
            },
            spotsMean: 0,
            spotsSD: 0,
            spbMean: 0,
            spbSD: 0,
            cleridsMean: 0,
            cleridsSD: 0
        }

        this.updateStateFromProps = this.updateStateFromProps.bind(this);
    }
    render() {
        return(
            <div className="flex-container" id="data-insights-holder">
                <div className="container data-insights flex-item flex-item-left" id="data-insights">
                        <Line data={this.state.chartData} height={400} options={this.state.chartOptions}/>
                </div>
                <div className="container flex-item flex-item-right" id="line-metrics-area">
                        <p data-tip="Sample Mean of Spots"><b>Spots Mean: </b>{this.state.spotsMean.toLocaleString()}</p>
                        <p data-tip="Standard Deviation of Spots"><b>Spots SD: </b>{this.state.spotsSD.toLocaleString().slice(0, -1)}</p>
                        <div className="metrics-line"></div>
                        <p data-tip="Sample Mean of SPB"><b>SPB Mean: </b>{this.state.spbMean.toLocaleString()}</p>
                        <p data-tip="Standard Deviation of SPB"><b>SPB SD: </b>{this.state.spbSD.toLocaleString().slice(0, -1)}</p>
                        <div className="metrics-line"></div>
                        <p data-tip="Sample Mean of Clerids"><b>Clerids Mean: </b>{this.state.cleridsMean.toLocaleString()}</p>
                        <p data-tip="Standard Deviation of Clerids"><b>Clerids SD: </b>{this.state.cleridsSD.toLocaleString().slice(0, -1)}</p>
                        <ReactTooltip />
                </div>
    		</div>
        );
    }

    // on mount, update the state
    componentDidMount() {
        this.updateStateFromProps(this.props);
    }

    // if we are receiving new data, update the state before rendering
    componentWillReceiveProps(nextProps) {
        if (this.props.data !== nextProps.data) {
            this.updateStateFromProps(nextProps);
        }
    }

    // recalculate values to show on page
    updateStateFromProps(props) {
        if (props.data.length != 0) {
            // create data object for line chart
            var chartData = {
                labels: [],
                datasets: [
                    {
                        data: [],
                        label: "Total Spots",
                        borderColor: "#1f77b4",
                        fill: false
                    },
                    {
                        data: [],
                        label: "Total SPB Per Two Weeks",
                        borderColor: "#ff7f0e",
                        fill: false
                    },
                    {
                        data: [],
                        label: "Total Clerids Per Two Weeks",
                        borderColor: "#2ca02c",
                        fill: false
                    }
                ]
            }

            // initialize data arrays
            var spots = []
            var spb = []
            var clerids = []

            // add array for each year
            for (var year = 0; year < (new Date()).getFullYear(); year++) {
                spots[year] = []
                spb[year] = []
                clerids[year] = []
            }

            // add data and labels to object
            for (var i in props.data) {
                year = props.data[i].year
                // update spots count
                if (props.data[i].spots != null) {
                    spots[year].push(props.data[i].spots)
                }

                // update spb per two weeks count
                if (props.data[i].spbPerTwoWeeks != null) {
                    spb[year].push(props.data[i].spbPerTwoWeeks)
                }

                // update clerids per two weeks count
                if (props.data[i].cleridsPerTwoWeeks != null) {
                    clerids[year].push(props.data[i].cleridsPerTwoWeeks)
                }

                // add to the line chart's label if we haven't yet found this day
                if (!chartData.labels.includes(year)) {
                    chartData.labels.push(year);
                }
            }

            // clear out data arrays of empty years
            for (year = 0; year < (new Date()).getFullYear(); year++) {
                if (spots[year].length > 0) {
                    var sum = 0;
                    for (i in spots[year]) {
                        sum += spots[year][i]
                    }
                    chartData.datasets[0].data.push(sum)
                }

                if (spb[year].length > 0) {
                    sum = 0;
                    for (i in spb[year]) {
                        sum += spb[year][i]
                    }
                    chartData.datasets[1].data.push(sum)
                }

                if (clerids[year].length > 0) {
                    sum = 0;
                    for (i in clerids[year]) {
                        sum += clerids[year][i]
                    }
                    chartData.datasets[2].data.push(sum)
                }
            }

            // maximum value found in the array
            var max = 0

            // adjust y-axis height
            for (var entry in chartData.datasets[0].data) {
                if (chartData.datasets[0].data[entry] > max) {
                    max = chartData.datasets[0].data[entry]
                }
            }
            for (entry in chartData.datasets[1].data) {
                if (chartData.datasets[1].data[entry] > max) {
                    max = chartData.datasets[1].data[entry]
                }
            }
            for (entry in chartData.datasets[2].data) {
                if (chartData.datasets[2].data[entry] > max) {
                    max = chartData.datasets[2].data[entry]
                }
            }

            // compute mean and standard deviations
            var spotsMean = math.mean(chartData.datasets[0].data)
            var spotsSD = math.std(chartData.datasets[0].data)
            var spbMean = math.mean(chartData.datasets[1].data)
            var spbSD = math.std(chartData.datasets[1].data)
            var cleridsMean = math.mean(chartData.datasets[2].data)
            var cleridsSD = math.std(chartData.datasets[2].data)

            // set new y-axis height
            this.state.chartOptions.scales.yAxes[0].ticks.max = max

            // update state
            this.setState({
                chartData: chartData,
                spotsMean: spotsMean,
                spotsSD: spotsSD,
                spbMean: spbMean,
                spbSD: spbSD,
                cleridsMean: cleridsMean,
                cleridsSD: cleridsSD
            });
        }
    }
}

export default LineChartArea
