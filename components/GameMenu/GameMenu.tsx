import { ConnectRoom } from 'components/ConnectRoom';
import { CreateRoom } from 'components/CreateRoom';
import { MyBtn } from 'components/Custom';
import { GameContainer } from 'components/GameContainer';
import { GamesHistory } from 'components/GamesHistory';
import { Statistics } from 'components/Statistics';
import { useState, useEffect } from 'react';
import styles from './GameMenu.module.css';
import { GH } from 'types/gameHistory';

type GameMenuProps = {
  socket: React.MutableRefObject<WebSocket | null>;
  gh: GH;

  statistics: {
    wins: number;
    looses: number;
    bestPlayer: { name: string; wins: number; looses: number };
    worstPlayer: { name: string; wins: number; looses: number };
  };
};

export const GameMenu = ({ socket, statistics, gh }: GameMenuProps) => {
  const [showStats, setShowStats] = useState<boolean>(false);
  const [showGamesHistory, setShowGameHistory] = useState<boolean>(false);
  const [connectToRoom, setConnectToRoom] = useState<boolean>(false);
  const [createRoom, setCreateRoom] = useState<boolean>(false);

  if (showStats) {
    return (
      <Statistics
        statistics={statistics}
        socket={socket}
        showHistory={setShowGameHistory}
        showRooms={setConnectToRoom}
        closeHandler={setShowStats}
      />
    );
  }
  if (showGamesHistory) {
    return <GamesHistory gh={gh} socket={socket} closeHandler={setShowGameHistory} />;
  }

  // TODO

  if (connectToRoom) {
    return <ConnectRoom socket={socket} closeHandler={setConnectToRoom} />;
  }
  if (createRoom) {
    return <CreateRoom socket={socket} closeHandler={setCreateRoom} />;
  }

  return (
    <GameContainer className={styles.gameMenu}>
      <div className={styles.info}>
        <p
          onClick={() => {
            setShowStats(true);
          }}
        >
          Statistics
        </p>
        <p
          onClick={() => {
            setShowGameHistory(true);
          }}
        >
          Games History
        </p>
      </div>

      <div className={styles.btns}>
        <MyBtn
          onClick={() => {
            setCreateRoom(true);
          }}
        >
          Create Room
        </MyBtn>

        <MyBtn
          onClick={() => {
            setConnectToRoom(true);
          }}
        >
          Connect to Room
        </MyBtn>
      </div>
    </GameContainer>
  );
};
