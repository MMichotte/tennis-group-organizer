import './App.scss';
import 'bulma/css/bulma.min.css';

import React, { useState } from 'react';

import DatePicker, { Calendar } from "react-multi-date-picker";
import DatePanel from "react-multi-date-picker/plugins/date_panel";
import "react-multi-date-picker/styles/colors/red.css";
import arrayShuffle from 'array-shuffle';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const XLSX = require("xlsx");


function App() {

  const [dates, setDates] = useState([]);
  const [isValidToGenerate, setIsValidToGenerate] = useState(false);
  const [isValidToExport, setIsValidToExport] = useState(false);
  const [gameDates, setGameDates] = useState([]);
  const [players, setPlayers] = useState([
    {
      name: '',
      excludeDates: [],
      playCount: null
    },
  ]);
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

  const onChangePlayer = (player, idx) => {
    const oldPlayers = [...players]
    oldPlayers.splice(idx, 1);
    const existingPlayer = oldPlayers.find(p => p.name === player.name);
    if (existingPlayer) {
      toast.error('Player names must be unique.', {autoClose:5000});
      setIsValidToGenerate(false);
      return;
    }
    setIsValidToGenerate(true);
    clearPlanningTable();
  }

  const onRemovePlayer = (idx) => {
    const newPlayers = [...players]
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
    setIsValidToExport(false);
    setGameDates(newGameDates);
  }

  const onInputKeyPress = (event) => {
    if (event.key === 'Enter') {
      onAddPlayer();
    }
  }

  const onGeneratePlanning = () => {
    setIsValidToExport(false);

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
      gd.players = players.map(player => {
        return {
          name: player.name,
          isPlaying: false
        }
      });

      const shuffledPlayers = arrayShuffle(currentPlayers);
      shuffledPlayers.sort((a, b) => { return a.playCount - b.playCount });

      let idx = 0;
      let playingAtDate = gd.players.filter(p => p.isPlaying).length;

      while (playingAtDate !== 4) {

        if (idx >= shuffledPlayers.length) {
          warnings.push(`Not enough available players for the ${gd.date}!`);
          break;
        }

        const excludedDates = shuffledPlayers[idx].excludeDates.map(d => {
          return (new Date(d)).toISOString().split('T')[0];
        });
        if (!excludedDates.includes(gd.date)) {
          const currentPlayerName = shuffledPlayers[idx].name;
          gd.players.forEach( player => {
            if (player.name === currentPlayerName) {
              player.isPlaying = true;
            }
          });

          gd.players.push();
          shuffledPlayers[idx].playCount += 1;
        }
        idx += 1;
        playingAtDate = gd.players.filter(p => p.isPlaying).length;


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

      toast.warn(warnMessage, {autoClose:10000});
    }
    setPlayers(currentPlayers);
    setGameDates(currentGameDates);
    setIsValidToExport(true);

  }

  const exportToExcel = () => {
    const table_elt = document.getElementById("planning_table");
    const workbook = XLSX.utils.table_to_book(table_elt);
    const ws = workbook.Sheets["Planning"];
    XLSX.utils.sheet_add_aoa(ws, [[]], {origin:-1});
    XLSX.writeFile(workbook, "Tennis_Planning.xlsx");
  }

  return (
    <>
      <ToastContainer
        position="top-right"
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
                  <input className='input player-name' type="text" name='Name' placeholder="Player's name"
                    autoFocus={true}
                    value={player.name}
                    onChange={(e) => {
                      player.name = e.target.value;
                      onChangePlayer(player, idx)
                    }}
                    onKeyPress={onInputKeyPress}
                  />
                  <DatePicker
                    className="red"
                    multiple
                    sort={true}
                    value={player.excludeDates}
                    onChange={(dates) => {
                      player.excludeDates = dates;
                      onChangePlayer(player, idx);
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
          <button className='button is-success' onClick={onGeneratePlanning} disabled={!isValidToGenerate}>Generate Planning</button>
          <button className='button is-info' onClick={exportToExcel} disabled={!isValidToExport}>Export to Excel</button>
        </div>

        <div className="result">
          <div className='result-container planning'>
            <div className='form-title'>Planning :</div>
            <table className='table is-striped is-fullwidth' id='planning_table'>
              <thead>
                <tr>
                  <th style={{ width: '8rem' }}>Date</th>
                  {
                    players.map((player, idx) => {
                      return (
                        <th key={idx}>
                          {
                            player.name !== '' ?
                            <>{player.name} ({player.playCount})</>:
                            <></>
                          }
                        </th>
                      )
                    })
                  }
                </tr>
              </thead>
              <tbody>
                {gameDates.map((date, idx) => {
                  return (
                    <tr key={idx}>
                      <td style={{ width: '8rem' }}>{date.date}</td>
                      {
                        date.players?.map((player, pidx) => {
                          return (
                            player.isPlaying ? 
                              <td key={pidx}>✅</td> : <td key={pidx}>❌</td>
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
