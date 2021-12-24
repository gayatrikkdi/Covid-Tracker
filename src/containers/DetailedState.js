import React, { useEffect, useState } from "react";
import "../styles/DetailedStyles.css";
import Header from "../components/Header";
import SearchBox from "../components/SearchBox";
import DatePicker from "../components/DatePicker";
import DropDown from "../components/DropDown";
import { useLocation, useNavigate } from "react-router-dom";
import queryString from "query-string";
import { oStates,paginate} from "../helper";

let detailedStatesCpy;
let selectedStateValues = [];

const DetailedState = () => {

  //Initialize the state values
  const location = useLocation();
  const navigate = useNavigate();
  const [state, setState] = useState(queryString.parse(location.search).state);
  const [isLoading, setIsLoading] = useState(true);
  const [pageResults, setPagination] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [dateInput, setDateInput] = useState("");
  const [ascOrDesc, setAscOrDesc] = useState(false);
  const [pageNo, setPageNumber] = useState(1); 
  const URL = "https://data.covid19india.org/v4/min";

  //Initial Page Load Logics
  useEffect(() => {
    async function initLoad() {
      const covidDateVal = await fetch(`${URL}/timeseries.min.json`).then(
        (res) => res.json()
      );
      //Overall State details
      detailedStatesCpy = [];
      Object.keys(covidDateVal).forEach((key) => {
        if (oStates[key]) {
          covidDateVal[key]["state"] = oStates[key];
          detailedStatesCpy.push(covidDateVal[key]);
        }
      });

      //Selected State details
      const filterStateDtls = detailedStatesCpy.filter(
        (value) => value.state === state
      );
      if (filterStateDtls[0] && filterStateDtls[0].dates) {
        setDateFields(filterStateDtls[0].dates);
      }
      setIsLoading(false);
    }
    initLoad();
  }, []);

  //Set date object
  const setDateFields = (obj) => {
    selectedStateValues = [];
    Object.entries(obj).forEach(([key, value]) => {
      obj[key]["date"] = key;
      selectedStateValues.push(obj[key]);
    });

    //Call the initial pagination setup
    if (selectedStateValues && selectedStateValues.length > 0) {
      //If date input available only load the particular details
      if (dateInput) {
        filterStateDate(selectedStateValues);
      } else {
        //setInitialState(selectedStateValues);
        setPagination(paginate(selectedStateValues, 10, pageNo));
      }
    }
  };

  //Filter only mentioned state date values
  const filterStateDate = (array) => {
    array.filter((key) => {
      if (key.date === dateInput) {
        setPagination([key]);
      }
    });
  };

  // Handles state search
  const handleSubmit = (input) => {
    setUserInput(input);
    //Mention the time for state search
    setTimeout(() => {
      if (userInput && userInput.length > 0) {
        const filteredData = detailedStatesCpy.filter(function (obj) {
          let searchContent = obj["state"].toLowerCase().replace(/\s/g, "");
          return searchContent.includes(userInput);
        });
        if (filteredData[0] && filteredData[0].dates) {
          setState(filteredData[0].state);
          setDateFields(filteredData[0].dates);
        }
      }
    }, 500);
  };

  //Sort by Ascending or decending order
  const doSort = (key) => {
    const byKeys = pageResults.slice(0);
    if (!ascOrDesc) {
      setAscOrDesc(true);
    } else {
      setAscOrDesc(false);
    }
    byKeys.sort((a, b) => {
      switch (ascOrDesc) {
        case true:
          return a.total[key] - b.total[key];
        case false:
          return b.total[key] - a.total[key];
        default:
          break;
      }
    });
    setPagination(byKeys);
  };

  //Handles the date filter
  const handleDate = (dateInput) => {
    setDateInput(dateInput);
    setTimeout(() => {
      if (dateInput && dateInput.length) {
        //Pluck the date based on the matched input
        filterStateDate(selectedStateValues);
      }
    }, 500);
  };

  //Page Previous filter
  const pagePrevAction = () => {
    if (pageNo > 1) {
      setPageNumber(pageNo - 1);
    }
    setPagination(paginate(selectedStateValues, 10, pageNo));
  };

  //Page Next Filter
  const pageNextAction = () => {
    const total = Math.ceil(selectedStateValues.length / 10);
    if (pageNo <= total) {
      setPageNumber(pageNo + 1);
    }
    setPagination(paginate(selectedStateValues, 10, pageNo));
  };

  return (
    <div className="covidData">
      <Header />
      {isLoading ? (
        <h1 className="loading">Loading...</h1>
      ) : (
        <div>
          <div class="row covidData__input input">
            <div class="col-3 state-align">
              <i
                class="fa fa-arrow-left fa-lg back-arrow"
                onClick={() => {
                  navigate("/");
                }}
              ></i>
              <b>{state}</b>
            </div>
            <div class="col">
              <DatePicker
                onChange={(eve) => handleDate(eve.target.value)}
                value={dateInput}
              />
            </div>
            <div class="col">
              <DropDown
                className="drop-down"
                onClick={(eve) => doSort(eve.target.value)}
              />
            </div>
            <div class="col">
              <SearchBox
                onChange={(e) => {
                  handleSubmit(e.target.value);
                }}
                value={userInput}
                placeholder="Enter State Name"
              />
            </div>
          </div>
          <hr></hr>
          <div className="table-list_container">
            <table className="table table-cont">
              <thead className="thead-list">
                <tr>
                  <th>Date</th>
                  <th>Confirmed</th>
                  <th>Recovered</th>
                  <th>Deceased</th>
                  <th>Delta</th>
                  <th>Delta 7</th>
                </tr>
              </thead>
              {pageResults &&
                pageResults.length > 0 &&
                pageResults.map((detailObj) => {
                  return (
                    <tbody className="tbody-list">
                      <tr>
                        <td className="align-center">{detailObj.date}</td>
                        <td className="align-center">
                          {detailObj.total && detailObj.total.confirmed}
                        </td>
                        <td className="align-center">
                          {detailObj.total && detailObj.total.recovered}
                        </td>
                        <td className="align-center">
                          {detailObj.total && detailObj.total.deceased}
                        </td>
                        <td>
                          {detailObj.delta && detailObj.delta.confirmed && (
                            <p>Confirmed-{detailObj.delta.confirmed}</p>
                          )}
                          {detailObj.delta && detailObj.delta.recovered && (
                            <p>Recovered-{detailObj.delta.recovered}</p>
                          )}
                          {detailObj.delta && detailObj.delta.deceased && (
                            <p>Deceased-{detailObj.delta.deceased}</p>
                          )}
                        </td>
                        <td>
                          {detailObj.delta7 && detailObj.delta7.confirmed && (
                            <p>Confirmed-{detailObj.delta7.confirmed}</p>
                          )}
                          {detailObj.delta7 && detailObj.delta7.recovered && (
                            <p>Recovered-{detailObj.delta7.recovered}</p>
                          )}
                          {detailObj.delta7 && detailObj.delta7.deceased && (
                            <p>Deceased-{detailObj.delta7.deceased}</p>
                          )}
                        </td>
                      </tr>
                    </tbody>
                  );
                })}
            </table>
          </div>
          <div class="col-12 ">
            <div class="col-10"></div>
            <div class="col-2 pagination-btn">
              <input
                type="button"
                value="Prev"
                className="prev-btn"
                onClick={() => pagePrevAction()}
              />
              <input
                type="button"
                value="Next"
                className="next-btn"
                onClick={() => pageNextAction()}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default DetailedState;
