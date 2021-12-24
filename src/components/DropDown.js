import React from "react";

// Select DropDown Component
const DropDown = (props) => {
  return (
    <div>
      <select
        className={props.className}
        value={props.value}
        onClick={props.onClick}
      >
        return (<option> Sort the options </option>
        <option value="confirmed">confirmed</option>
        <option value="deceased">deceased</option>)
      </select>
    </div>
  );
};

export default DropDown;
