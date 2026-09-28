import css_output from '@src/asstes/main.css';
import css_meme from '@src/asstes/meme/meme.css';
import { pluginInfo } from '@src/package';
import React from 'react';

import { Container, DataBox, HeaderBox, Template } from '../common';

interface IPlayerData {
  avatar: string;
  playerId: string;
  nick: string;
  debris: number,
  isTested: boolean,
  luckColor: string
  luckyStar:string
}

interface IData {
  list: IPlayerData[];
  currentUserId: number;
  currentPage: number;
  sliceNum: number;
  playerSum: number;
}

interface Props {
  data: IData;
  theme?: string;
}

export default function App({ data, theme }: Props) {
  return (
    <Template styleSheet={[css_output, css_meme]} theme={theme}>
      <Container style={{ color: 'white', boxShadow: '0 5px 10px 0 rgb(255 255 255 / 20%)' }}>
        <HeaderBox
          title="运势财富榜"
          description={`Fortune ranking！（仅统计本群内排行）`}
          style={{
            background: 'rgba(0, 0, 0, 0)',
            boxShadow: '0 5px 10px 0 rgb(255 255 255 / 20%)',
          }}
          titleStyle={{ fontFamily: 'NZBZ', fontSize: '40px', fontWeight: 500 }}
        />

        <DataBox style={{ paddingTop: '5px', boxShadow: '1px 1px 3px 1px rgb(245 246 251 / 80%)' }}>
          <div className="list flex-col pl-2.5">
            {data.list.map((l, i: number) => {
              const curUserId = (data.currentPage - 1) * data.sliceNum + i + 1;
              return (
                <div
                  className="lb"
                  key={l.playerId}
                  style={
                    data.currentUserId == i ? { backgroundColor: 'rgba(67, 243, 249, 0.3)' } : {}
                  }
                >
                  {curUserId == 1 && (
                    <img className="medal" src={`${pluginInfo.PUBLIC_PATH}/apps/medal/金牌.png`} />
                  )}
                  {curUserId == 2 && (
                    <img className="medal" src={`${pluginInfo.PUBLIC_PATH}/apps/medal/银牌.png`} />
                  )}
                  {curUserId == 3 && (
                    <img className="medal" src={`${pluginInfo.PUBLIC_PATH}/apps/medal/铜牌.png`} />
                  )}

                  {curUserId > 3 ? `${curUserId}.${l.nick}` : l.nick}
                  <img
                    className="ml-1"
                    src={l.avatar ? l.avatar : `https://q1.qlogo.cn/g?b=qq&s=0&nk=${l.playerId}`}
                  />
                  {l.isTested && <span className="text-2xl" style={{ color: l.luckColor }}>
                    {l.luckyStar}
                  </span>}
                  <span className="favor ml-auto">碎片：{l.debris}</span>
                </div>
              );
            })}
          </div>
        </DataBox>
      </Container>
    </Template>
  );
}


