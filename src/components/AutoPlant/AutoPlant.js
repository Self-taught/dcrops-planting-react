import { Component } from "react";

class AutoPlant extends Component {
  state = {
    userData: this.props.allData,
    emptyLands: [],
    totalAvailableSeeds: [],
    totalAvailablePlots: [],
    selectLandTypes: [
      "All",
      "Hi-Tec Land",
      "Trinity Land",
      "Fairy Garden",
      "Awesome Land",
      "Fertile Land",
      "Average Farmland",
    ],
    selectSeedTypes: ["All", ...this.props.currentSeeds],
    selectedLand: "All",
    selectedSeed: "All",
  };

  componentDidMount() {
    this.filterData();
  }

  filterData = () => {
    const validLandTypes = [
      "Hi-Tec Land",
      "Trinity Land",
      "Fairy Garden",
      "Awesome Land",
      "Fertile Land",
      "Average Farmland",
    ];
    const seedTypes =
      this.state.selectedSeed === "All"
        ? this.props.currentSeeds
        : this.state.selectedSeed;

    let totalLands;

    if (this.state.selectedLand === "All") {
      totalLands = this.state.userData
        .filter((el) => validLandTypes.includes(el.properties.name))
        .sort(
          (a, b) =>
            validLandTypes.indexOf(a.properties.name) -
            validLandTypes.indexOf(b.properties.name)
        );
    } else {
      totalLands = this.state.userData.filter(
        (el) => this.state.selectedLand === el.properties.name
      );
    }

    const emptyLands = [];
    let totalEmptyPlots = 0;

    totalLands.forEach((land) => {
      const plots = JSON.parse(land.properties.secondary);
      const emptyPlotArray = [];
      let foundPlot = null;

      plots["p"].forEach((el, i) => {
        if (el === "") {
          totalEmptyPlots += 1;
          if (!foundPlot) {
            foundPlot = {
              landId: land["_id"],
              emptyPlots: [],
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

    let totalSeeds;

    if (this.state.selectedSeed === "All") {
      totalSeeds = this.state.userData
        .filter((el) => seedTypes.includes(el.properties.name))
        .sort(
          (a, b) =>
            seedTypes.indexOf(a.properties.name) -
            seedTypes.indexOf(b.properties.name)
        );
    } else {
      totalSeeds = this.state.userData.filter(
        (el) => this.state.selectedSeed === el.properties.name
      );
    }

    const availableSeeds = totalSeeds.filter((el) => {
      const timestamp = JSON.parse(el.properties.secondary);
      const targetTimestamp = timestamp["cd"];
      const daysDifference = this.getHoursDifference(targetTimestamp);

      return daysDifference > 336;
    });

    this.setState({
      emptyLands,
      totalAvailableSeeds: availableSeeds,
      totalAvailablePlots: totalEmptyPlots,
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

  getEventDataLand = (e) => {
    this.setState({ selectedLand: e.target.value }, () => {
      this.filterData();
    });
  };

  getEventDataSeed = (e) => {
    this.setState({ selectedSeed: e.target.value }, () => {
      this.filterData();
    });
  };

  addAutoPlantSeeds = () => {
    this.filterData();
    const seedTypes = this.props.currentSeeds;

    const maxSeedsToPlant = 36;
    const maxTotalNfts = 48;
    const finalDataAutoPlant = [];

    let { emptyLands, totalAvailableSeeds } = this.state;

    if (totalAvailableSeeds.length < 1) {
      alert("No seeds left to plant!");
      return;
    }

    if (emptyLands.length < 1) {
      alert("No lands left to plant!");
      return;
    }

    let currentSeedsToPlant = totalAvailableSeeds.filter(
      (seed) => seed.properties.name === seedTypes[0]
    );

    while (currentSeedsToPlant.length < maxSeedsToPlant) {
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
        plant: [],
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
          plotNo: plot,
        };

        totalNfts.add(currentSeedsToPlant[0]["_id"]);
        currentSeedsToPlant.shift();
        currentData["plant"].push(seedData);
      }

      currentFinalData.push(currentData);
    }

    finalDataAutoPlant.push(currentFinalData);
    emptyLands = emptyLands.filter((land) => !totalNfts.has(land["landId"]));
    totalAvailableSeeds = totalAvailableSeeds.filter(
      (seed) => !totalNfts.has(seed["_id"])
    );

    let dataToSend = "";
    finalDataAutoPlant.forEach(
      (el) =>
        (dataToSend += JSON.stringify({
          operation: "plantMultiple",
          payload: el,
        }))
    );

    const keychain = window.hive_keychain;
    keychain.requestBroadcast(
      this.props.userName,
      [
        [
          "custom_json",
          {
            required_auths: [this.props.userName],
            required_posting_auths: [],
            id: "dcrops",
            json: dataToSend,
          },
        ],
      ],
      "Active",
      (response) => {
        if (response.success === true) {
          this.props.autoPlantSeeds(totalNfts);
          this.setState(
            {
              userData: this.state.userData.filter(
                (el) => !totalNfts.has(el["_id"])
              ),
            },
            () => this.filterData()
          );
        }
      }
    );
  };

  render() {
    return (
      <div className="br3 ba bg-washed-blue pa3 near-black mv4 w-100 w-80-m w-80-l shadow-5 center">
        <p className="f3 center">Auto Plant Seeds</p>
        <hr />
        <div>
          {this.state.selectedLand === "All" ? (
            <p>
              Land Preference: Hi-Tec Land &gt; Trinity Land &gt; Fairy Garden
              &gt; Awesome Land &gt; Fertile Land &gt; Average Farmland.
            </p>
          ) : (
            ""
          )}

          <p className="w-100 f4 mv1">Select the type of land: </p>

          {this.state.selectLandTypes
            .reduce((containerArray, land, index) => {
              if (index % 3 === 0) {
                containerArray.push([]);
              }
              containerArray[Math.floor(index / 3)].push(land);
              return containerArray;
            }, [])
            .map((landGroup, index) => (
              <div key={index} className="container mv3">
                {landGroup.map((landType) => (
                  <div key={landType} className="flex justify-between">
                    <input
                      onClick={this.getEventDataLand}
                      type="radio"
                      id={landType}
                      name="landType"
                      value={landType}
                    />
                    <p className="w-100 mv1 mh3" htmlFor={landType}>
                      {landType}
                    </p>
                    <br />
                  </div>
                ))}
              </div>
            ))}
          <hr />
        </div>
        <div>
          {this.state.selectedSeed === "All" ? (
            <p>
              Seed Preference: Beta Legendary &gt; Alpha Legendary &gt; Beta
              Epic &gt; Alpha Epic &gt; Alpha Rare &gt; Alpha Common &gt; Beta
              Rare &gt; Beta Common.
            </p>
          ) : (
            ""
          )}

          <p className="w-100 f4 mv1">Select the Seed Type: </p>

          {this.state.selectSeedTypes
            .reduce((containerArray, seed, index) => {
              if (index % 4 === 0) {
                containerArray.push([]);
              }
              containerArray[Math.floor(index / 4)].push(seed);
              return containerArray;
            }, [])
            .map((seedGroup, index) => (
              <div key={index} className="container mv3">
                {seedGroup.map((seedType) => (
                  <div key={seedType} className="flex justify-between">
                    <input
                      onClick={this.getEventDataSeed}
                      type="radio"
                      id={seedType}
                      name="seedType"
                      value={seedType}
                    />
                    <p className="w-100 mv1 mh3" htmlFor={seedType}>
                      {seedType}
                    </p>
                    <br />
                  </div>
                ))}
              </div>
            ))}
          <hr />
        </div>

        <p className="tc">
          Available Seeds: &nbsp;
          <span
            className={
              this.state.totalAvailableSeeds.length > 0 ? "green b" : "red b"
            }
          >
            {this.state.totalAvailableSeeds.length}
          </span>{" "}
          &nbsp; Available Plots: &nbsp;
          <span
            className={this.state.totalAvailablePlots > 0 ? "green b" : "red b"}
          >
            {this.state.totalAvailablePlots}
          </span>
        </p>

        <div className="center flex">
          <input
            className="bg-light-purple br3 pv2 ph5 white center pointer grow"
            type="submit"
            value="Auto Plant"
            onClick={this.addAutoPlantSeeds}
          />
        </div>
        <p className="bg-dark-pink pa2 br3 white">
          DON'T REFRESH AND PLANT AGAIN. IT TAKES 10-20 SEC FOR
          HIVE ENGINE TO UPDATE DATA. SO, IF YOU PLANT SOMETHING, DO NOT REFRESH
          AND PLANT DIFFERENT SEEDS INSTANTLY AGAIN. IT MAY SEND SEEDS INTO 14
          DAYS COOLDOWN MODE
        </p>
      </div>
    );
  }
}

export default AutoPlant;
