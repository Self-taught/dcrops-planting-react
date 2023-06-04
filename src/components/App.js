// import { render } from "@testing-library/react";
import { Component } from "react";
import SignIn from "./SignIn/SignIn";
import Plant from "./Plant/Plant";
import Card from "./Card/Card";
import AutoPlant from "./AutoPlant/AutoPlant";
import axios from "axios";
import 'tachyons';
import './App.css';

const seedTypes = [['Egg Plant', 'Strawberry', 'Ginger', 'Potato', 'Cauliflower', 'Broccoli', 'Kale', 'French Bean', 'Tulip', 'Rosemary', 'Dill'], ['1'],
['Sunflower', 'Sweet Potato', 'King Weed', 'Raspberry', 'Beetroot', 'Hot Pepper', 'Pumpkin', 'Lavender', 'Hops', 'Garlic', 'Carrot', 'Thyme', 'Sage'],
['Napa Cabbage', 'Sweet Potato', 'Bell Pepper', 'King Weed', 'Leek', 'Onion', 'Cabbage', 'Radish', 'Peas', 'White Rose', 'Kidney Beans', 'Cilantro', 'Parsley']
];


class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            userName: "",
            userData: [],
            currentSeeds: [],
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
        this.autoPlantSeeds = this.autoPlantSeeds.bind(this)
    }

    getCurrentSeason = async () => {
        const url = 'https://api.hive-engine.com/rpc/contracts';
        const params = {
            contract: 'nft',
            table: 'DCROPSinstances',
            query: {
                _id: 1
            },
            limit: 1000,
            offset: 0,
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

            return data.result[0]['properties']['primary'];
        } catch (error) {
            return []; // Return an empty array or handle the error according to your requirements
        }
    }

    componentDidMount() {
        this.getCurrentSeason()
            .then(response => this.setState({ currentSeeds: seedTypes[response] }));
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
                function getHoursDifference(timestamp) {
                    const hoursPassed = 60 * 60 * 1000; // Number of milliseconds in a day

                    const currentDate = new Date();
                    const targetDate = new Date(timestamp * 1000); // Multiply by 1000 to convert seconds to milliseconds

                    const diffInMilliseconds = Math.abs(currentDate - targetDate);
                    const diffInHours = Math.round(diffInMilliseconds / hoursPassed);
                    return diffInHours;
                }

                // Example usage
                const targetTimestamp = timestamp['cd'];
                const daysDifference = getHoursDifference(targetTimestamp);
                return daysDifference > 336;
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

                this.loadSeeds()
            }
        });
    };

    autoPlantSeeds = (set) => {
        this.setState({ userData: this.state.userData.filter(el => !set.has(el['_id'])) }, () => console.log("Updated after one autoplant:", this.state.userData.length))
    }

    render() {
        return (
            <div>
                {
                    this.state.userData.length > 0 ?
                        <div>
                            <div className="container">
                                <div className="br3 ba near-black mv4 w-100 w-65-m w-65-l shadow-5 mw6 center">
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
                                                <p className="w-100 mv1 mh2" htmlFor="Hi-Tec Land">Hi-Tec Land</p><br />

                                                <input onClick={this.filterLands} type="radio" id="Trinity Land" name="landType" value="Trinity Land" />
                                                <p className="w-100 mv1 mh2" htmlFor="Trinity Land">Trinity Land</p><br />

                                                <input onClick={this.filterLands} type="radio" id="Fairy Garden" name="landType" value="Fairy Garden" />
                                                <p className="w-100 mv1 mh2" htmlFor="Fairy Garden">Fairy Garden</p><br />
                                            </div>
                                            <div className="container mv3">
                                                <input onClick={this.filterLands} type="radio" id="Awesome Land" name="landType" value="Awesome Land" />
                                                <p className="w-100 mv1 mh2" htmlFor="Awesome Land">Awesome Land</p><br />

                                                <input onClick={this.filterLands} type="radio" id="Fertile Land" name="landType" value="Fertile Land" />
                                                <p className="w-100 mv3 mh2" htmlFor="Fertile Land">Fertile Land</p><br />

                                                <input onClick={this.filterLands} type="radio" id="Average Farmland" name="landType" value="Average Farmland" />
                                                <p className="w-100 mv1 mh2" htmlFor="Average Farmland">Average Farmland</p><br />
                                            </div>
                                            <hr />

                                            <p>Total Plots Available to plant: {this.state.totalPlots}</p>
                                            <input
                                                onClick={this.plantSeeds}
                                                className="pa2 w-35 bg-green br3 center pointer ph4 grow"
                                                type="submit"
                                                value='Plant' />
                                            <p>After planting, change the land type to update land data. Otherwise land data may not update!</p>
                                        </div>
                                    </div>
                                    <Plant />
                                </div>
                            </div>
                            <div>
                                {this.state.currentSeeds.reduce((containerArray, seed, index) => {
                                    if (index % 3 === 0) {
                                        containerArray.push([]);
                                    }
                                    containerArray[Math.floor(index / 3)].push(seed);
                                    return containerArray;
                                }, []).map((seedGroup, index) => (
                                    <div className="container" key={index}>
                                        {seedGroup.map((seed) => (
                                            <Card title={seed} filterData={this.filterData} addSeeds={this.addSeeds} key={seed} />
                                        ))}
                                    </div>
                                ))}
                            </div>
                            <hr />
                            <div>
                                <p className="f1 bg-gold br3 ba tc pa3 near-black mv4 w-100 w-80-m w-80-l shadow-5 center">Other Features/Apps</p>
                                <div className="bg-washed-blue br3 ba pa3 near-black mv4 w-100 w-80-m w-80-l shadow-5 center">
                                    <p className="f3 tc">Farming Bot</p>
                                    <hr />
                                    <ul>
                                        <li>Check when your crops will be ready to harvest.
                                        </li>
                                        <li>
                                            Check when your craft/cooking items will be ready to claim.
                                        </li>
                                        <li>
                                            Set alerts for your cooking/crafting items. Farming bot will alert you (send message on discord) when your items will be ready.
                                        </li>
                                    </ul>
                                    <a className="white link button-link ba br3 bg-light-purple tc pa2 near-black mv2 w-35-ns w-35-l grow pointer ml3" href="https://discord.gg/wb3AZGcASH" target="_blank">Join Farmer Bot</a>
                                </div>
                                <AutoPlant
                                    allData={this.state.userData}
                                    userName={this.state.userName}
                                    autoPlantSeeds={this.autoPlantSeeds}
                                    currentSeeds={this.state.currentSeeds}
                                />
                            </div>
                        </div>
                        : <SignIn loadData={this.loadData} />
                }

            </div >

        );
    }

}

export default App;