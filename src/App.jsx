import { useEffect, useRef, useState } from 'react';
import { over } from 'stompjs';
import Bullets from './components/Bullets';
import PlayersOnline from './components/PlayersOnline';
import SockJS from 'sockjs-client/dist/sockjs';

function App() {
  let player = {
    nome: crypto.randomUUID,
    coordX: getRndInteger(0, 300),
    coordY: getRndInteger(300, 700),
    color: '#' + randomColor(),
    status: 'JOIN',
  };

  const [playerList, _setPlayerList] = useState([]);
  const playerListRef = useRef(playerList);
  const setPlayerList = (data) => {
    playerListRef.current.push(data);
    _setPlayerList((state) => [...new Set([...state, data])]);
  };

  const removePlayerList = (data) => {
    playerListRef.current.filter((item) => item.nome != data.nome);
    const temp = [...playerList].filter((item) => item.nome != data.nome);
    _setPlayerList(temp);
  };

  const [show, setShow] = useState(true);

  const stompClient = useRef(null);

  useEffect(() => {
    document.addEventListener('keydown', onMove);
    return () => document.removeEventListener('keydown', onMove);
  }, [playerList]);

  const connect = () => {
    let Sock = new SockJS('http://localhost:8080/websocket-app');
    stompClient.current = over(Sock);
    stompClient.current.connect({}, onConnected);
    setShow(false);
  };

  const disconnect = () => {
    stompClient.current.disconnect({}, onDisconnected);
    const temp = [...playerList];
    const offline = { ...temp.pop(), status: 'OFFLINE' };
    removePlayerList(offline);
    stompClient.current.send('/app/move', {}, JSON.stringify(offline));
    setShow(true);
  };

  const onDisconnected = () => {
    const temp = [...playerList];
    const offline = { ...temp.pop(), status: 'OFFLINE' };
    removePlayerList(offline);
    stompClient.current.send('/app/move', {}, JSON.stringify(offline));
    setShow(true);
  };

  const onConnected = () => {
    stompClient.current.subscribe('/topic/move', onShowMove);
    stompClient.current.subscribe('/topic/position.' + player.nome, onShowMove);
    userJoin();
  };

  const sendPosition = (payloadData) => {
    const online = { ...player, status: 'ONLINE' };
    stompClient.current.send(
      '/app/position.' + payloadData.nome,
      {},
      JSON.stringify(online)
    );
  };

  const userJoin = () => {
    stompClient.current.send('/app/move', {}, JSON.stringify(player));
  };

  const onShowMove = (payload) => {
    let payloadData = JSON.parse(payload.body);
    switch (payloadData.status) {
      case 'JOIN':
        payloadData = {
          ...payloadData,
          status: null,
        };
        setPlayerList(payloadData);
        if (payloadData.nome !== String(player.nome)) {
          sendPosition(payloadData);
        }
        break;
      case 'MOVE':
        console.log(playerList);
        break;
      case 'ONLINE':
        payloadData = {
          ...payloadData,
          status: null,
        };
        setPlayerList(payloadData);
        break;
      case 'OFFLINE':
        removePlayerList(payloadData);
        break;
    }
  };

  function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function randomColor() {
    return Math.floor(Math.random() * 16777215).toString(16);
  }

  const STYLE_MAIN = {
    height: 25,
    width: 25,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  };

  const STYLE_PLAYERS_ONLINE = {
    height: '98vh',
    width: '20vw',
    paddingTop: '1rem',
    backgroundColor: '#D4D4D4',
    justifyContent: 'center',
    textAlign: 'center',
  };

  const STYLE_BOARD = {
    height: '100vh',
    width: '80vw',
  };

  const STYLE_HEADER = {
    width: '754px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
  };

  function onMove(e) {
    switch (e.key) {
      case 'ArrowLeft':
        player = {
          ...player,
          coordX: player.coordX - 1,
          status: 'MOVE',
        };
        stompClient.current.send('/app/message', {}, JSON.stringify(player));
        break;
      case 'ArrowUp':
        // setPlayerList(prevState => ({
        //   ...prevState,
        //   coordY: prevState.coordY <= 0 ? 0 : prevState.coordY - 1
        // }))
        player = {
          ...player,
          coordY: player.coordY + 1,
          status: 'MOVE',
        };
        stompClient.current.send('/app/message', {}, JSON.stringify(player));
        break;
      case 'ArrowRight':
        // setPlayerList(prevState => ({
        //   ...prevState,
        //   coordX: prevState.coordX >= 585  ? 585  : prevState.coordX + 1
        // }))
        player = {
          ...player,
          coordX: player.coordX + 1,
          status: 'MOVE',
        };
        stompClient.current.send('/app/message', {}, JSON.stringify(player));
        break;
      case 'ArrowDown':
        // setPlayerList(prevState => ({
        //   ...prevState,
        //   coordY: prevState.coordY >= 585 ? 585 : prevState.coordY + 1
        // }))
        player = {
          ...player,
          coordY: player.coordY - 1,
          status: 'MOVE',
        };
        stompClient.current.send('/app/message', {}, JSON.stringify(player));
        break;
    }
  }

  return (
    <div style={STYLE_MAIN}>
      <div style={STYLE_PLAYERS_ONLINE}>
        <div>
          {show ? (
            <button onClick={() => connect()}>Entrar</button>
          ) : (
            <button onClick={() => disconnect()}>Sair</button>
          )}
          <h4>Online</h4>
          <PlayersOnline playerList={playerList} />
        </div>
      </div>
      <div style={STYLE_BOARD}>
        <Bullets playerList={playerList} />
      </div>
    </div>
  );
}

export default App;
