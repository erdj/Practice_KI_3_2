import React from 'react';
import styles from './myBtn.module.css';

interface MyBtnProps
  extends React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > {}

export const MyBtn = ({ children, ...props }: MyBtnProps) => {
  return (
    <button {...props} className={[styles.myBtn, props.className].join(' ')}>
      {children}
    </button>
  );
};
