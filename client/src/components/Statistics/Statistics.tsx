import { GameContainer } from 'components/GameContainer';
import { selectUsersState } from 'features/users/users-selectors';
import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import styles from './Statistics.module.css';
import { selectUserState } from 'features/user/user-selectors';

interface StatisticsProps {
  closeHandler: (value: React.SetStateAction<boolean>) => void;
  showRooms: (value: React.SetStateAction<boolean>) => void;
  showHistory: (value: React.SetStateAction<boolean>) => void;
  socket: React.MutableRefObject<WebSocket | null>;
  statistics: {
    wins: number;
    looses: number;
    bestPlayer: { name: string; wins: number; looses: number };
    worstPlayer: { name: string; wins: number; looses: number };
  };
}

export const Statistics = ({
  closeHandler,
  showRooms,
  showHistory,
  socket,
  statistics,
}: StatisticsProps) => {
  const usersState = useSelector(selectUsersState);
  const userState = useSelector(selectUserState);
  useEffect(() => {
    socket.current?.send(
      JSON.stringify({
        event: 'getStatistics',
        payload: { userId: userState.currentUser?._id },
      }),
    );
  }, []);

  return (
    <GameContainer className={styles.statistics}>
      <p onClick={() => closeHandler(false)}>CLOSE</p>
      <div>
        <div>wins: {statistics.wins}</div>
        <div>losses: {statistics.looses}</div>
        <div>
          bestPlayer: {statistics.bestPlayer.name}, wins: {statistics.bestPlayer.wins}, looses:{' '}
          {statistics.bestPlayer.looses}
        </div>
        <div>
          worstPlayaer: {statistics.worstPlayer.name}, wins: {statistics.worstPlayer.wins}, looses:{' '}
          {statistics.worstPlayer.looses}
        </div>
        <p
          onClick={() => {
            closeHandler(false);
            showHistory(true);
          }}
        >
          Games History
        </p>

        {/* доступні ігри */}
        <p
          onClick={() => {
            closeHandler(false);
            showRooms(true);
          }}
        >
          Available Rooms
        </p>
      </div>
    </GameContainer>
  );
};
