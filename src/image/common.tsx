import React from "react";
import Cfg from "@src/utils/config";
import { LinkStyleSheet } from "jsxp";
import { botInfo, pluginInfo } from "@src/package";
import { hexToRgb } from "@src/utils";

interface IContainerProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
  copyright?: string;
}
export function Container({ children, style, copyright }: IContainerProps) {
  const cfg = Cfg.getConfig("theme");
  const stl = {
    // backgroundImage: cfg.model === 'custom' ? `url(${cfg.bgurl})` : undefined,
    color: cfg.model === "dark" ? "white" : "black",
    backgroundColor:
      cfg.model === "custom"
        ? undefined
        : cfg.model === "dark"
          ? "black"
          : "white",
    ...style,
  };
  Object.keys(stl).forEach((k) => {
    if (stl[k] == undefined) delete stl[k];
  });
  return (
    <div className="container" id="container" style={stl}>
      {children}
      <Copyright text={copyright} />
    </div>
  );
}

interface IHeaderBoxProps {
  title: string;
  description?: string;
  avatar?: string;
  type?: 0 | 1;
  style?: React.CSSProperties;
  titleStyle?: React.CSSProperties;
  children?: React.ReactNode;
}

export function HeaderBox(data: IHeaderBoxProps) {
  const cfg = Cfg.getConfig("theme");
  const style = {
    borderRadius: data.avatar ? "15px 35px 35px 15px" : undefined,
    background:
      cfg.model == "dark"
        ? "rgba(0, 0, 0, 0.2)"
        : `rgba(255, 255, 255, ${cfg.mask_opacity})`,
    boxShadow:
      cfg.model == "dark"
        ? "1px 1px 3px 1px rgba(245, 246, 251, 1)"
        : "0 5px 10px 0 rgba(0, 0, 0, 0.3)",
    ...data.style,
  };
  Object.keys(style).forEach((k) => {
    if (style[k] == undefined) delete style[k];
  });
  if (!cfg.header_visible) {
    return null;
  }
  return (
    cfg.header_visible && (
      <div className="head_box" style={style}>
        <div className="id_text" style={data.titleStyle}>
          {data.title}
        </div>
        {data.description && <div className="day_text">{data.description}</div>}
        {data.avatar && (
          <div className="avator_box">
            <img className="user_avator" src={data.avatar} />
          </div>
        )}
        {data.children && data.children}
      </div>
    )
  );
}

export function DataBox({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  const cfg = Cfg.getConfig("theme");
  return (
    <div
      className="data_box"
      style={{
        boxShadow:
          cfg.model == "dark"
            ? "1px 1px 3px 1px rgb(245 246 251 / 100%)"
            : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function Item({
  children,
  color,
  classname,
  style,
}: {
  children: React.ReactNode;
  color?: string;
  classname: "item" | "itemOne";
  style?: React.CSSProperties;
}) {
  const cfg = Cfg.getConfig("theme");
  const graColor = cfg.model == "dark" ? "black" : "white";
  return (
    <div
      className={classname}
      style={{
        backgroundImage:
          cfg.model == "custom"
            ? `linear-gradient(${cfg.mask_degree || 90}deg, rgba(255, 255, 255, ${cfg.mask_opacity}), rgba(255, 255, 255, ${cfg.mask_opacity})), linear-gradient(${cfg.mask_degree || 90}deg, ${hexToRgb(color ? color : cfg.mask_color, cfg.mask_opacity)}, rgba(194, 194, 194, ${cfg.mask_opacity}))`
            : `linear-gradient(${cfg.mask_degree || 90}deg, ${graColor}, ${graColor}), linear-gradient(${cfg.mask_degree || 90}deg, ${hexToRgb(color ? color : cfg.mask_color, 1)}, rgba(194, 194, 194, 1))`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function TabLable({ text }: { text: string }) {
  const cfg = Cfg.getConfig("theme");
  return (
    <div
      className="tab_lable"
      style={{
        background:
          cfg.model == "dark"
            ? "transparent"
            : `linear-gradient(90deg, ${hexToRgb(cfg.mask_color, cfg.mask_opacity)}, ${hexToRgb(cfg.mask_color, cfg.mask_opacity)})`,
        color: cfg.model == "dark" ? "white" : "black",
        boxShadow:
          cfg.model == "dark"
            ? `-1px -1px 1.5px 1.5px ${hexToRgb(cfg.mask_color)}`
            : undefined,
      }}
    >
      {text}
    </div>
  );
}

export function PageLable({ text }: { text: string }) {
  const cfg = Cfg.getConfig("theme");
  return (
    <div
      className="page_lable"
      style={{
        background: `linear-gradient(90deg, ${hexToRgb(cfg.mask_color, cfg.mask_opacity)}, rgba(194, 194, 194, ${cfg.mask_opacity}))`,
      }}
    >
      {text}
    </div>
  );
}

export function Copyright({ text }: { text?: string }) {
  const cfg = Cfg.getConfig("theme");
  return (
    <div className="logo" style={{ color: "#" + cfg.mask_color }}>
      {text
        ? text
        : `${botInfo.BOT_NAME} ${botInfo.BOT_VERSION} & ${pluginInfo.PLUGIN_NAME} ${pluginInfo.PLUGIN_VERSION}`}
    </div>
  );
}

interface ITemplate {
  styleSheet: Array<string>;
  children: React.ReactNode;
  theme?: string;
  globalStyle?: React.ReactNode;
  bodyStyle?: React.CSSProperties;
}

export function Template(data: ITemplate): JSX.Element {
  const cfg = Cfg.getConfig("theme");

  return (
    <html lang="zh-CN" id="__alemonjs">
      <head>
        <meta charSet="UTF-8" />
        <meta httpEquiv="content-type" content="text/html;charset=utf-8" />
        <meta name="referrer" content="no-referrer" />
        {data.styleSheet.map((style) => (
          <LinkStyleSheet src={style} key={style} />
        ))}
        {data.globalStyle && data.globalStyle}
      </head>
      <body
        id="root"
        style={{
          width: cfg.width,
          transform: `scale(${cfg.ratio})`,
          ...data.bodyStyle,
        }}
      >
        {cfg.model === "custom" && (
          <img
            className="w-full h-full absolute"
            src={cfg.bgurl}
            style={{ zIndex: "-10" }}
          />
        )}
        {data.children}
      </body>
    </html>
  );
}
