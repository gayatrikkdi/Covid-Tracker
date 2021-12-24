import React, { useEffect, useState } from "react";
import "../styles/CovidStyles.css";
import {NavLink } from "react-router-dom";
import Header from "../components/Header";
import SearchBox from "../components/SearchBox";
import DatePicker from "../components/DatePicker";
import DropDown from "../components/DropDown";
import {oStates} from "../helper";
let covidDataCpy;
let covidDateDtlsCpy;
const CovidData = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [covidData, setCovidData] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [covidDateDtls, setCovidDateDtls] = useState([]);
  const [ascOrDesc, setAscOrDesc] = useState(false);
  const URL = "https://data.covid19india.org/v4/min";

  //Onload Logics
  useEffect(() => {
    //Initially fetch the covid details
    async function loader() {
      const covidData = await fetch(`${URL}/data.min.json`).then((res) =>
        res.json()
      );
      const covidDateDtls = await fetch(`${URL}/timeseries.min.json`).then(
        (res) => res.json()
      );

      if (covidData) {
        setStateValue(covidData, "covidData");
      }

      if (covidDateDtls) {
        setStateValue(covidDateDtls, "covidDate");
      }
      //Set the Load key
      setIsLoading(false);
    }
    loader();
  }, []);

  //Match the state values based on key pair
  const setStateValue = (obj, key) => {
    if (key === "covidData") {
      covidDataCpy = [];
      Object.keys(obj).forEach((key) => {
        if (oStates[key]) {
          obj[key]["state"] = oStates[key];
          covidDataCpy.push(obj[key]);
        }
      });
      setCovidData(covidDataCpy);
    } else {
      covidDateDtlsCpy = [];
      Object.keys(obj).forEach((key) => {
        if (oStates[key]) {
          obj[key]["state"] = oStates[key];
          covidDateDtlsCpy.push(obj[key]);
        }
      });
      setCovidDateDtls(covidDateDtlsCpy);
    }
  };

  // Handles state search
  const handleSubmit = (input) => {
    setUserInput(input);
    //Mention the time for state search
    setTimeout(() => {
      if (userInput && userInput.length > 0) {
        const filteredData = covidDataCpy.filter(function (obj) {
          let searchContent = obj["state"].toLowerCase().replace(/\s/g, "");
          return searchContent.includes(userInput);
        });
        setCovidData(filteredData);
      } else {
        setCovidData(covidDataCpy);
      }
    }, 500);
  };

  //Handles the date filter
  const handleDate = (dateInput) => {
    setTimeout(() => {
      const dateFilter = [];
      if (dateInput && dateInput.length) {
        //Pluck the date based on the matched input
        covidDateDtls.map((key) => {
          if (key.dates[dateInput]) {
            key.dates[dateInput]["date"] = dateInput;
            dateFilter.push(key);
          }
        });
        //both date and state input matches
        if (userInput) {
          const filteredData = dateFilter.filter(function (obj) {
            const searchContent = obj["state"].toLowerCase().replace(/\s/g, "");
            return searchContent.includes(userInput);
          });
          if (filteredData[0] && filteredData[0].dates) {
            const matchedValue = filteredData[0].dates[dateInput];
            matchedValue.state = filteredData[0].state;
            setCovidData([matchedValue]);
          }
        } else {
          //date only changed
          const dateValue = [];
          dateFilter.map((key) => {
            if (key.dates[dateInput]) {
              const matchedValue = key.dates[dateInput];
              matchedValue.state = key.state;
              dateValue.push(matchedValue);
            }
          });
          setCovidData(dateValue);
        }
      }
    }, 500);
  };

  //Sort by Ascending or decending order
  const doSort = (key) => {
    const byKeys = covidData.slice(0);
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
    setCovidData(byKeys);
  };

  //Set District against the state
  const setStateDistrict = (district,index) =>{
    if(district){
      const byStateIndx = covidData.slice(0);
      byStateIndx[index].total=byStateIndx[index].districts[district].total;
      setCovidData(byStateIndx);
    }
  }

  return (
    <div className="covidData">
      <Header />
      {isLoading ? (
        <h1 className="loading">Loading...</h1>
      ) : (
        <div>
          <div class="row covidData__input input">
            <div class="col">
              <SearchBox
                onChange={(e) => {
                  handleSubmit(e.target.value);
                }}
                value={userInput}
                placeholder="Enter State Name"
              />
            </div>
            <div class="col">
              <DatePicker onChange={(eve) => handleDate(eve.target.value)} />
            </div>
            <div class="col">
              <DropDown
                className="drop-down"
                onClick={(eve) => doSort(eve.target.value)}
              />
            </div>
          </div>
          <hr />
          {/* Showing the details of the State */}
          <div className="flex-container">
            {covidData && covidData.length > 0 ? (
              covidData.map((oCvdDtls,indx) => {
                return (
                  oCvdDtls && (
                    <div className="cards">
                      <div class="row">
                        <div class="col">{oCvdDtls.state}</div>
                        {/* Map the district details */}
                        {oCvdDtls.districts &&
                          <div class="col">
                            <select className="district" onClick={(eve)=>setStateDistrict(eve.target.value,indx)}>
                            {Object.keys(oCvdDtls.districts).map((key) => {
                                return <option value={key}>{key}</option>
                            })}
                            </select>
                          </div>
                        }
                      </div>
                      {oCvdDtls && oCvdDtls.total && <p className="total-case">Total</p>}
                      {oCvdDtls &&
                        oCvdDtls.total &&
                        oCvdDtls.total.confirmed && (
                          <p>Confirmed : {oCvdDtls.total.confirmed}</p>
                        )}
                      {oCvdDtls && oCvdDtls.total && oCvdDtls.total.recovered && (
                        <p>
                          Recovered : {oCvdDtls.total.recovered}
                          <NavLink
                            to={{
                              pathname: "/detailed-view",
                              search: `?state=${oCvdDtls.state}`,
                            }}
                            activeClassName="selected"
                          >
                            <i
                              class="fa fa-angle-right fa-lg left-arrow"
                              aria-hidden="true"
                            ></i>
                          </NavLink>
                        </p>
                      )}
                      {oCvdDtls &&
                        oCvdDtls.total &&
                        oCvdDtls.total.deceased && (
                          <p>Deceased : {oCvdDtls.total.deceased}</p>
                        )}
                    </div>
                  )
                );
              })
            ) : (
              <div>No Results Found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CovidData;
