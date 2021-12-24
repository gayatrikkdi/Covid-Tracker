import React from "react";

//Date Picker Component
const DatePicker = (props) => {
  return (
    <div>
      <input type="date" value={props.value} onChange={props.onChange} />
    </div>
  );
};

export default DatePicker;
