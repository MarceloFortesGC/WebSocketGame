import { useEffect, useRef, useState } from 'react';
import { over } from 'stompjs';
import Bullets from './components/Bullets';
import PlayersOnline from './components/PlayersOnline';
import SockJS from 'sockjs-client/dist/sockjs';
import './App.css';

function App() {
  //Parametros para min e max do limite que o player percorre a tela
  //Esta estatico desta forma
  let minX = window.innerWidth * 0.0008;
  let minY = window.innerHeight * 0.0008;

  const [player, setPlayer] = useState({
    nome: crypto.randomUUID(),
    coordX: getRndInteger(2, 95),
    coordY: getRndInteger(2, 95),
    color: '#' + randomColor(),
    status: 'JOIN',
  });
  const [playerList, _setPlayerList] = useState([]);
  const playerListRef = useRef(playerList);

  const setPlayerList = (data) => {
    var existPlayer = playerListRef.current.some((o) => o.nome == data.nome);

    //Se o player já existe ele da um update na lista de players
    if (existPlayer == true) {
      _setPlayerList((current) =>
        current.map((obj) => {
          if (obj.nome == data.nome) {
            return {
              nome: data.nome,
              color: data.color,
              coordX: data.coordX,
              coordY: data.coordY,
              status: data.status,
            };
          } else {
            return obj;
          }
        })
      );
      var objIndex = playerList.findIndex((obj) => obj.nome == data.nome);
      playerList[objIndex].coordX = data.coordX;
      playerList[objIndex].coordY = data.coordY;
      playerList[objIndex].status = data.status;
    } else {
      //Player Novo
      playerListRef.current.push(data);
      _setPlayerList((state) => [...new Set([...state, data])]);
    }
  };

  const removePlayerList = (data) => {
    playerListRef.current.filter((item) => item.nome != data.nome);
    const temp = [...playerList].filter((item) => item.nome != data.nome);
    _setPlayerList(temp);
  };

  const [show, setShow] = useState(true);

  const stompClient = useRef(null);

//Loop que identifica enquanto a tecla estiver pressionada
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
    setPlayer.nome = null;
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

  //Subscribe do player
  const sendPlayerPosition = (playerNome) => {
    stompClient.current.subscribe('/topic/move', onShowMove);
    stompClient.current.subscribe('/topic/position.' + playerNome, onShowMove);
  };

  const userJoin = () => {
    stompClient.current.send('/app/move', {}, JSON.stringify(player));
  };

  //Mostra a movimentação na tela
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
        setPlayerList(payloadData);
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
    height: '100vh',
    width: '100vw',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  };

  const STYLE_PLAYERS_ONLINE = {
    height: '100%',
    width: '20%',
    paddingTop: '1rem',
    backgroundColor: '#D4D4D4',
    justifyContent: 'center',
    textAlign: 'center',
  };

  const STYLE_BOARD = {
    position: 'relative',
    height: 'min(100vw, 100vh)',
    // maxHeight: '100%',
    width: 'min(100vw, 100vh)',
    border: 'solid',
  };

  const STYLE_HEADER = {
    width: '754px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
  };

  //Funcao responsavel pelo calculo movimentacao atraves do reconhecimento da tecla pressionada
  function onMove(e) {
    switch (e.key) {
      case 'ArrowLeft':
        setPlayer({
          nome: player.nome,
          coordX: player.coordX - minX < 0
          ? 100 - ((window.innerHeight*0.012 + window.innerWidth*0.012)*100/window.innerWidth)
          : player.coordX - minX,
          coordY: player.coordY,
          color: player.color,
          status: 'MOVE',
        });
        stompClient.current.send('/topic/move', {}, JSON.stringify(player));
        break;
      case 'ArrowUp':
        setPlayer({
          nome: player.nome,
          coordX: player.coordX,
          coordY:
            player.coordY - minY < 0
              ? 100 - ((window.innerHeight*0.012 + window.innerWidth*0.012)*100/window.innerHeight)
              : player.coordY - minY,
          color: player.color,
          status: 'MOVE',
        });
        stompClient.current.send('/topic/move', {}, JSON.stringify(player));
        break;
      case 'ArrowRight':
        setPlayer({
          nome: player.nome,
          coordX:
            player.coordX + minX > 100 - ((window.innerHeight*0.012 + window.innerWidth*0.012)*100/window.innerWidth)
              ? 0
              : player.coordX + minX,
          coordY: player.coordY,
          color: player.color,
          status: 'MOVE',
        });
        stompClient.current.send('/topic/move', {}, JSON.stringify(player));
        break;
      case 'ArrowDown':
        setPlayer({
          nome: player.nome,
          coordX: player.coordX,
          coordY:
            player.coordY + minY > 100 - ((window.innerHeight*0.0133 + window.innerWidth*0.0133)*100/window.innerHeight)
              ? 0
              : player.coordY + minY,
          color: player.color,
          status: 'MOVE',
        });
        stompClient.current.send('/topic/move', {}, JSON.stringify(player));
        break;
    }
  }

  return (
    <div style={STYLE_MAIN} className="container">
      <div style={STYLE_PLAYERS_ONLINE} className="wrapper players">
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
      <div style={STYLE_BOARD} className="wrapper">
        <Bullets playerList={playerList} />
      </div>
    </div>
  );
}

export default App;