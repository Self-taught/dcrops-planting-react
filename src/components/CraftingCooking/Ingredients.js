import starFull from './stars/star.png';
import starEmpty from './stars/star (1).png'
import { useEffect, useState } from 'react';

const Ingredients = (props) => {
    const [currentStar2, setCurrentStar2] = useState(starEmpty);
    const [currentStar3, setCurrentStar3] = useState(starEmpty);
    const [currentAvailable, setCurrentAvailable] = useState(1);
    const [available, setAvailable] = useState([]);

    const { inventory, keyPair, valuePair, addItems } = props

    useEffect(() => {
        let filtredInventory = inventory.filter(
            el => el.name === keyPair && el.quality === currentAvailable
        );

        let currentlySelected;

        currentlySelected = filtredInventory.length >= valuePair ? filtredInventory.slice(0, valuePair) : [];

        // Code to autoselect the available recipe quantities
        // if (currentlySelected.length !== valuePair) {
        //     filtredInventory = inventory.filter(
        //         el => el.name === keyPair && el.quality === 2
        //     );
        //     currentlySelected = filtredInventory.slice(0, valuePair) || [];
        //     if (currentlySelected.length === valuePair) {
        //         setCurrentStar2(starFull);
        //         setCurrentStar3(starEmpty);
        //         setCurrentAvailable(2)
        //     } else {
        //         filtredInventory = inventory.filter(
        //             el => el.name === keyPair && el.quality === 3
        //         );
        //         currentlySelected = filtredInventory.slice(0, valuePair) || [];

        //         if (currentlySelected.length === valuePair) {
        //             setCurrentStar2(starFull)
        //             setCurrentStar3(starFull)
        //             setCurrentAvailable(3)
        //         } else {
        //             filtredInventory = inventory.filter(
        //                 el => el.name === keyPair && el.quality === currentAvailable
        //             );
        //             currentlySelected = filtredInventory.slice(0, valuePair) || [];
        //         }
        //     }
        // }
        setAvailable(filtredInventory);
        addItems(keyPair, currentlySelected);
    }, [inventory, keyPair, valuePair, addItems, currentAvailable]);


    const clickHandler = (currentChoice) => {
        if (currentChoice === 2) {
            setCurrentStar2(starFull);
            setCurrentStar3(starEmpty);
            setCurrentAvailable(2)
        } else if (currentChoice === 3) {
            setCurrentStar2(starFull)
            setCurrentStar3(starFull)
            setCurrentAvailable(3)
        } else if (currentChoice === 1) {
            setCurrentStar2(starEmpty)
            setCurrentStar3(starEmpty)
            setCurrentAvailable(1)
        }
        // props.addItems()
    }

    return (
        <div className="pa3">
            <p>Available: {available.length}</p>
            <hr />
            <p>{keyPair} x {valuePair}</p>
            <img onClick={() => clickHandler(1)} className='w-20 mr1' src={starFull} alt='star' />
            <img onClick={() => clickHandler(2)} className='w-20 mr1' src={currentStar2} alt='star' />
            <img onClick={() => clickHandler(3)} className='w-20' src={currentStar3} alt='star' />
        </div>
    )
}

export default Ingredients;