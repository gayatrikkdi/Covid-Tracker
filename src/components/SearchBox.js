import React from "react";
import "../styles/CovidStyles.css";

//Search box Component
const SearchBox = (props) => {
  return (
    <div>
      <input
        type="text"
        value={props.value}
        onChange={props.onChange}
        placeholder={props.placeholder}
      />
    </div>
  );
};
export default SearchBox;
