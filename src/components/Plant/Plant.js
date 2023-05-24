import React from "react";
import { Component } from "react";

class Plant extends Component {
    constructor(props) {
        super(props);
        this.state = {
            userName: '',
            selectedSeeds: ''
        }
    }

    render() {
        return (
            <div>
            </div>
        );
    }
}

// const Plant = (props) => {
//     for (const keys in this.props.selectedSeeds) {
//         return (<div>
//             {keys} : {this.props.selectedSeeds[keys]}
//         </div>);
//     }
// }

export default Plant;