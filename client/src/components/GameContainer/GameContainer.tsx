import React from 'react';
import styles from './GameContainer.module.css';

interface GameContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const GameContainer = ({ children, className }: GameContainerProps) => {
  return <div className={[styles.gameContainer, className].join(' ')}>{children}</div>;
};
