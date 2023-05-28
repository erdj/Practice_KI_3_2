import { MyBtn, MyInput } from 'components/Custom';
import { GameContainer } from 'components/GameContainer';
import { useAppDispatch } from 'store';
import { SigninInfo, SignupInfo, User } from 'types';
import styles from './Auth.module.css';
import { signupUser, signinUser, googleAuth } from '../../features/user/user-slice';
import { useSelector } from 'react-redux';
import { selectUserState } from '../../features/user/user-selectors';
import { useState, useEffect } from 'react';
import { signInWithPopup } from 'firebase/auth';
import { auth, provider, providerF } from '../../firebase';

interface AuthProps {
  setIsConnected: React.Dispatch<React.SetStateAction<boolean>>;
}

export const Auth = ({ setIsConnected }: AuthProps) => {
  const [signin, setSignin] = useState<SigninInfo>({ name: '', password: '' });
  const [signup, setSignup] = useState<SignupInfo>({ name: '', password: '', email: '' });

  const userState = useSelector(selectUserState);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (userState.currentUser) {
      console.log(1);

      setIsConnected(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userState.currentUser]);

  return (
    <GameContainer className={styles.auth}>
      <p>Authorization</p>
      <div className={styles.signin}>
        <form action="">
          <MyInput
            value={signin.name}
            onChange={(e) => {
              setSignin((prev) => ({ ...prev, name: e.target.value }));
            }}
            type="text"
            placeholder="username"
          />
          <MyInput
            value={signin.password}
            onChange={(e) => {
              setSignin((prev) => ({ ...prev, password: e.target.value }));
            }}
            type="password"
            placeholder="password"
          />
          <MyBtn onClick={signinHandler}>Sign in</MyBtn>
        </form>
      </div>
      <p>or</p>
      <div className={styles.google}>
        <form action="">
          <MyBtn onClick={googleHandler}>Sign in With Google</MyBtn>
        </form>
      </div>
      <p>or</p>
      <div className={styles.google}>
        <form action="">
          <MyBtn onClick={faceBookHandler}>Sign in With FaceBook</MyBtn>
        </form>
      </div>
      <p>or</p>
      <div className={styles.signup}>
        <form action="">
          <MyInput
            value={signup.email}
            onChange={(e) => {
              setSignup((prev) => ({ ...prev, email: e.target.value }));
            }}
            type="email"
            placeholder="email"
          />
          <MyInput
            value={signup.name}
            onChange={(e) => {
              setSignup((prev) => ({ ...prev, name: e.target.value }));
            }}
            type="text"
            placeholder="username"
          />
          <MyInput
            value={signup.password}
            onChange={(e) => {
              setSignup((prev) => ({ ...prev, password: e.target.value }));
            }}
            type="password"
            placeholder="password"
          />
          <MyBtn onClick={signupHandler}>Sign up</MyBtn>
        </form>
      </div>
    </GameContainer>
  );

  function signinHandler<HTMLButtonElement>(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    dispatch(signinUser(signin));
  }
  function signupHandler<HTMLButtonElement>(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    dispatch(signupUser(signup));
  }
  async function googleHandler<HTMLButtonElement>(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    signInWithPopup(auth, provider)
      .then((res) => {
        const {
          user: { displayName: name, email },
        } = res;
        dispatch(googleAuth({ name, email }));
      })
      .catch((err) => {
        console.log(err);
      });
  }
  async function faceBookHandler<HTMLButtonElement>(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    console.log(1);
    signInWithPopup(auth, providerF)
      .then((res) => {
        const {
          user: { displayName: name, email },
        } = res;
        dispatch(googleAuth({ name, email }));
      })
      .catch((err) => {
        console.log(err);
      });
  }
};
