import { GameContainer } from 'components/GameContainer';
import { useEffect, useState } from 'react';
import styles from './GamesHistory.module.css';
import { useSelector } from 'react-redux';
import { selectUserState } from 'features/user/user-selectors';
import { GH } from 'types/gameHistory';

interface GamesHistoryProps {
  closeHandler: (value: React.SetStateAction<boolean>) => void;
  socket: React.MutableRefObject<WebSocket | null>;
  gh: GH;
}

export const GamesHistory = ({ closeHandler, socket, gh }: GamesHistoryProps) => {
  // const [remadeGH, setRemadeGH] = useState<ReturnType<typeof ghCash>>([]);
  useEffect(() => {
    console.log(gh);
    ghCash();
  }, [gh]);
  const userState = useSelector(selectUserState);
  useEffect(() => {
    socket.current?.send(
      JSON.stringify({
        event: 'getGameHistory',
        payload: {
          user: userState.currentUser,
        },
      }),
    );
  }, []);

  return (
    <GameContainer className={styles.gamesHistory}>
      <div className={styles.main}>
        <p onClick={() => closeHandler(false)}>CLOSE</p>
        <div className={styles.list}>
          <h2>Choose User</h2>
          {/* List */}
        </div>
      </div>
    </GameContainer>
  );
  function ghCash() {
    const result: { [key: string]: { you: string; oponent: string; winner: string }[] } = {};
    gh.forEach((g) => {
      if (g.creatorId === userState.currentUser?._id) {
        if (!result[g.guestId]) {
          result[g.guestId] = [
            {
              oponent: g.result.guest,
              winner:
                g.result.winner === userState.currentUser._id
                  ? userState.currentUser.name
                  : g.guestId,
              you: g.result.creator,
            },
          ];
        } else {
          result[g.guestId].push({
            oponent: g.result.guest,
            winner:
              g.result.winner === userState.currentUser._id
                ? userState.currentUser.name
                : g.guestId,
            you: g.result.creator,
          });
        }
      }
    });
    return result;
  }
};
