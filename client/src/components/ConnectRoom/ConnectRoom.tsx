import { GameContainer } from 'components/GameContainer';
import { setRoom } from 'features/room/room-slice';
import { selectRoomsState } from 'features/rooms/rooms-selectors';
import { selectUserState } from 'features/user/user-selectors';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useAppDispatch } from 'store';
import { RoomT } from 'types';
import styles from './ConnectRoom.module.css';

interface ConnectRoomProps {
  closeHandler: (value: React.SetStateAction<boolean>) => void;
  socket: React.MutableRefObject<WebSocket | null>;
}

export const ConnectRoom = ({ closeHandler, socket }: ConnectRoomProps) => {
  const roomsState = useSelector(selectRoomsState);
  const userState = useSelector(selectUserState);

  return (
    <GameContainer className={styles.connectRoom}>
      <p onClick={() => closeHandler(false)}>CLOSE</p>

      <div className={styles.list}>
        {roomsState.rooms?.map((i) => (
          <p key={i._id} onClick={(e) => connectRoom(i)}>
            {i.name}
          </p>
        ))}
      </div>
    </GameContainer>
  );

  function connectRoom(room: RoomT) {
    if (socket.current)
      socket.current.send(
        JSON.stringify({ event: 'connectRoom', payload: { room, user: userState.currentUser } }),
      );
  }
};
