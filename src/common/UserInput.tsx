import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { IForm } from '../types/form';
import { userActions } from '../store/userSlice';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import SearchIcon from '../assets/SearchIcon';
import { matchActions } from '../store/matchSlice';
import LatestSearched from './LatestSearched';
import useKeyboard from '../hooks/useKeyboard';
import { fetchUserId } from '../apis/getOuid';
import { RootState } from '../store/store';
import { useMutation } from '@tanstack/react-query';

const UserInput = () => {
  const dispatch = useDispatch();
  const { isFocus } = useSelector((state: RootState) => state.matches);
  const { register, handleSubmit, watch, setValue } = useForm<IForm>();
  const nav = useNavigate();
  const user = watch('user');
  const prevSearched: string[] = JSON.parse(localStorage.getItem('searched') || '[]');
  const { keyBoardIdx, onKeydown, initIndex } = useKeyboard(prevSearched);

  const mutation = useMutation({
    mutationKey : ['nickname',user],
    mutationFn : fetchUserId,
    onSuccess : (ouid) => {
      dispatch(userActions.setOuid(ouid));
      dispatch(matchActions.initState());
      dispatch(matchActions.setIsLoadingInit(true));
      nav(`/search?nickname=${user}`);
      setValue('user', '');
      initIndex();
      const updatedData = prevSearched.filter((data: string) => data !== user);
      updatedData.unshift(user);
      if (updatedData.length > 5) {
        updatedData.pop();
      }
      localStorage.setItem('searched', JSON.stringify(updatedData));
    },
    onError : () => {
      dispatch(matchActions.initState());
      nav(`/search?nickname=${user}`);
    }
  })

  const onSubmit = async (data: IForm) => {
    mutation.mutate(data.user)
  };

  useEffect(() => {
    setValue('user', keyBoardIdx !== null ? prevSearched[keyBoardIdx] : '')
  }, [keyBoardIdx]);

  useEffect(() => {
    initIndex();
  }, [initIndex, isFocus]);

  return (
    <SearchContainer>
      <SearchBar onSubmit={handleSubmit(onSubmit)}>
        <input
          {...register('user', { required: true })}
          type='text'
          autoComplete='off'
          placeholder='구단주 명을 입력하시오'
          onFocus={() => dispatch(matchActions.setIsFocus(true))}
          onBlur={() => dispatch(matchActions.setIsFocus(false))}
          onKeyDown={onKeydown}
        />
        <button type='submit'>
          <SearchIcon size={21}/>
        </button>
      </SearchBar>
      {isFocus && <LatestSearched nowIdx={keyBoardIdx!}/>}
    </SearchContainer>
  );
};
const SearchContainer = styled.div`
  position: relative;
`

const SearchBar = styled.form`
  width: 490px;
  height: 75px;
  background-color: #ffffff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 10px 10px 25px;
  border-radius: 50px;
  border: 1px solid black;
  box-sizing: border-box;

  & > svg {
    color: gray;
    flex: none;
  }

  input {
    width: 100%;
    border: none;
    margin-left: 10px;
    font-size: 17px;
    outline: none;
  }
  button {
    color: #ffffff;
    background-color: #007be9;
    border: 0;
    cursor: pointer;
    border-radius: 100%;
    width: 55px;
    height: 48px;
    font-weight: 500;
    display: flex;
    justify-content: center;
    align-items: center;
    box-sizing: border-box;
  }
`;
export default UserInput