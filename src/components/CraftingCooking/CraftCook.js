import React, { Component } from "react";
import CraftCookCardsList from "./CraftCookCardsList";
import axios from "axios";


class CraftCook extends Component {
    constructor(props) {
        super(props);
        this.state = {
            inventory: [],
            clicked: false
        }
    }

    getData = () => {
        axios.post(`https://dcrops.com/db/userItems`, {username: this.props.userName, types: ['CROP', 'CRAFT', 'FOOD']})
            .then(response => {
                const currentData = response.data.result;
                this.setState({ inventory: currentData });
                
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
    }
    



    clickHandler = () => {
        this.setState({ clicked: true })
        this.getData()
    }

    render() {
        return (
            <div className="flex justify-center mt5">
                {
                    this.state.inventory.length > 0 ?
                        <CraftCookCardsList
                            inventory={this.state.inventory}
                            allData={this.props.allData}
                            userName={this.props.userName} />
                        : this.state.clicked ? 'Loading Your Inventory, Please Wait!' : <button className="bg-light-purple pa3 br3 white f4" onClick={this.clickHandler}>Load Inventory</button>
                }
            </div>
        )
    }
}

export default CraftCook;