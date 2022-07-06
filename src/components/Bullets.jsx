import React from 'react';

const Bullets = ({ playerList }) => {
  const style_bullet = (left, top, backgroundColor) => {
    return {
      position: 'absolute',
      top: `${top}%`,
      left: `${left}%`,
      width: 'min(min(3.5vw, 3.5vh), 17px)',
      height: 'min(min(3.5vw, 3.5vh), 17px)',
      backgroundColor: backgroundColor,
      borderRadius: '50%',
    }
  };

  return (
    <>
      {playerList != undefined &&
        playerList.map((player, index) => {
          return (
            <div
              key={index}
              style={style_bullet(player.coordX, player.coordY, player.color)}
            ></div>
          );
        })}
    </>
  );
};

export default Bullets;
