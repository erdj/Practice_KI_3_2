import { MyBtn, MyInput } from 'components/Custom';
import { GameContainer } from 'components/GameContainer';
import { selectUserState } from 'features/user/user-selectors';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import styles from './CreateRoom.module.css';

interface CreateRoomProps {
  closeHandler: (value: React.SetStateAction<boolean>) => void;
  socket: React.MutableRefObject<WebSocket | null>;
}

export const CreateRoom = ({ closeHandler, socket }: CreateRoomProps) => {
  const userState = useSelector(selectUserState);

  const [room, setRoom] = useState({ name: '', password: '' });

  return (
    <GameContainer className={styles.createRoom}>
      <p onClick={() => closeHandler(false)}>CLOSE</p>
      <form action="">
        <MyInput
          onChange={(e) => {
            setRoom((prev) => ({ ...prev, name: e.target.value }));
          }}
          placeholder="*room name..."
        />
        <MyInput
          onChange={(e) => {
            setRoom((prev) => ({ ...prev, password: e.target.value }));
          }}
          placeholder="password"
        />
        <MyBtn onClick={createRoom}>Create Room</MyBtn>
      </form>
    </GameContainer>
  );

  function createRoom(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    e.preventDefault();
    if (socket.current) {
      socket.current.send(
        JSON.stringify({ event: 'createRoom', payload: { room, user: userState.currentUser } }),
      );
      closeHandler(true);
    }
  }
};
