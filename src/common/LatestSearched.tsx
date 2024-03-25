import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux';
import styled from 'styled-components'
import { matchActions } from '../store/matchSlice';
import { fetchUserId } from '../apis/getOuid';
import { useNavigate } from 'react-router-dom';
import { userActions } from '../store/userSlice';

const LatestSearched = ({nowIdx} : {nowIdx:number}) => {
    const dispatch = useDispatch();
    const nav = useNavigate();
    const getLatestUsers = () => JSON.parse(localStorage.getItem('searched') || '[]');
    const [latestUser, setLatestUser] = useState(getLatestUsers());

    useEffect(() => {
        setLatestUser(getLatestUsers());
    }, []);

    const handleClickUser = async (nickname:string) => {
        dispatch(matchActions.initState());
        const ouid = await fetchUserId(nickname)
        dispatch(userActions.setOuid(ouid));
        const updatedData = latestUser.filter((data:string) => data !== nickname);
        updatedData.unshift(nickname);
        if (updatedData.length > 5) {
          updatedData.pop();
        }
        localStorage.setItem('searched', JSON.stringify(updatedData));
        nav(`/search?nickname=${nickname}`);
    }

    const deleteItem = (e:React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation()
        const now = e.currentTarget.value
        const latest = latestUser.filter((nickname:string) => nickname !== now)
        localStorage.setItem('searched',JSON.stringify(latest))
        setLatestUser(latest)
    }

  return (
    <LatestContainer>
        <SectionTitle>최근 검색</SectionTitle>
        {latestUser.length > 0 ?
            latestUser.map((nickname:string,idx:number) => 
                <LatestItem key={idx} className={nowIdx === idx ? 'selected' : ''} onMouseDown={() => handleClickUser(nickname)}>
                    <p>{nickname}</p>
                    <DeleteBtn value={nickname} onMouseDown={(e) => deleteItem(e)}>❌</DeleteBtn>
                </LatestItem>
            ) : <Wrapper><h3>최근에 본 구단주가 없습니다.</h3></Wrapper>
        }
    </LatestContainer>
  )
}

const LatestContainer = styled.div`
    position: absolute;
    top: 80px;
    left: 10px;
    border-radius: 20px;
    width : 470px;
    height : 400px;
    border : 1px solid black;
    background-color: #fff;
    h3 {
        padding : 0 20px;
    }
`

const SectionTitle = styled.div`
  width: 90%;
  padding: 15px 4px 8px 4px;
  margin: 6px auto;
  margin-bottom: 0;
  font-size: 14px;
  font-weight: 700;
  color: #53585d;
  border-bottom: 1px solid #e7e7e7;
`;

const LatestItem = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;
    cursor: pointer;
    p {
        font-size: 20px;
    }
    &.selected, &:hover {
        background-color: rgba(128, 128, 128, 0.1);
    }
`
const Wrapper = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
`

const DeleteBtn = styled.button`
    cursor: pointer;
    border: none;
    background: none;
`

export default LatestSearched