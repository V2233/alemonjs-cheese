import React from 'react'
import { defineConfig } from 'jsxp'
import Word from '@src/image/conponent/help'
import LuckHistory from '@src/image/conponent/luck_history'
export default defineConfig({
  routes: {
    '/': {
      component: <Word data={'AlemonJS 跨平台开发框架'} />
    },
    '/his': {
      component: <LuckHistory data={
        {fortuneSummary: '465456',
        luckyStar: '####',
        signText: '',
        unSignText: '',
        starcolor: '',
        starCount: 5,
        avator: '',
        bgUrl: '',
        playerData: [{"luck":"中吉+财运","stars":4,"ts":1735795141633},{"luck":"中吉","stars":4,"ts":1735795342555}]
      }
    } />
    }
}
})
