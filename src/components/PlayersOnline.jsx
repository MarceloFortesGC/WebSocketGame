import React from 'react'
//Lista os nomes dos Players online
function PlayersOnline({playerList}) {
  return (
    <>
      {playerList != undefined &&
        playerList.map((player, index) => {
          return (
            <p key={index} style={{ color: player.color }}>
              {player.nome}
            </p>
          );
        })}
    </>
  );
}

export default PlayersOnline;
