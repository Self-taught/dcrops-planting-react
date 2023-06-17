import { CookingList, CraftList } from "./CraftCookList";
import CraftCookCards from "./CraftCookCards";
import { useState, useEffect } from "react";

const CraftCookCardsList = (props) => {
    const [cookingList, setCookingList] = useState(CookingList);
    const [craftList, setCraftList] = useState(CraftList);
    const [filteredCraftList, setFilteredCraftList] = useState(CraftList);
    const [filteredCookingList, setFilteredCookingList] = useState(CookingList);
    const [itemsAvailable, setItemsAvailable] = useState(props.inventory);
    const [equipmentData, setEquipmentData] = useState(props.allData)

    const changeHandler = (e) => {
        const searchTerm = e.target.value.toLowerCase();
        setFilteredCraftList(
            craftList.filter((el) => el.title.toLowerCase().includes(searchTerm))
        );
        setFilteredCookingList(
            cookingList.filter((el) => el.title.toLowerCase().includes(searchTerm))
        );
    }

    useEffect(() => {
        setFilteredCraftList(craftList);
        setFilteredCookingList(cookingList);
    }, [craftList, cookingList]);

    const itemsUsed = (itemSet) => {
        setItemsAvailable((prevState) => {
            const updatedState = prevState.filter(el => !itemSet.has(el.id));
            return updatedState;
        });

        setEquipmentData((prevState) => {
            const updatedState = prevState.filter(el => !itemSet.has(el._id));
            return updatedState;
        });
    }

    return (
        <div>
            <div className="flex ma3">
                <p className="">Search for a craft/cooking item: </p>
                <input
                    className="w-30 ml2 bg-moon-gray br3"
                    type="text"
                    onChange={changeHandler}
                />
            </div>

            {filteredCraftList.map((el, i) =>
                <CraftCookCards
                    recipe={el}
                    key={i}
                    inventory={itemsAvailable}
                    allData={equipmentData}
                    userName={props.userName}
                    opType={'itemCraft'}
                    itemsUsed={itemsUsed}
                />)}
            {filteredCookingList.map((el, i) =>
                <CraftCookCards
                    recipe={el}
                    key={i}
                    inventory={itemsAvailable}
                    allData={equipmentData}
                    userName={props.userName}
                    opType={'initCook'}
                    itemsUsed={itemsUsed}
                />)}
        </div>
    )
}

export default CraftCookCardsList;