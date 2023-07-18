import React from 'react';
import './NavBar.css'

const NavBar = (props) => {

    const selectedClass = 'bg-green ba br3 ph5 pv3';

    const clickHandler = (e) => {
        const selection = e.target.innerText;
        if (selection === 'Planting') {
            props.setNav(true)
        } else if (selection === 'Crafting/Cooking') {
            props.setNav(false)
        }
    }


    return (
        <header className='bg-black w-100 ph3 pv3 pv2-ns ph4-m ph5-l flex justify-between'>
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
            <p
                onClick={props.logoutHandler}
                className='bg-dark-pink grow white br3 pointer f3 pa3 pv4'>Logout</p>
        </header >
    )
    }

    export default NavBar;