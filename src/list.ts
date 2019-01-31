import Table from "tty-table";
import { TowerflowType } from "./interface";
import fs from 'fs';
import { parsePath } from "./helper/parse-path";

/**
 * create table header
 * @param name - table header name
 * @returns table header structure
 */
function createTableHeader(name: string) {
    return {
        /**
         * table header name
         */
        value: name,
        /**
         * table header color
         */
        headerColor: 'green',
        /**
         * table header text align
         */
        align: 'left'
    };
}

/**
 * table headers
 */
const tableHeaders = [
    createTableHeader('Name'),
    createTableHeader('Description'),
];

const tableStyle = {
    /**
     * table header text align
     */
    headerAlign: 'left'
};

/**
 * List command
 * @param ownPath - list command options
 */
export function list(options: {
    /**
     * towerflow own path
     */
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