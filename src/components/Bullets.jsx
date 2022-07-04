import React from 'react'
//Renderiza os player
const Bullets = ({playerList}) => {
  const style_bullet = (left, top, backgroundColor) => {
    return ({
      position: "absolute",
      top: top,
      left: left,
      width: "15px",
      height: "15px",
      backgroundColor: backgroundColor,
      borderRadius: "50%"
  })}

  return (
    <>
      {playerList != undefined && playerList.map((player, index) => { 
        return (
          <div key={index} style={style_bullet(player.coordX, player.coordY, player.color)}></div>
      )})}
    </>
  )
}

export default Bullets