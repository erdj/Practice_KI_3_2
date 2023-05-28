import styles from './GameDuel.module.css';
import paper from '../../assets/paper.png';
import scissors from '../../assets/scissors.png';
import rock from '../../assets/rock.png';

import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { selectGameState } from 'features/game/game-selectors';
import { selectUserState } from 'features/user/user-selectors';
import { User } from 'types';
import axios from 'axios';
import { HTTPServerUrl } from 'APIconfig';
import { selectRoomState } from 'features/room/room-selectors';
import { MyBtn } from 'components/Custom';
import { useAppDispatch } from 'store';
import { changeGameState } from 'features/game/game-slice';
interface GameDuelProps {
  socket: React.MutableRefObject<WebSocket | null>;
  winner?: string;
}
// {}: GameDuelProps

export const GameDuel = ({ socket, winner }: GameDuelProps) => {
  // const [isTurnChosen, setIsTurnChosen] = useState<boolean>(false);
  const [turn, setTurn] = useState<'rock' | 'scissors' | 'paper' | ''>('');
  const timerId = useRef<any>();
  const [timer, setTimer] = useState<number>(5);

  const gameState = useSelector(selectGameState);
  const userState = useSelector(selectUserState);
  const roomState = useSelector(selectRoomState);

  const [oponent, setOponent] = useState<User | null>();

  const dispatch = useAppDispatch();

  async function loadOponent() {
    const {
      data: { user: op },
    } = await axios.get(
      HTTPServerUrl +
        '/api/users/find/' +
        (roomState.room?.creatorId === userState.currentUser?._id
          ? roomState.room?.guestId!
          : roomState.room?.creatorId!),
    );
    setOponent(op);
  }

  useEffect(() => {
    loadOponent();
  }, []);

  useEffect(() => {
    console.log(winner);

    if (winner) {
      setTimeout(() => {
        if (userState.currentUser?._id === gameState.game?.creatorId) {
          socket.current?.send(
            JSON.stringify({
              event: 'game finished',
              payload: {
                room: roomState.room,
                game: gameState.game,
                user: userState.currentUser,
              },
            }),
          );
        }
      }, 5000);
    }
  }, [winner]);

  useEffect(() => {
    if (timer === 0) {
      console.log(1);
      socket.current?.send(
        JSON.stringify({
          event: 'sendTurn',
          payload: { turn, game: gameState.game, user: userState.currentUser },
        }),
      );
      return () => {
        clearTimeout(timerId.current);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timer, socket]);

  useEffect(() => {
    timerId.current = setInterval(() => {
      setTimer((prev) => {
        if (prev !== 0) {
          return prev - 1;
        }
        return prev;
      });
    }, 1000);
  }, []);

  if (winner) {
    return (
      <div>
        {winner !== 'draw' ? (
          <p>Winner is {winner === oponent?._id ? oponent.name : userState.currentUser?.name}</p>
        ) : (
          <p>Draw</p>
        )}
      </div>
    );
  }

  return (
    <div className={styles.gameDuel}>
      <p>choose your turn {timer}</p>
      <div className={styles.turns}>
        <img
          src={paper}
          alt=""
          onClick={(e) => {
            setTurn('paper');
          }}
        />
        <div className={styles['bottom-triangle']}>
          <img
            src={scissors}
            alt=""
            onClick={(e) => {
              setTurn('scissors');
            }}
          />
          <img
            src={rock}
            alt=""
            onClick={(e) => {
              setTurn('rock');
            }}
          />
        </div>
      </div>
    </div>
  );
};
