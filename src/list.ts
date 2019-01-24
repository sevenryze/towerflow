import Table from "tty-table";
import { TowerflowType } from "./interface";
import fs from 'fs';
import { parsePath } from "./helper/parse-path";

/**
 * @typedef TableHeader
 * @property {string} value table header name
 * @property {string} headerColor table header color
 * @property {string} align table header text align
 */
/**
 * create table header
 * @param {string} name table header
 * @return {TableHeader}
 */
function createTableHeader(name: string) {
    return {
        value: name,
        headerColor: 'green',
        align: 'left'
    };
}

/**
 * @type {Array<TableHeader>} table headers
 */
const tableHeaders = [
    createTableHeader('Name'),
    createTableHeader('Description'),
];

/**
 * @typedef {TableStyle}
 * @property {string} headerAlign table header text align
 */
/**
 * @type {TableStyle} table style
 */
const tableStyle = {
    headerAlign: 'left' 
};

/**
 * @typedef ListOptions
 * @property {string} ownPath towerflow path
 */
/**
 * List commond
 * @param {ListOptions} options
 */
export function list(options: {
    ownPath: string
}) {
    const { ownPath } = options;
    const templateDir = fs.readdirSync(parsePath(ownPath, "template"));
    const templateTableRows = templateDir.map((name) => {
        switch (name) {
            case TowerflowType.nodeApp:
                return [name, "template of node app"];
            case TowerflowType.nodeLib:
                return [name, "template of node lib"];
            case TowerflowType.webApp:
                return [name, "template of react app"];
            case TowerflowType.webLib:
                return [name, "template of web lib"];
        }
    });
    const table = Table(tableHeaders, templateTableRows, [], tableStyle);
    console.log(table.render());
    process.exit(1);
}