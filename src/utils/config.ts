import YAML from 'yaml'
import chokidar from 'chokidar'
import { join } from 'node:path'
import { pluginInfo, botInfo } from '../package'
import yamlHandler from './yamlHandler'
import type { ICfgKey } from '@src/types/config'
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync
} from 'node:fs'

const { ROOT_PATH } = pluginInfo
const { WORK_PATH } = botInfo

/**
 * ********
 * 配置文件
 * ********
 */
class Cfg {
  /**
   * 
   */
  config = {}

  /**
   * 监听文件
   */
  watcher = { config: {}, defSet: {} }

  constructor() {
    this.mergeYamlFile()
    // console.log(this.config)
  }

  /**
   * 设置描述
   */
  get description() {
    const cfgMap: ICfgKey = {
      'theme': this.getConfig('theme'),
      'ai': this.getConfig('ai'),
      'meme': this.getConfig('meme'),
      'composite_img': this.getConfig('composite_img'),
      'help': this.getConfig('help'),
      'mermaid': this.getConfig('mermaid')
    }

    return [
      {
        key: 'theme',
        title: '主题设置',
        value: [
          {
            prop: 'bgurl',
            title: '背景图片',
            desc: '网络地址或本地绝对路径',
            value: cfgMap['theme']['bgurl'],
            component: 'text'
          },
          {
            prop: 'mask_color',
            title: '蒙版颜色',
            desc: '仅支持十六进制颜色，不要带#号',
            value: cfgMap['theme']['mask_color'],
            component: 'text'
          },
          {
            prop: 'mask_degree',
            title: '蒙版渐变角度',
            desc: '蒙版颜色渐变角度(0-360)',
            value: cfgMap['theme']['mask_degree'],
            component: 'number'
          },
          {
            prop: 'mask_opacity',
            title: '蒙版透明度',
            desc: '优先级高于十六进制色透明度',
            value: cfgMap['theme']['mask_opacity'],
            component: 'text'
          },
          {
            prop: 'model',
            title: '主题模式',
            desc: 'light|dark|custom,仅custom时前三个设置有效',
            value: cfgMap['theme']['model'],
            component: 'select',
            children: ['light', 'dark', 'custom']
          },
          {
            prop: 'header_visible',
            title: '标题栏可见',
            desc: '后加true或false如 奶酪设置标题栏可见false',
            value: cfgMap['theme']['header_visible'],
            component: 'switch'
          },
          {
            prop: 'width',
            title: '图片宽度',
            desc: '范围480px-768px，非必要请勿更改',
            value: cfgMap['theme']['width'],
            component: 'text'
          },
          {
            prop: 'ratio',
            title: '图片缩放',
            desc: 'css的scale属性，改变渲染分辨率，适合提高清晰度',
            value: cfgMap['theme']['ratio'],
            component: 'number'
          },
          {
            prop: 'compress',
            title: '图片压缩',
            desc: '单位kB,改变生成分辨率，为0表示不压缩，可节省网络开销',
            value: cfgMap['theme']['compress'],
            component: 'number'
          },
          {
            prop: 'quality',
            title: '图片质量',
            desc: '数值(0-100)，不改变生成分辨率，低于100会转jpeg有损压缩',
            value: cfgMap['theme']['quality'],
            component: 'number'
          },
        ],
      },
      {
        key: 'ai',
        title: 'AI设置',
        value: [
          {
            prop: 'is_open',
            title: 'ai开启',
            desc: '后面加true或false如 奶酪设置ai开启true',
            value: cfgMap['ai']['is_open'],
            component: 'switch'
          },
          {
            prop: 'prefix',
            title: 'ai前缀',
            desc: '默认为空，被@就会回复，可设置前缀触发',
            value: cfgMap['ai']['prefix'],
            component: 'text'
          },
          {
            prop: 'ctx_num',
            title: 'ai对话上限',
            desc: '让ai知道群消息的前多少次对话',
            value: cfgMap['ai']['ctx_num'],
            component: 'number'
          },
          {
            prop: 'model',
            title: 'ai模型',
            desc: '详情查看chatgpt官网',
            value: cfgMap['ai']['model'],
            component: 'text'
          },
          {
            prop: 'api_key',
            title: 'openaikey',
            desc: '发送 奶酪获取openaikey 可领取免费key',
            value: cfgMap['ai']['api_key'],
            component: 'text'
          }
        ],
      },
      {
        key: 'meme',
        title: '看图识梗',
        value: [
          {
            prop: 'timeout',
            title: '发起超时',
            desc: '多少秒后自动结束上下文',
            value: cfgMap['meme']['timeout'],
            component: 'number'
          },
          {
            prop: 'interval',
            title: '识梗间隔',
            desc: '每两题间隔多少秒',
            value: cfgMap['meme']['interval'],
            component: 'number'
          }
        ],
      },
      // {
      //   key: 'composite_img',
      //   title: '合成头像',
      //   value: [
      //     {
      //       prop: 'hybrid_mode',
      //       title: '混合模式',
      //       desc: '发送混合模式查看',
      //       value: cfgMap['composite_img']['hybrid_mode']
      //     },
      //   ],
      // },
      {
        key: 'mermaid',
        title: '流程图',
        value: [
          {
            prop: 'use_theme',
            title: '流程图背景开启',
            desc: '是否使用主题背景，跟true或false',
            value: cfgMap['mermaid']['use_theme'],
            component: 'switch'
          },
        ],
      },
    ]
  }

