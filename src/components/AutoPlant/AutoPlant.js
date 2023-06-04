import { Component } from "react";

class AutoPlant extends Component {
    state = {
        userData: this.props.allData,
        emptyLands: [],
        totalAvailableSeeds: []
    };

    componentDidMount() {
        this.filterData();
    }


    filterData = () => {
        const validLandTypes = ['Hi-Tec Land', 'Trinity Land', 'Fairy Garden', 'Awesome Land', 'Fertile Land', 'Average Farmland'];
        const seedTypes = this.props.currentSeeds;

        const totalLands = this.state.userData
            .filter((el) => validLandTypes.includes(el.properties.name))
            .sort((a, b) => validLandTypes.indexOf(a.properties.name) - validLandTypes.indexOf(b.properties.name));

        const emptyLands = [];

        totalLands.forEach((land) => {
            const plots = JSON.parse(land.properties.secondary);
            const emptyPlotArray = [];
            let foundPlot = null;

            plots["p"].forEach((el, i) => {
                if (el === "") {
                    if (!foundPlot) {
                        foundPlot = {
                            landId: land["_id"],
                            emptyPlots: []
                        };
                    }
                    emptyPlotArray.push(i);
                }
            });

            if (foundPlot) {
                foundPlot.emptyPlots = emptyPlotArray;
                emptyLands.push(foundPlot);
            }
        });

        const totalSeeds = this.state.userData.filter((el) =>
            seedTypes.includes(el.properties.name)
        ).sort(
            (a, b) => seedTypes.indexOf(a.properties.name) - seedTypes.indexOf(b.properties.name)
        );

        const availableSeeds = totalSeeds.filter((el) => {
            const timestamp = JSON.parse(el.properties.secondary);
            const targetTimestamp = timestamp["cd"];
            const daysDifference = this.getHoursDifference(targetTimestamp);

            return daysDifference > 336;
        });

        this.setState({
            emptyLands,
            totalAvailableSeeds: availableSeeds
        });
    };

    getHoursDifference = (timestamp) => {
        const hoursInDay = 60 * 60 * 1000; // Number of milliseconds in a day
        const currentDate = new Date();
        const targetDate = new Date(timestamp * 1000); // Multiply by 1000 to convert seconds to milliseconds
        const diffInMilliseconds = Math.abs(currentDate - targetDate);
        const diffInHours = Math.round(diffInMilliseconds / hoursInDay);

        return diffInHours;
    };

    addAutoPlantSeeds = () => {
        this.filterData()
        const seedTypes = this.props.currentSeeds;

        const maxSeedsToPlant = 36;
        const maxTotalNfts = 48;
        const finalDataAutoPlant = [];

        let { emptyLands, totalAvailableSeeds } = this.state;


        if (totalAvailableSeeds.length < 1 ) {
            alert('No seeds left to plant!')
            return;
        }

        if (emptyLands.length < 1) {
            alert('No lands left to plant!')
            return;
        }


        let currentSeedsToPlant = totalAvailableSeeds.filter(
            (seed) => seed.properties.name === seedTypes[0]
        );

        while (
            currentSeedsToPlant.length < maxSeedsToPlant
        ) {
            if (totalAvailableSeeds.length < maxSeedsToPlant) {
                currentSeedsToPlant = currentSeedsToPlant.concat(totalAvailableSeeds);
                break;
            }
            seedTypes.shift();
            currentSeedsToPlant = currentSeedsToPlant.concat(
                totalAvailableSeeds.filter(
                    (seed) => seed.properties.name === seedTypes[0]
                )
            );
        }

        currentSeedsToPlant = currentSeedsToPlant.slice(0, maxSeedsToPlant);

        const currentFinalData = [];
        const totalNfts = new Set();

        for (
            let i = 0;
            i < emptyLands.length && totalNfts.size < maxTotalNfts;
            i++
        ) {
            const land = emptyLands[i];
            const currentData = {
                landID: land["landId"],
                plant: []
            };

            if (!currentSeedsToPlant.length) {
                break;
            }

            totalNfts.add(land["landId"]);

            for (
                let j = 0;
                j < land["emptyPlots"].length && totalNfts.size < maxTotalNfts;
                j++
            ) {
                const plot = land["emptyPlots"][j];

                if (!currentSeedsToPlant.length) {
                    break;
                }

                const seedData = {
                    seedID: currentSeedsToPlant[0]["_id"] || null,
                    plotNo: plot
                };

                totalNfts.add(currentSeedsToPlant[0]["_id"]);
                currentSeedsToPlant.shift();
                currentData["plant"].push(seedData);
            }

            currentFinalData.push(currentData);
        }

        finalDataAutoPlant.push(currentFinalData);
        emptyLands = emptyLands.filter(
            (land) => !totalNfts.has(land["landId"])
        );
        totalAvailableSeeds = totalAvailableSeeds.filter(
            (seed) => !totalNfts.has(seed["_id"])
        );


        let dataToSend = ""
        finalDataAutoPlant.forEach(el => dataToSend += JSON.stringify({ operation: "plantMultiple", payload: el }));

        const keychain = window.hive_keychain;
        keychain.requestBroadcast(this.props.userName, [[
            "custom_json", {
                "required_auths": [this.props.userName], "required_posting_auths": [],
                "id": "dcrops",
                "json": dataToSend
            }
        ]], 'Active', (response) => {
            if (response.success == true) {
                this.props.autoPlantSeeds(totalNfts)
                this.setState({ userData: this.state.userData.filter(el => !totalNfts.has(el['_id'])) }, () => this.filterData());
            }
        });

    }


    render() {
        return (
            <div className="br3 ba bg-washed-blue pa3 near-black mv4 w-100 w-80-m w-80-l shadow-5 center">
                <p className="f3 center">Auto Plant Seeds</p>
                <hr />
                <p>Land Preference: Hi-Tec Land &gt; Trinity Land &gt; Fairy Garden &gt; Awesome Land &gt; Fertile Land &gt; Average Farmland.</p>
                <p>Seed Preference: Beta Legendary &gt; Alpha Legendary &gt; Beta Epic &gt; Alpha Epic &gt; Alpha Rare &gt; Alpha Common &gt; Beta Rare &gt; Beta Common.</p>
                <p className="bg-dark-pink pa2 br3 white">DO NOT USE THIS FEATURE if you want to plant specific seeds on specific lands (Example: Epic seeds on legendary lands or rare seeds on epic lands).
                    Instead, use the normal planting feature. This feature is for bulk/autoplanting only. It will find available empty lands and plantable seeds in order of preference shown above, and then plant them.
                    Plant the specific seeds on lands you want to plant, and then you can use this feature for bulk/auto planting.</p>
                <p className="tc">Available Seeds: {this.state.totalAvailableSeeds.length}</p>
                <div className="center flex">

                    <input
                        className="bg-light-purple br3 pv2 ph5 white center pointer grow"
                        type="submit"
                        value="Auto Plant"
                        onClick={this.addAutoPlantSeeds}
                    />
                </div>
            </div>
        );
    }
}

export default AutoPlant;
