// import { render } from "@testing-library/react";
import { Component } from "react";
import SignIn from "./SignIn/SignIn";
import Plant from "./Plant/Plant";
import Card from "./Card/Card";
import axios from "axios";
import 'tachyons';
import './App.css'


class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            userName: "",
            userData: [],
            selectedSeeds: {},
            seedsToPlant: '',
            maxNfts: 0,
            totalLand: 'Loading...',
            totalPlots: 'Loading...',
            landData: [],
            finalData: []
        }
        this.loadData = this.loadData.bind(this)
        this.filterData = this.filterSeeds.bind(this)
        this.addSeeds = this.addSeeds.bind(this)
    }

    findMultiple = async (user_name, offset) => {
        const url = 'https://api.hive-engine.com/rpc/contracts';
        const params = {
            contract: 'nft',
            table: 'DCROPSinstances',
            query: {
                account: user_name
            },
            limit: 1000,
            offset: offset,
            indexes: []
        };
        const j = {
            jsonrpc: '2.0',
            id: 1,
            method: 'find',
            params: params
        };

        try {
            const response = await axios.post(url, j);
            const data = response.data;

            if (data.result.length === 1000) {
                data.result = data.result.concat(await this.findMultiple(user_name, offset + 1000));
            }

            return data.result;
        } catch (error) {
            console.error(error);
            return []; // Return an empty array or handle the error according to your requirements
        }
    }

    loadData = (userName) => {
        this.findMultiple(userName, 0).then(response => {
            if (!response[0]) {
                alert('Please refresh and enter the right user name in lowercase letters!')
            } else {
                this.setState({ userData: response, userName: response[0]['account'] })
            }
        })
    }

    filterSeeds = (title) => {
        if (this.state.selectedSeeds[title]) {
            delete this.state.selectedSeeds[title]
            const selectedSeeds = { ...this.state.selectedSeeds }
            this.setState({ selectedSeeds })
            this.loadSeeds()
        }
        if (this.state.userData.length > 0) {
            const totalSeeds = this.state.userData.filter(el => {
                const nftType = el.properties.name
                return nftType === title;
            });
            const availableSeeds = totalSeeds.filter(el => {
                const timestamp = JSON.parse(el.properties.secondary)
                function getDaysDifference(timestamp) {
                    const oneDay = 24 * 60 * 60 * 1000; // Number of milliseconds in a day

                    const currentDate = new Date();
                    const targetDate = new Date(timestamp * 1000); // Multiply by 1000 to convert seconds to milliseconds

                    const diffInMilliseconds = Math.abs(currentDate - targetDate);
                    const diffInDays = Math.round(diffInMilliseconds / oneDay);

                    return diffInDays;
                }

                // Example usage
                const targetTimestamp = timestamp['cd'];
                const daysDifference = getDaysDifference(targetTimestamp);
                return daysDifference >= 14;
            })
            const availableSeedIds = availableSeeds.map(el => el['_id'])
            return availableSeedIds;
        } else {
            return 0;
        }
    }

    filterLands = (e) => {
        if (this.state.userData.length > 0) {
            const value = e.target.value;

            if (!value) {
                return;
            }
            const totalLands = this.state.userData.filter(el => {
                const nftType = el.properties.name
                if (value === 'Any') {
                    return (
                        nftType === 'Fairy Garden' ||
                        nftType === 'Hi-Tec Land' ||
                        nftType === 'Awesome Land' ||
                        nftType === 'Trinity Land' ||
                        nftType === 'Fertile Land' ||
                        nftType === 'Average Farmland'
                    );
                }
                return nftType === value;
            });

            const emptyLands = [];
            let totalEmptyPlots = 0;

            totalLands.forEach(land => {
                const plots = JSON.parse(land.properties.secondary)
                const emptyPlotArray = [];
                let foundPlot = null;
                plots['p'].forEach((el, i) => {
                    if (el === "") {
                        totalEmptyPlots += 1;

                        if (!foundPlot) {
                            foundPlot = {
                                landId: land['_id'],
                                emptyPlots: []
                            }
                        }
                        emptyPlotArray.push(i)
                    }
                });

                if (foundPlot) {
                    foundPlot.emptyPlots = emptyPlotArray;
                    emptyLands.push(foundPlot)
                }
            })

            this.setState({
                totalLand: totalLands.length,
                totalPlots: totalEmptyPlots,
                landData: emptyLands
            });
        }
    }

    loadSeeds = () => {
        let selectedSeeds = '';
        let totalSeedsLands = 0;
        for (const seeds in this.state.selectedSeeds) {
            selectedSeeds += `${seeds} ${this.state.selectedSeeds[seeds].length} `
            totalSeedsLands += this.state.selectedSeeds[seeds].length
        }

        // this.state.seedsToPlant = selectedSeeds

        this.setState({
            seedsToPlant: selectedSeeds,
            maxNfts: totalSeedsLands
        })
        // return selectedSeeds
    }

    addSeeds = (seed, array) => {
        if (array.length === 0) {
            delete this.state.selectedSeeds[seed]
        } else {
            this.state.selectedSeeds[seed] = array
        }
        this.loadSeeds();
    }

    plantSeeds = () => {
        const { selectedSeeds, landData } = this.state;
        const allSeeds = Object.values(selectedSeeds).flat();
        if (allSeeds.length < 1) {
            alert('Please Select seeds first to plant');
            return;
        }
        if (landData.length < 1) {
            alert('Please Select at least one seed and land type to plant');
            return;
        }

        // const updatedFinalData = [...finalData];
        const updatedFinalData = [];
        const totalNfts = new Set();

        for (let i = 0; i < landData.length && totalNfts.size < 48; i++) {
            const el = landData[i];
            const currentData = {
                landID: el['landId'],
                plant: []
            };
            if (!allSeeds.length) {
                break;
            }
            totalNfts.add(el['landId']);

            for (let j = 0; j < el['emptyPlots'].length && totalNfts.size < 48; j++) {
                const p = el['emptyPlots'][j];

                if (!allSeeds.length) {
                    break;
                }

                const seedData = {
                    seedID: allSeeds[0] || null,
                    plotNo: p
                };

                totalNfts.add(allSeeds[0]);
                allSeeds.shift();
                currentData['plant'].push(seedData);
            }

            updatedFinalData.push(currentData);
        }

        const keychain = window.hive_keychain;
        keychain.requestCustomJson(this.state.userName, 'dcrops', 'Active', JSON.stringify({ operation: "plantMultiple", payload: updatedFinalData }), 'Plant Seeds!', (response) => {
            if (response.success === true) {
                this.setState({
                    finalData: updatedFinalData,
                    userData: this.state.userData.filter(el => !totalNfts.has(el['_id'])),
                    selectedSeeds: {},
                    landData: this.state.landData.filter(el => !totalNfts.has(el['_id'])),
                    seedsToPlant: ''
                });
            }
        });
    };


    render() {
        return (
            <div>
                {
                    this.state.userData.length > 0 ?
                        <div>
                            <div className="br3 ba near-black mv4 w-100 w-60-m w-60-l shadow-5 mw6 center">
                                <div className="black pa4">
                                    <legend className="f2 fw6 ph0 mh0">Welcome {this.state.userName}</legend>
                                    <p>Max Seeds: 40</p>
                                    <p>Current total seeds: {this.state.maxNfts}</p>
                                    <ul>{this.state.seedsToPlant}</ul>
                                    <hr />
                                    <div className="mv2">
                                        <p className="w-100 f4 mv1">Select the type of land: </p>
                                        <div className="container mv3">
                                            <input onClick={this.filterLands} type="radio" id="Hi-Tec Land" name="landType" value="Hi-Tec Land" />
                                            <label className="w-100 mv1 mh2" htmlFor="Hi-Tec Land">Hi-Tec Land</label><br />

                                            <input onClick={this.filterLands} type="radio" id="Trinity Land" name="landType" value="Trinity Land" />
                                            <label className="w-100 mv1 mh2" htmlFor="Trinity Land">Trinity Land</label><br />

                                            <input onClick={this.filterLands} type="radio" id="Fairy Garden" name="landType" value="Fairy Garden" />
                                            <label className="w-100 mv1 mh2" htmlFor="Fairy Garden">Fairy Garden</label><br />
                                        </div>
                                        <div className="container mv3">
                                            <input onClick={this.filterLands} type="radio" id="Awesome Land" name="landType" value="Awesome Land" />
                                            <label className="w-100 mv1 mh2" htmlFor="Awesome Land">Awesome Land</label><br />

                                            <input onClick={this.filterLands} type="radio" id="Fertile Land" name="landType" value="Fertile Land" />
                                            <label className="w-100 mv3 mh2" htmlFor="Fertile Land">Fertile Land</label><br />

                                            <input onClick={this.filterLands} type="radio" id="Average Farmland" name="landType" value="Average Farmland" />
                                            <label className="w-100 mv1 mh2" htmlFor="Average Farmland">Average Farmland</label><br />
                                        </div>
                                        <hr />

                                        <p>Total Plots Available to plant: {this.state.totalPlots}</p>
                                        <input
                                            onClick={this.plantSeeds}
                                            className="pa2 w-35 bg-green br3 center"
                                            type="submit"
                                            value='Plant' />
                                        <p>After planting, change the land type to update land data. Otherwise land data may not update!</p>
                                    </div>
                                </div>
                                <Plant />
                            </div>
                            <div className="container">
                                <Card title='Sweet Potato' filterData={this.filterData} addSeeds={this.addSeeds} />
                                <Card title='Hot Pepper' filterData={this.filterData} addSeeds={this.addSeeds} />
                                <Card title='Hops' filterData={this.filterData} addSeeds={this.addSeeds} />
                            </div>
                            <div className="container">
                                <Card title='Lavender' filterData={this.filterData} addSeeds={this.addSeeds} />
                                <Card title='Sage' filterData={this.filterData} addSeeds={this.addSeeds} />
                                <Card title='Thyme' filterData={this.filterData} addSeeds={this.addSeeds} />
                            </div>
                            <div className="container">
                                <Card title='Raspberry' filterData={this.filterData} addSeeds={this.addSeeds} />
                                <Card title='Beetroot' filterData={this.filterData} addSeeds={this.addSeeds} />
                                <Card title='Pumpkin' filterData={this.filterData} addSeeds={this.addSeeds} />
                            </div>
                            <div className="container">
                                <Card title='Carrot' filterData={this.filterData} addSeeds={this.addSeeds} />
                                <Card title='Garlic' filterData={this.filterData} addSeeds={this.addSeeds} />
                                <Card title='King Weed' filterData={this.filterData} addSeeds={this.addSeeds} />
                            </div>
                        </div> : <SignIn loadData={this.loadData} />
                }

            </div >

        );
    }

}

export default App;