  /**
   * 得到默认配置
   * @param name 配置文件名称
   * @returns 
   */
  getdefSet(name: string) {
    return this.getYaml('default_config', name)
  }

  /**
   * 得到默认配置
   * @param name 配置文件名称
   * @returns 
   */
  getBotdefSet(name: string) {
    return this.getYaml('default_config', name, WORK_PATH)
  }

  /**
   * 得到生成式配置
   * @param name 
   * @returns 
   */
  getConfig<T extends keyof ICfgKey>(name: T): ICfgKey[T] {
    return this.getYaml('config', name)
  }

  /**
   * 得到合并配置
   * @param name 
   * @returns 
   */
  getMergedConfig(name: string) {
    let config = this.getYaml('config', name)
    let def = this.getYaml('default_config', name)
    return { ...def, ...config }
  }

  /**
   * 得到机器人配置
   * @param name 
   * @returns 
   */
  getBotConfig(name: string) {
    return this.getYaml('config', name, WORK_PATH)
  }

  /**
   * 快速修改配置
   * @param data 要设置的数据
   * @param parentKeys 键的路径，数组格式分隔
   * @param name 文件名
   * @returns 
   */
  setConfig(data: any, parentKeys: any[], name: string) {
    this.setYaml('config', name, data, parentKeys)
  }

  /**
   * 获取配置yaml
   * @param type 默认跑配置-defSet，用户配置-config
   * @param name 名称
   */
  getYaml(type: string, name: string, path: string = ROOT_PATH) {
    try {
      const file = join(path, `config/${type}/${name}.yaml`)
      const key = `${type}.${name}`
      if (this.config[key]) return this.config[key]
      this.config[key] = YAML.parse(
        readFileSync(file, 'utf8')
      )
      this.watch(file, name, type)
      return this.config[key]
    } catch (err) {
      return undefined
    }
  }

  /**
   * 修改配置yaml
   * @param type 默认跑配置-defSet，用户配置-config
   * @param name 名称
   */
  setYaml(type: string, name: string, data: any, parentKeys: any[]) {
    const file = join(ROOT_PATH, `config/${type}/${name}.yaml`)
    let doc = new yamlHandler(file)
    doc.setDataRecursion(data, parentKeys)
    doc.save()
    this.watch(file, name, type)
  }

  /**
     * 批量修改配置yaml
     * @param type 默认跑配置-defSet，用户配置-config
     * @param name 名称
     */
  setYamlAll(name, data, type = 'config') {
    const file = join(ROOT_PATH, `config/${type}/${name}.yaml`);
    let doc = new yamlHandler(file);
    Object.keys(data).forEach(key => {
      doc.set(key, data[key])
    })
    doc.save();
    this.watch(file, name, type);
  }
  
  /**
   * 合并带有注释项的配置,初始化配置
   * @param name 
   * @returns 
   */
  mergeYamlFile() {
    const path = join(ROOT_PATH, 'config', 'config')
    const pathDef = join(ROOT_PATH, 'config', 'default_config')

    if (!existsSync(path)) {
      mkdirSync(path, {
        recursive: true
      })
    }

    // 得到文件
    const files = readdirSync(pathDef).filter(file => file.endsWith('.yaml'))

    for (const file of files) {
      const cfgFile = join(path, file)
      const cfgFileDef = join(pathDef, file)

      if (!existsSync(cfgFile)) {
        copyFileSync(cfgFileDef, cfgFile)
      } else {
        // 获取用户配置
        const cfg = this.getConfig(file.replace('.yaml', '').replace(/.*\\|.*\//g, '') as keyof ICfgKey)

        // 创建默认Yaml实例
        const doc = new yamlHandler(cfgFileDef)
        const defCfg = doc.jsonData
        const cfgKeys = Object.keys(cfg)
        // 更改写入路径文件
        doc.yamlPath = cfgFile

        // 删掉废弃的属性
        cfgKeys.forEach(key => {
          if (!defCfg.hasOwnProperty(key)) {
            delete cfg[key]
          }
        })

        // 合并一层配置，不适用于层级较深的对象或数组
        Object.entries(defCfg).forEach(([key, value]) => {
          if (key in cfg) {
            if (value instanceof Object) {
              // 合并子对象
              doc.set(key, Object.assign(value, cfg[key]))
            } else {
              doc.set(key, cfg[key])
            }
          } else {
            doc.set(key, value)
          }
        })
        if (file == 'help') {
          doc.set('default', defCfg['default'])
        }
        doc.save(cfgFile)
      }
    }
  }

  /**
   * 监听配置文件
   * @param file 
   * @param name 
   * @param type 
   * @returns 
   */
  watch(file: string, name: string, type = 'default_config') {
    const key = `${type}.${name}`
    if (this.watcher[key]) return
    const watcher = chokidar.watch(file)
    watcher.on('change', () => {
      this.config[key] = YAML.parse(
        readFileSync(file, 'utf8')
      )
      logger.mark(`[${pluginInfo.PLUGIN_NAME}][读取|修改配置文件][${name}]`)
    })
    this.watcher[key] = watcher
  }

}

/**
 * **********
 * 
 * ***
 */
export default new Cfg()