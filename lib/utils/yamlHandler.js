import { readFileSync, writeFileSync } from "fs";
import _ from "lodash";
import YAML from "yaml";

// src/utils/yamlHandler.ts
var YamlHandler = class {
	yamlPath;
	document;
	/**
	* 读写yaml文件
	*
	* @param yamlPath yaml文件绝对路径
	* @param isWatch 是否监听文件变化
	*/
	constructor(yamlPath) {
		this.yamlPath = yamlPath;
		this.initYaml();
	}
	initYaml() {
		try {
			this.document = YAML.parseDocument(readFileSync(this.yamlPath, "utf8"));
		} catch (error) {
			throw error;
		}
	}
	/**返回读取的对象 json格式*/
	get jsonData() {
		if (!this.document) return {};
		return this.document.toJSON();
	}
	has(keyPath) {
		return this.document.hasIn(keyPath.split("."));
	}
	get(keyPath) {
		return _.get(this.jsonData, keyPath);
	}
	set(keyPath, value) {
		this.document.setIn(keyPath.split("."), value);
	}
	delete(keyPath) {
		this.document.deleteIn(keyPath.split("."));
	}
	addIn(keyPath, value) {
		this.document.addIn(keyPath.split("."), value);
	}
	/**
	* 设置 document 的数据（递归式）
	* @param data 要写入的数据
	*/
	setData(data) {
		this.setDataRecursion(data, []);
	}
	setDataRecursion(data, parentKeys) {
		if (Array.isArray(data)) this.document.setIn(this.mapParentKeys(parentKeys), data);
		else if (typeof data === "object" && data !== null) for (const k in data) this.setDataRecursion(data[k], parentKeys.concat(k));
		else {
			parentKeys = this.mapParentKeys(parentKeys);
			this.document.setIn(parentKeys, data);
		}
	}
	mapParentKeys(parentKeys) {
		return parentKeys.map((k) => {
			if (typeof k == "number") k = String(k);
			if (k.startsWith("INTEGER__")) return Number.parseInt(k.replace("INTEGER__", ""));
			return k;
		});
	}
	deleteKey(keyPath) {
		let keys = keyPath.split(".");
		keys = this.mapParentKeys(keys);
		this.document.deleteIn(keys);
	}
	save(path) {
		if (!path) path = this.yamlPath;
		let yaml = this.document.toString();
		writeFileSync(path, yaml, "utf8");
	}
};

export { YamlHandler as default };