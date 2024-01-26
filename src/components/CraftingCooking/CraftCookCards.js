import Ingredients from "./Ingredients";
import './CraftCookCards.css';
import { useState } from "react";


const CraftCookCards = (props) => {
    const itemList = {};
    let eqpType = 'Not Available';

    let equipmentToUse = null;

    // const [equipmentToUse, setEquipmentToUse] = useState(null);
    const [disabledButton, setDisabledButton] = useState(true);

    const addItems = (itemName, itemArray) => {
        itemList[itemName] = itemArray
        checkDisabled()
    }

    const clickHandler = () => {
        if (!equipmentToUse && availableEquipment.length > 0) {
            equipmentToUse = availableEquipment[0]._id;
        }

        const ings = [];
        const itemSet = new Set();
        itemSet.add(equipmentToUse);

        for (const el in itemList) {
            const items = itemList[el];
            items.forEach(n => {
                const itemId = n.id;
                itemSet.add(itemId);
                ings.push(itemId);
            })
        }

        const payload = [{
            eq: equipmentToUse,
            ings: ings
        }]

        const keychain = window.hive_keychain;
        keychain.requestCustomJson(props.userName, 'dcrops', 'Active', JSON.stringify({
            recipe: props.recipe.title,
            "recipeIndex": 0,
            "operation": props.opType,
            payload: payload,
            "noToCraft": "1"
        }), 'Cook Craft items!', (response) => {
            if (response.success === true) {
                props.itemsUsed(itemSet)
            }
        })
    }

    const availableEquipmentBlueprint = props.allData.filter(el => {
        return el.properties.name === props.recipe.equipment
    });


    const availableEquipment = availableEquipmentBlueprint.filter(el => {
        const nft = JSON.parse(el.properties.nft);
        const secondary = JSON.parse(el.properties.secondary);
        let eqpAvailable = false;

        if (nft.lt && secondary.p[0] === '') {
            eqpType = nft.lt;
            eqpAvailable = true;
        }
        return eqpAvailable;
    });

    const checkDisabled = () => {
        const itemArray = [];

        for (const el in itemList) {
            itemArray.push(itemList[el]);
        }

        const checkState = itemArray.every(el => el.length > 0);

        if (checkState) {
            setDisabledButton(false);
        } else {
            setDisabledButton(true);
        }

        if (availableEquipment.length === 0) {
            setDisabledButton(true);
            return;
        }

        itemArray.push(availableEquipment[0]);
    };


    const eqpHandler = (e) => {
        equipmentToUse = e.target.value
    }

    return (
        <div className="flex ba br3 ma2">
            <h4 className="ma2 w-10 mt5">{props.recipe.title}</h4>
            {Object.keys(props.recipe.ingredients).map(el => <Ingredients
                addItems={addItems}
                keyPair={el}
                key={el}
                valuePair={props.recipe.ingredients[el]}
                inventory={props.inventory}
            />)}

            <div className="equipment-wrap">
                <p>{props.recipe.equipment}</p>
                <select onChange={eqpHandler} name="equipment" className="equipment">
                    {availableEquipment.map((el, i) => <option
                        key={i}
                        value={el._id}
                        className="ba br3"
                    >{eqpType}</option>)}
                </select>
            </div>

            <input
                onClick={clickHandler}
                className={`br3 w-20 craft-cook-button ${disabledButton ? 'bg-light-red' : 'bg-light-green pointer'}`}
                type="submit"
                value={"Make " + props.recipe.title}
                disabled={disabledButton}
            />
        </div>
    )
}

export default CraftCookCards;