import React from 'react'

const Bullets = ({playerList}) => {
  const style_bullet = (top, left, backgroundColor) => {
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