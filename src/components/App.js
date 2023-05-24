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
            this.setState({ userData: response, userName: response[0]['account'] })
            console.log(response)
        }
        )
    }

    filterSeeds = (title) => {
        if (this.state.selectedSeeds[title]) {
            console.log(this.state.selectedSeeds)
            delete this.state.selectedSeeds[title]
            const selectedSeeds = { ...this.state.selectedSeeds }
            this.setState({ selectedSeeds }, () => console.log(this.state.selectedSeeds))
            this.loadSeeds()
        }
        if (this.state.userData.length > 0) {
            const totalSeeds = this.state.userData.filter(el => {
                const nftType = el.properties.name
                return nftType === title;
            });
            // console.log(totalSeeds)
            const availableSeeds = totalSeeds.filter(el => {
                const timestamp = JSON.parse(el.properties.secondary)
                // console.log(timestamp['cd'])
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
            console.log(availableSeedIds)
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
            console.log(emptyLands)
            // console.log('Total Empty Plots: ', totalEmptyPlots)

            // console.log(totalLands)
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
        // console.log(this.state.seedsToPlant, 'Max Seeds: ', maxSeeds)
        // return selectedSeeds
    }

    addSeeds = (seed, array) => {
        if (array.length === 0) {
            delete this.state.selectedSeeds[seed]
        } else {
            this.state.selectedSeeds[seed] = array
        }
        console.log(this.state.selectedSeeds)
        this.loadSeeds();
    }

    plantSeeds = () => {
        const { selectedSeeds, finalData, landData } = this.state;
        const allSeeds = Object.values(selectedSeeds).flat();

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
        console.log(totalNfts)
        if (totalNfts.has(119939)) {
            console.log('Okay');
        }
        console.log(this.state.userData)
        for (let d of this.state.userData) {
            if (totalNfts.has(d['_id'])) {
                console.log(d)
            }
        }

        this.setState({
            finalData: updatedFinalData,
            userData: this.state.userData.filter(el => !totalNfts.has(el['_id'])),
            selectedSeeds: {},
            landData: this.state.landData.filter(el => !totalNfts.has(el['_id'])),
            seedsToPlant: ''
        }, () => {
            console.log(this.state.finalData)
            console.log(this.state.userData)
        });
    };


    render() {
        return (
            <div>
                {
                    this.state.userData.length > 0 ?
                        <div>
                            <div className="br3 ba near-black mv4 w-100 w-50-m w-25-l shadow-5 mw6 center">
                                <div className="black pa4">
                                    <legend className="f2 fw6 ph0 mh0">Welcome {this.state.userName}</legend>
                                    <p>Max Seeds: 40</p>
                                    <p>Current total seeds: {this.state.maxNfts}</p>
                                    <ul>{this.state.seedsToPlant}</ul>
                                    <hr />
                                    <div className="mv2">
                                        <label className="w-70" htmlFor="lands">Select the type of land: </label>
                                        <select onChange={this.filterLands} className="mv1 w-30" name="lands" id="lands" >
                                            <option value="">...</option>
                                            <option value="Any">Any</option>
                                            <option value="Hi-Tec Land">Hi-Tec Land</option>
                                            <option value="Trinity Land">Trinity Land</option>
                                            <option value="Fairy Garden">Fairy Garden</option>
                                            <option value="Awesome Land">Awesome Land</option>
                                            <option value="Fertile Land">Fertile Land</option>
                                            <option value="Average Farmland">Average Farmland</option>
                                        </select>
                                        <p>Total Lands: {this.state.totalLand}</p>
                                        <p>Total Plots Available to plant: {this.state.totalPlots}</p>
                                        <input
                                            onClick={this.plantSeeds}
                                            className="pa2 w-35 bg-green br3 ml6"
                                            type="submit"
                                            value='Plant' />
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
                            </div>
                        </div> : <SignIn loadData={this.loadData} />
                }

            </div >

        );
    }

}

export default App;