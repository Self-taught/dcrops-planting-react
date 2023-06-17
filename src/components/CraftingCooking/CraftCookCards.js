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
        console.log(itemList)
        console.log(availableEquipment)
        if (!equipmentToUse && availableEquipment.length > 0) {
            equipmentToUse = availableEquipment[0]._id;
            console.log(equipmentToUse)
        } else {
            console.log(equipmentToUse)
        };

        const ings = [];
        const itemSet = new Set();
        itemSet.add(equipmentToUse);

        for (const el in itemList) {
            const items = itemList[el];
            items.forEach(n => {
                const itemType = n.type || 'crop';
                const itemId = n.id;
                itemSet.add(itemId);
                ings.push(`${itemType.toLowerCase()},${itemId}`);
            })
        }

        const payload = [{
            eq: equipmentToUse,
            ings: ings
        }]

        console.log(payload);

        // ACCOUNT
        // @looftee
        // KEY
        // Active
        // ID
        // dcrops
        // DATA(CLICK TO SHOW)
        // {
        //     "recipe": "Oil",
        //         "recipeIndex": 0,
        //             "operation": "itemCraft",
        //                 "payload": [
        //                     {
        //                         "eq": 250476,
        //                         "ings": [
        //                             "crop,70aac5e1-ede9-4476-ac76-7385df5d26cd"
        //                         ]
        //                     }
        //                 ],
        //                     "noToCraft": "1"
        // }

        // @looftee
        // KEY
        // Active
        // ID
        // dcrops
        // DATA(CLICK TO SHOW)
        // {
        //     "recipe": "Oil",
        //         "recipeIndex": 0,
        //             "operation": "itemCraft",
        //                 "payload": [
        //                     {
        //                         "eq": 250476,
        //                         "ings": [
        //                             "crop,70aac5e1-ede9-4476-ac76-7385df5d26cd"
        //                         ]
        //                     }
        //                 ],
        //                     "noToCraft": "1"
        // }

        // {
        //     "recipe": "Cabbage Pickle",
        //     "recipeIndex": 0,
        //     "operation": "itemCraft",
        //     "payload": [
        //        {
        //           "eq": 248111,
        //           "ings": [
        //              "crop,1c990802-6ae4-45fb-a3c7-fcc2b540428d",
        //              "crop,1d83389c-c514-4d29-8982-7aa332de13db",
        //              "craft,c2a17f86-f12e-4ec7-aeb1-6e8f081ce21d",
        //              "crop,30d9ffda-405a-488c-94bf-cd3b793e6203",
        //              "craft,21ecfd5a-6cc5-44eb-86af-128f7ac9dde7"
        //           ]
        //        }
        //     ],
        //     "noToCraft": "1"
        //  }

        // Cooking Data

        //     "recipe": "Eggplant Burger",
        //         "operation": "initCook",
        //             "payload": [
        //                 {
        //                     "eq": 247844,
        //                     "ings": [
        //                         "crop,4836ec4e-13bf-47cc-ab1c-e92d10b41dbd",
        //                         "crop,d2812671-4a20-458b-9df1-1f50bdf1a700",
        //                         "crop,ad658486-2868-4ec6-8dd3-253c2427dd29",
        //                         "crop,27da01a1-760c-43a5-b77f-bb38ff1cbc96",
        //                         "craft,21ecfd5a-6cc5-44eb-86af-128f7ac9dde7",
        //                         "craft,e5795d93-e325-4fea-a8bc-c1a0802e2d4e"
        //                     ]
        //                 }
        //             ],
        //                 "noToCraft": "1"
        // }

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
                console.log('success')
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