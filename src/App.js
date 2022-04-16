import './App.scss';
import 'bulma/css/bulma.min.css';

import React, { useState, useRef } from 'react';

import DatePicker, { Calendar } from "react-multi-date-picker";
import DatePanel from "react-multi-date-picker/plugins/date_panel";
import "react-multi-date-picker/styles/colors/red.css";
import ReactHTMLTableToExcel from "react-html-table-to-excel";
import arrayShuffle from 'array-shuffle';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {

  const [dates, setDates] = useState([]);
  const [gameDates, setGameDates] = useState([]);
  const [players, setPlayers] = useState([
    {
      name: '',
      excludeDates: [],
      playCount: null
    },
  ]);
  const [validData, setValidData] = useState(false);
  let warnings = [];

  const onSetDates = (dates) => {
    setGameDates(dates.map(date => {
      return {
        date: (new Date(date)).toISOString().split('T')[0],
        players: []
      }
    }));
    setDates(dates);
  }

  const onPlayerChange = (player, idx) => {
    const newPlayers = [...players];
    newPlayers[idx] = player;
    setPlayers(newPlayers);
    clearPlanningTable();
  }

  const onAddPlayer = () => {
    const newPlayers = [...players];
    newPlayers.push(
      {
        name: '',
        excludeDates: [],
        playCount: null
      }
    );
    setPlayers(newPlayers)
    clearPlanningTable();
  }

  const onRemovePlayer = (idx) => {
    const newPlayers = [...players];
    newPlayers.splice(idx, 1);
    if (newPlayers.length === 0) {
      setPlayers([{
        name: '',
        excludeDates: [],
        playCount: null
      }]);
      return;
    }
    setPlayers(newPlayers);
    clearPlanningTable();
  }

  const clearPlanningTable = () => {
    const newGameDates = [...gameDates];
    newGameDates.forEach(gd => {
      gd.players = [];
    });
    setValidData(false);
    setGameDates(newGameDates);
  }

  const onGeneratePlanning = () => {
    setValidData(false);

    if (gameDates.length === 0 || players.length === 0) return;
    const currentPlayers = [];
    for (const player of players) {
      if (player.name && player.name !== '') {
        currentPlayers.push(player);
      }
    }
    if (currentPlayers.length === 0) return;

    const currentGameDates = [...gameDates];
    warnings = [];

    currentPlayers.forEach(player => {
      player.playCount = 0;
    });
    for (const gd of currentGameDates) {
      gd.players = [];
      const shuffledPlayers = arrayShuffle(currentPlayers);
      shuffledPlayers.sort((a, b) => { return a.playCount - b.playCount });
      let idx = 0;
      while (gd.players.length !== 4) {

        if (idx >= shuffledPlayers.length) {
          warnings.push(`Not enough available players for the ${gd.date}!`);
          break;
        }

        const excludedDates = shuffledPlayers[idx].excludeDates.map(d => {
          return (new Date(d)).toISOString().split('T')[0];
        });
        if (!excludedDates.includes(gd.date)) {
          gd.players.push(shuffledPlayers[idx].name);
          shuffledPlayers[idx].playCount += 1;
        }
        idx += 1;


      }

    };

    if (warnings.length !== 0) {
      const warnMessage = <div>
        {
          warnings.map((warn, idx) => {
            return (
              <>
                {warn}
                <br />
              </>
            )
          })
        }
      </div>

      toast.warn(warnMessage);
    }

    setPlayers(currentPlayers);
    setGameDates(currentGameDates);
    setValidData(true);

  }

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={10000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      <div className="header">
        <span>Tennis Group Organizer</span>
      </div>

      <div className='main-content'>

        <div className='settings'>
          <div className="form-container date-picker">
            <div className='form-title'>Play dates :</div>
            <Calendar
              multiple
              sort={true}
              value={dates}
              onChange={(dates) => onSetDates(dates)}
              plugins={[
                <DatePanel />
              ]}
            />
          </div>

          <div className="form-container players">
            <div className='form-title'>Players :</div>
            {players.map((player, idx) => {
              return (
                <div className='player-from' key={idx}>
                  <input className='input player-name' type="text" name='Name' placeholder="Player's name" autoFocus={true}
                    value={player.name}
                    onChange={(e) => {
                      player.name = e.target.value;
                      onPlayerChange(player, idx)
                    }}
                  />
                  <DatePicker
                    className="red"
                    multiple
                    sort={true}
                    value={player.excludeDates}
                    onChange={(dates) => {
                      player.excludeDates = dates;
                      onPlayerChange(player, idx);
                    }}
                    placeholder='Exclude dates'
                    plugins={[
                      <DatePanel />
                    ]}
                  />
                  <button className="button is-danger" onClick={() => onRemovePlayer(idx)}>
                    <span>-</span>
                  </button>
                </div>
              )
            })}
            <button className="button is-success" onClick={onAddPlayer}>
              <span>+</span>
            </button>
          </div>
        </div>

        <div className='controls'>
          <button className='button is-success' onClick={onGeneratePlanning}>Generate Planning</button>
          <ReactHTMLTableToExcel
            table="planning_table"
            className="button is-info"
            filename="Tennis_Planning.xlsx"
            sheet="Planning"
            buttonText="Download as xls"
            disabled={!validData}
          />
        </div>

        <div className="result">
          <div className='result-container planning'>
            <div className='form-title'>Planning :</div>
            <table className='table is-striped is-fullwidth' id='planning_table'>
              <thead>
                <tr>
                  <th style={{width: '8rem'}}>Date</th>
                  {
                    players.map((player, idx) => {
                      return (
                        <th key={idx}>{player.name} ({player.playCount})</th>
                      )
                    })
                  }
                </tr>
              </thead>
              <tbody>
                {gameDates.map((date, idx) => {
                  return (
                    <tr key={idx}>
                      <td style={{width: '8rem'}}>{date.date}</td>
                      {
                        players.map((player, pidx) => {
                          return (
                            date.players.includes(players[pidx]?.name) ?
                            <td>✅</td> : <td>❌</td>
                          )
                        })
                      }
                    </tr>
                  )
                })
                }
              </tbody>
            </table>

          </div>
        </div>

      </div>
    </>
  );
}

export default App;
