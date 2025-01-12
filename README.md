# lemon插件

## 安装

alemonjs目录下安装依赖：

```sh
yarn add alemonjs-cheese -W
```

## 配置

alemon.config.yaml

```yaml
apps:
  - 'alemonjs-cheese'

gui:
  port: 9602

pm2:
  name: 'gui'
  script: 'node index.js --login gui'
```


## 功能

- 发送```奶酪帮助```查看
- 可快捷自定义UI主题，支持light|dark|自定义模式切换
- 今日运势本地升级版
- 看图识梗竞答
- 万能头像表情图制作
- 群聊人设AI：内置多种工具包，可根据群聊上下文发送各种消息类型或调用接