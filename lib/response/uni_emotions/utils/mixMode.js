const mixMode = [
    {
        name: 'normal',
        desc: '默认',
        detail: '相当于没有混合'
    },
    {
        name: 'multiply',
        desc: '正片叠底',
        detail: '顶层颜色与底层颜色的各个分量相乘'
    },
    {
        name: 'screen',
        desc: '滤色',
        detail: '类似于两层幻灯片重叠，颜色通常比原色更亮'
    },
    {
        name: 'overlay',
        desc: '叠加',
        detail: '结合了正片叠底和滤色模式，可以增强对比度'
    },
    {
        name: 'darken',
        desc: '变暗',
        detail: '取顶层颜色与底层颜色中较暗的那个颜色作为结果颜色'
    },
    {
        name: 'lighten',
        desc: '变亮',
        detail: '取两层颜色中较亮的那个颜色作为结果颜色'
    },
    {
        name: 'color-dodge',
        desc: '颜色减淡',
        detail: '顶层颜色根据底层颜色的亮度调整自身亮度，使得结果颜色变亮'
    },
    {
        name: 'color-burn',
        desc: '颜色加深',
        detail: '顶层颜色根据底层颜色的亮度调整自身亮度，使得结果颜色变暗'
    },
    {
        name: 'hard-light',
        desc: '强光',
        detail: '作用于底层颜色，纯黑或纯白的顶层颜色会使底层颜色变暗或变亮。'
    },
    {
        name: 'soft-light',
        desc: '柔光',
        detail: '类似于强光，但效果更为柔和，产生类似半透明材料覆盖的效果'
    },
    {
        name: 'difference',
        desc: '差值',
        detail: '两层颜色近似时，结果近似为黑色；当两层颜色互补时，结果近似为白色'
    },
    {
        name: 'exclusion',
        desc: '排除',
        detail: '类似于差值，但产生的对比度较低'
    },
    {
        name: 'hue',
        desc: '色相',
        detail: '取顶层颜色的色相与底层颜色的饱和度和亮度，生成新的颜色'
    },
    {
        name: 'saturation',
        desc: '饱和度',
        detail: '取底层颜色的色相与亮度，以及顶层颜色的饱和度，生成新的颜色'
    },
    {
        name: 'color',
        desc: '颜色',
        detail: '取顶层颜色的色相与饱和度，以及底层颜色的亮度，生成新的颜色'
    },
    {
        name: 'luminosity',
        desc: '亮度/明度',
        detail: '取顶层颜色的亮度，与底层颜色的色相和饱和度结合，生成新的颜色'
    }
];

export { mixMode };
