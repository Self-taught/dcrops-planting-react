import React, { useState } from 'react';
import './NavBar.css'

const NavBar = (props) => {

    const selectedClass = 'bg-green ba br3 ph5 pv3';

    const clickHandler = (e) => {
        console.log(e.target.innerText);
        const selection = e.target.innerText;
        if (selection === 'Planting') {
            props.setNav(true)
        } else if (selection === 'Crafting/Cooking') {
            props.setNav(false)
        }
    }

    return (
        <header className='bg-black w-100 ph3 pv3 pv2-ns ph4-m ph5-l flex justify-around'>
            <p
                className={`white ph3 f2 pointer ${props.selectedNav ? selectedClass : ''}`}
                onClick={clickHandler}
                value='Planting'
            >Planting</p>
            <p
                className={`white ph3 f2 pointer ${!props.selectedNav ? selectedClass : ''}`}
                onClick={clickHandler}
                value='Crafting/Cooking'
            >Crafting/Cooking</p>
        </header >
    )
}

export default NavBar;