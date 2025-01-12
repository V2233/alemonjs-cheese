
interface ITheme {
    bgurl: string,
    mask_color: string,
    mask_opacity: number
    mask_degree: number
    width: string
    header_visible: boolean
    model: 'light' | 'dark' | 'custom'
    ratio: number
    compress: number
    quality: number
}

interface IAi {
    api_key: 'gpt-4o-mini' | 'gpt-3.5-turbo-0125' | 'gpt-3.5-turbo-1106' | 'gpt-3.5-turbo' | 'gpt-3.5-turbo-16k' | 'net-gpt-3.5-turbo' | 'whisper-1' | 'dall-e-2',
    model: string
    is_open: boolean
    prefix: string
    ctx_num: number
}

interface IMeme {
    interval: number,
    timeout: number
}

interface ICompositeImg {
    hybrid_mode: string
}

interface IHelp {
    default: any
    custom: any
}

interface IMermaid {
    use_theme: boolean
}

export interface ICfgKey {
    theme: ITheme,
    meme: IMeme,
    composite_img: ICompositeImg,
    ai: IAi,
    help: IHelp,
    mermaid: IMermaid
}