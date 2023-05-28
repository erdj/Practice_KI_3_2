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
  const [remadeGH, setRemadeGH] = useState<ReturnType<typeof ghCash>>({});
  const [isUserChosed, setIsUserChosed] = useState(false);
  const [choosedUserGames, setChoosedUserGames] = useState<
    {
      you: string;
      oponent: string;
      winner: string;
    }[]
  >();
  useEffect(() => {
    console.log(gh);
    const newGh = ghCash();
    console.log(newGh);

    setRemadeGH((prev) => newGh);
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

  if (isUserChosed) {
    return (
      <GameContainer className={styles.gamesHistory}>
        <div className={styles.main}>
          <p
            onClick={() => {
              setIsUserChosed(false);
            }}
          >
            BACK
          </p>
          <div className={styles.list}>
            <div className={styles.gameList}>
              {choosedUserGames?.map((g, i) => {
                return (
                  <div key={i} className={styles.gameListItem}>
                    <p>oponent turn: {g.oponent}</p>
                    <p>your turn: {g.you}</p>
                    <p>winner: {g.winner}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </GameContainer>
    );
  }

  return (
    <GameContainer className={styles.gamesHistory}>
      <div className={styles.main}>
        <p onClick={() => closeHandler(false)}>CLOSE</p>
        <p onClick={(e) => randomUser(e)}>CHOOSE RANDOM GAME</p>
        <div className={styles.list}>
          <h2>Choose User</h2>
          {/* List */}
          <div className={styles.userList}>
            {makeArrFromObjKeys(remadeGH).map((user, i) => {
              return (
                <p
                  key={i}
                  onClick={(e) => {
                    userIdClickHandler(e, remadeGH[e.currentTarget.textContent!]);
                    // console.log(e.currentTarget.textContent);
                  }}
                >
                  {user}
                </p>
              );
            })}
          </div>
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
      } else {
        if (!result[g.creatorId]) {
          result[g.creatorId] = [
            {
              oponent: g.result.creator,
              winner:
                g.result.winner === userState.currentUser!._id
                  ? userState.currentUser!.name
                  : g.creatorId,
              you: g.result.guest,
            },
          ];
        } else {
          result[g.creatorId].push({
            oponent: g.result.creator,
            winner:
              g.result.winner === userState.currentUser!._id
                ? userState.currentUser!.name
                : g.creatorId,
            you: g.result.guest,
          });
        }
      }
    });

    return result;
  }

  function makeArrFromObjKeys(obj: ReturnType<typeof ghCash>) {
    const returnArr = [];
    for (const key in obj) {
      returnArr.push(key);
    }
    return returnArr;
  }

  function userIdClickHandler(
    e: React.MouseEvent<HTMLParagraphElement, MouseEvent>,
    gamesArr: {
      you: string;
      oponent: string;
      winner: string;
    }[],
  ) {
    setChoosedUserGames(gamesArr);
    setIsUserChosed(true);
  }
  function randomUser(e: React.MouseEvent<HTMLParagraphElement, MouseEvent>) {
    const oponents = makeArrFromObjKeys(remadeGH);
    const randomIndex = Math.floor(Math.random() * oponents.length);
    console.log(randomIndex);

    userIdClickHandler(e, remadeGH[oponents[randomIndex]]);
  }
};
