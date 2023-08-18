const Lands = (props) => {
  const landTypes = [
    "Hi-Tec Land",
    "Trinity Land",
    "Fairy Garden",
    "Awesome Land",
    "Fertile Land",
    "Average Farmland",
  ];
  return (
    <div className="mv2">
      <p className="w-100 f4 mv1">Select the type of land: </p>
      {landTypes
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
                  onClick={props.selectLands}
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

      <p>Total Plots Available to plant: {props.plots}</p>
      <input
        onClick={props.plantSeeds}
        className="pa2 w-35 bg-green br3 center pointer ph4 grow"
        type="submit"
        value="Plant"
      />
    </div>
  );
};

export default Lands;
