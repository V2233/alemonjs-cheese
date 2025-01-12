# Markdown 示例

## 二级标题

### 三级标题

- 无序列表1
- 无序列表2

1. 有序列表1
2. 有序列表2


### 代码块

```sh
yarn add alemon-plugin-cheese -W
```

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


### 表格

- ai预设

| 消息段     |   icqq    |   onebot   |   qqbot    |
| ---------- | :------:  |  :------:  | ---------- |
| [文本]     |    🟢     |     🟢     |    🟢     |
| [QQ表情]   |    🟢     |     🟢     |    🔴     |
| [图片]     |    🟢     |     🟢     |    🟢     |
| [语音]     |    🟢     |     🟢     |    🔴     |
| [视频]     |    🟢     |     🟢     |    🔴     |
| [@某人]    |    🟢     |     🟢     |    🟢     |
| [戳某人]   |    🟢     |     🟢     |    🔴     |
| [点赞]     |    🟢     |     🟢     |    🔴     |
| [html]     |    🟢     |     🟢     |    🟢     |
| [markdown] |    🟢     |     🟢     |    🟢     |
| [mermaid]  |    🟢     |     🟢     |    🟢     |
| [设置群名] |    🟢     |      🟢     |    🔴     |
| [设置群昵称]|   🟢     |      🟢     |    🔴     |
| [设置群头衔]|   🟢     |      🟢     |    🔴     |
| [禁言某人]  |   🟢     |      🟢     |    🔴     |
| [禁言全体]  |   🟢     |      🟢     |    🔴     |

### mermaid流程图

```mermaid
graph TD;
  A-->B;
  A-->C;
  B-->D;
  C-->D;


