import { MyBtn } from 'components/Custom';
import { Duel } from 'components/Duel';
import { OponentReadyState } from 'components/Game';
import { selectRoomState } from 'features/room/room-selectors';
import { setRoom } from 'features/room/room-slice';
import { selectUserState } from 'features/user/user-selectors';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useAppDispatch } from 'store';
import { User } from 'types';
import styles from './Room.module.css';

interface RoomProps {
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
// {}: RoomProps

export const Room = ({
  winner,
  socket,
  oponentReadyState,
  setOpReadyState,
  setWinner,
}: RoomProps) => {
  const roomState = useSelector(selectRoomState);
  const userState = useSelector(selectUserState);

  function deleteRoomHandler(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    const data = {
      event: 'deleteRoom',
      payload: { user: userState.currentUser, room: roomState.room },
    };
    socket.current?.send(JSON.stringify(data));
  }

  return roomState.room!.guestId ? (
    <div>
      <Duel
        winner={winner}
        setOpReadyState={setOpReadyState}
        oponentReadyState={oponentReadyState}
        socket={socket}
        setWinner={setWinner}
      />
    </div>
  ) : (
    <div className={styles.room}>
      <p>Waiting for oponent</p>
      <MyBtn onClick={deleteRoomHandler}>Delete room</MyBtn>
    </div>
  );
};
