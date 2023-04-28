import { HTTPServerUrl } from 'APIconfig';
import axios from 'axios';
import { MyBtn } from 'components/Custom';
import { OponentReadyState } from 'components/Game';
import { selectRoomState } from 'features/room/room-selectors';
import { selectUserState } from 'features/user/user-selectors';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { User } from 'types';
import styles from './Duel.module.css';

interface DuelProps {
  socket: React.MutableRefObject<WebSocket | null>;
  oponentReadyState: OponentReadyState;
  setOpReadyState: React.Dispatch<React.SetStateAction<OponentReadyState>>;
  setWinner: React.Dispatch<
    React.SetStateAction<{
      winner?: string | undefined;
    } | null>
  >;
  winner: string | undefined;
}

export const Duel = ({
  socket,
  oponentReadyState,
  setOpReadyState,
  setWinner,
  winner,
}: DuelProps) => {
  const roomState = useSelector(selectRoomState);
  const userState = useSelector(selectUserState);
  const [oponent, setOponent] = useState<User | null>(null);
  const [userReadyState, setUserReadyState] = useState<OponentReadyState>('not ready');

  function deleteRoomHandler(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    const data = {
      event: 'deleteRoom',
      payload: { user: userState.currentUser, room: roomState.room },
    };
    socket.current?.send(JSON.stringify(data));
  }
  function leaveRoomHandler(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    const data = {
      event: 'leaveRoom',
      payload: { user: userState.currentUser, room: roomState.room },
    };
    socket.current?.send(JSON.stringify(data));
  }

  useEffect(() => {
    setUserReadyState('not ready');
    setOpReadyState('not ready');
    setWinner({ winner: undefined });
  }, []);

  useEffect(() => {
    if (
      oponentReadyState === 'ready' &&
      userReadyState === 'ready' &&
      userState.currentUser?._id === roomState.room?.creatorId
    ) {
      console.log('create game');
      socket.current?.send(
        JSON.stringify({
          event: 'createGame',
          payload: {
            room: roomState.room,
          },
        }),
      );
    }
  }, [oponentReadyState, userReadyState]);

  return (
    <div className={styles.duel}>
      <div>
        <p>{userState.currentUser?.name}</p>
        <p>{oponent?.name}</p>
      </div>
      <MyBtn
        onClick={(e) => {
          setUserReadyState('ready');
          const data = {
            event: 'setReadyState',
            payload: { user: userState.currentUser, room: roomState.room },
          };
          socket.current?.send(JSON.stringify(data));
        }}
      >
        ready
      </MyBtn>
      {userState.currentUser?._id === roomState.room?.creatorId ? (
        <MyBtn onClick={deleteRoomHandler}>Delete room</MyBtn>
      ) : (
        <MyBtn onClick={leaveRoomHandler}>Leave room</MyBtn>
      )}
      {oponentReadyState === 'ready' && userReadyState === 'ready' && 'LETS GO'}
    </div>
  );
};
