import React, { useRef } from 'react';
import styles from './myInput.module.css';

interface MyInputProps
  extends React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> {}

export const MyInput = ({ ...props }: MyInputProps) => {
  const prevPlaceholdre = useRef('');
  return (
    <input
      onClick={(e) => {
        prevPlaceholdre.current = e.currentTarget.placeholder;
        e.currentTarget.placeholder = '...';
      }}
      onBlur={(e) => {
        e.currentTarget.placeholder = prevPlaceholdre.current;
      }}
      className={[styles.myInput, props.className].join(' ')}
      {...props}
    />
  );
};
