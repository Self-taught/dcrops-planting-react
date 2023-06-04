import React from "react";
import { Component } from "react";




class Card extends Component {
    constructor(props) {
        super(props);
        this.state = {
            title: this.props.title,
            seedArray: "Loading...",
            numberAvailable: 'Loading...',
            selectedSeedArray: [],
        }
    }

    addOne = () => {
        if (this.state.numberAvailable >= 1) {
            const currentSeed = this.state.seedArray.filter((el, i) => i === 0);
            this.setState({
                numberAvailable: this.state.numberAvailable - 1,
                selectedSeedArray: [...currentSeed, ...this.state.selectedSeedArray],
                seedArray: this.state.seedArray.filter((el, i) => i > 0)
            }, () => { this.props.addSeeds(this.state.title, this.state.selectedSeedArray) })
        }
    }

    addTen = () => {
        if (this.state.numberAvailable >= 10) {
            const currentSeed = this.state.seedArray.filter((el, i) => i < 10)
            this.setState({
                numberAvailable: this.state.numberAvailable - 10,
                selectedSeedArray: [...currentSeed, ...this.state.selectedSeedArray],
                seedArray: this.state.seedArray.filter((el, i) => i >= 10)
            }, () => { this.props.addSeeds(this.state.title, this.state.selectedSeedArray) })
        }
    }

    removeOne = () => {
        const currentSeed = this.state.selectedSeedArray[0];
        if (currentSeed) {
            this.setState({
                seedArray: [currentSeed, ...this.state.seedArray],
                selectedSeedArray: this.state.selectedSeedArray.filter((el, i) => i !== 0),
            }, () => {
                this.props.addSeeds(this.state.title, this.state.selectedSeedArray);
                this.setState({ numberAvailable: this.state.seedArray.length });
            })
        }
    }

    removeTen = () => {
        const currentSeed = this.state.selectedSeedArray.filter((el, i) => i < 10);
        if (currentSeed) {
            this.setState({
                seedArray: [...currentSeed, ...this.state.seedArray],
                selectedSeedArray: this.state.selectedSeedArray.filter((el, i) => i >= 10),
            }, () => {
                this.props.addSeeds(this.state.title, this.state.selectedSeedArray);
                this.setState({ numberAvailable: this.state.seedArray.length })
            })
        }
    }

    render() {
        return (
            <article className="br3 ba near-black mv4 w-100 w-50-m w-25-l shadow-5 mw6 center" >
                <main className="pa4 black-80">
                    <div className="measure">
                        <fieldset id="sign_up" className="ba b--transparent ph0 mh0">
                            <legend className="f2 fw6 ph0 mh0">{this.state.title}</legend>
                            <div className="mt3">
                                <p className="db fw6 lh-copy f6" htmlFor="userName">Number of {this.state.title} Seeds available to plant : {this.state.numberAvailable}</p>
                            </div>
                            <div className="mt3 log-in-button">
                                {
                                    this.state.seedArray === 'Loading...' ? <input
                                        onClick={() => {
                                            this.setState({
                                                seedArray: this.props.filterData(this.state.title)
                                            }, () => { this.setState({ numberAvailable: this.state.seedArray.length }) })

                                        }}
                                        className="pa2 input-reset ba bg-black hover-bg-black white w-100 br3"
                                        type="submit"
                                        name="userName"
                                        value="Load Data"
                                    />
                                        : (this.state.seedArray.length > 0
                                            ?
                                            <div>
                                                <input
                                                    onClick={this.addOne}
                                                    className="pa2 input-reset ba bg-green hover-bg-dark-green white w-50 br3"
                                                    type="submit"
                                                    name="select"
                                                    value="+ 1"
                                                />
                                                <input
                                                    onClick={this.addTen}
                                                    className="pa2 input-reset ba bg-green hover-bg-dark-green white w-50 br3"
                                                    type="submit"
                                                    name="select"
                                                    value="+ 10"
                                                />
                                                <input
                                                    onClick={this.removeOne}
                                                    className="pa2 input-reset ba bg-red hover-bg-dark-red white w-50 br3"
                                                    type="submit"
                                                    name="select"
                                                    value="- 1"
                                                />
                                                <input
                                                    onClick={this.removeTen}
                                                    className="pa2 input-reset ba bg-red hover-bg-dark-red white w-50 br3"
                                                    type="submit"
                                                    name="select"
                                                    value="- 10"
                                                />
                                                <input
                                                    onClick={() => {
                                                        this.setState({
                                                            seedArray: this.props.filterData(this.state.title),
                                                            selectedSeedArray: []
                                                        }, () => { this.setState({ numberAvailable: this.state.seedArray.length }) })
                                                    }}
                                                    className="pa2 input-reset ba bg-purple hover-bg-purple white w-100 br3"
                                                    type="submit"
                                                    name="userName"
                                                    value="Reset Data"
                                                />
                                            </div>
                                            : <div>
                                                <p>Nothing To Plant!</p>
                                                <input
                                                    onClick={() => {
                                                        this.setState({
                                                            seedArray: this.props.filterData(this.state.title),
                                                            selectedSeedArray: []
                                                        }, () => { this.setState({ numberAvailable: this.state.seedArray.length }) })

                                                    }}
                                                    className="pa2 input-reset ba bg-black hover-bg-black white w-100 br3"
                                                    type="submit"
                                                    name="userName"
                                                    value="Load Data Again"
                                                /></div>
                                        )
                                }
                            </div>
                        </fieldset>
                    </div>
                </main>
            </article>
        )
    }
}

export default Card;