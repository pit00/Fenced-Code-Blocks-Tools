import * as vscode from "vscode";
import { getScriptToRunCode } from "./MarkdownUtil";

/**
 * Codelense provider which finds the code blocks in the markdown files
 * and provides commands to operate on those
 */
export class CodelensProvider implements vscode.CodeLensProvider {
    private codeLenses: vscode.CodeLens[] = [];
    private regex: RegExp;
    private _onDidChangeCodeLenses: vscode.EventEmitter<void> =
        new vscode.EventEmitter<void>();
    public readonly onDidChangeCodeLenses: vscode.Event<void> =
        this._onDidChangeCodeLenses.event;
    
    constructor() {
        // this.regex = /```([\s\S].[\s\S]*?[\s\S])```/g;
        this.regex = /```[ ][\s\S]*?```/g;
        vscode.workspace.onDidChangeConfiguration((_) => {
            this._onDidChangeCodeLenses.fire();
        });
    }
    
    /**
     * Provides the code lenses for markdown code blocks
     * @param document Current opened document
     * @param token Cancellation Taken
     * @returns vscode.CodeLens[] list of codelenses
     */
    public provideCodeLenses(
        document: vscode.TextDocument,
        token: vscode.CancellationToken
    ): vscode.CodeLens[] | Thenable<vscode.CodeLens[]> {
        const isMarkdownFile =
            vscode.window.activeTextEditor?.document.languageId === "markdown";
        if (isMarkdownFile) {
            this.codeLenses = [];
            const regex = new RegExp(this.regex);
            const text = document.getText();
            let matches;
            while ((matches = regex.exec(text)) !== null) {
                const reg = new RegExp(/(.+)/g);
                let content: string = matches[0];
                let codeLines = content.split("\n");
                codeLines.splice(0, 1);
                let code = codeLines.join("\n").replace(/`/g, "");
                code = code.slice(0, -1); // remove last \n
                
                const line = document.lineAt(document.positionAt(matches.index).line);
                const copyPosition = new vscode.Position(line.lineNumber, 0);
                const copyRange = document.getWordRangeAtPosition(copyPosition, new RegExp(reg));
                let startLine = line.lineNumber + 1 // starting line (0 indexed) from ```, so need add +1
                let endLine = startLine + codeLines.length - 2
                let endCol = 0;
                if(codeLines.length - 2 > 0){ // case null
                    endCol = codeLines[codeLines.length - 2].length; + 1
                }
                
                // Copy
                const copyCommand: vscode.Command = {
                    title: "📎",
                    command: "fenced.copy",
                    arguments: [code, false]
                };
                
                // Paste
                const pasteCommand: vscode.Command = {
                    title: "📋",
                    command: "fenced.paste",
                    arguments: [startLine, endLine, endCol, false]
                };
                
                // Select
                const selectCommand: vscode.Command = {
                    title: "🔦",
                    command: "fenced.select",
                    arguments: [startLine, endLine, endCol, false]
                };
                
                // Delete
                const deleteCommand: vscode.Command = {
                    title: "🗑️",
                    command: "fenced.delete",
                    arguments: [startLine, endLine, endCol, false]
                };
                
                // Indent
                const indentCommand: vscode.Command = {
                    title: "🔜",
                    command: "fenced.indent",
                    arguments: [startLine, endLine + 1, false]
                };
                
                // Outdent
                const outdentCommand: vscode.Command = {
                    title: "🔙",
                    command: "fenced.outdent",
                    arguments: [startLine, endLine + 1, false]
                };
                
                // Nest
                const nestCommand: vscode.Command = {
                    title: "🪹",
                    command: "fenced.nest",
                    arguments: [startLine, endLine + 1, false]
                };
                
                // Clone
                const cloneCommand: vscode.Command = {
                    title: "🐑",
                    command: "fenced.clone",
                    arguments: [startLine, endLine, endCol, false]
                };
                
                // Cut
                const cutCommand: vscode.Command = {
                    title: "✂️",
                    command: "fenced.cut",
                    arguments: [startLine, endLine, endCol, false]
                };
                
                // Remove
                const removeCommand: vscode.Command = {
                    title: "❌",
                    command: "fenced.remove",
                    arguments: [startLine, endLine, endCol, false]
                };
                
                // Counter
                const countCommand: vscode.Command = {
                    title: "🧮",
                    command: "fenced.count",
                    arguments: [startLine, endLine + 1, false]
                };
                
                // Terminal
                const runCommand: vscode.Command = {
                    title: "💲",
                    command: "fenced.run",
                    arguments: [startLine, endLine, endCol, false]
                };
                
                // Add Above Commands
                if(copyRange){
                    let tools : String = vscode.workspace.getConfiguration("fenced-code-blocks-tools").get("enableTools")!
                    for (let index = 0; index < tools.length; index++) {
                        if(tools[index] == "copy")
                            this.codeLenses.push(new vscode.CodeLens(copyRange, copyCommand));
                        if(tools[index] == "outdent")
                            this.codeLenses.push(new vscode.CodeLens(copyRange, outdentCommand));
                        if(tools[index] == "nest")
                            this.codeLenses.push(new vscode.CodeLens(copyRange, nestCommand));
                        if(tools[index] == "indent")
                            this.codeLenses.push(new vscode.CodeLens(copyRange, indentCommand));
                        if(tools[index] == "select")
                            this.codeLenses.push(new vscode.CodeLens(copyRange, selectCommand));
                        if(tools[index] == "paste")
                            this.codeLenses.push(new vscode.CodeLens(copyRange, pasteCommand)); // paste overwrite
                        // ? paste append / cursor pos
                        if(tools[index] == "clone")
                            this.codeLenses.push(new vscode.CodeLens(copyRange, cloneCommand));
                        if(tools[index] == "delete")
                            this.codeLenses.push(new vscode.CodeLens(copyRange, deleteCommand));
                        if(tools[index] == "cut")
                            this.codeLenses.push(new vscode.CodeLens(copyRange, cutCommand));
                        if(tools[index] == "remove")
                            this.codeLenses.push(new vscode.CodeLens(copyRange, removeCommand));
                        if(tools[index] == "count")
                            this.codeLenses.push(new vscode.CodeLens(copyRange, countCommand));
                        if(tools[index] == "run")
                            this.codeLenses.push(new vscode.CodeLens(copyRange, runCommand));
                    }
                }
                
                // Add Run Code Command
                // const runPosition = new vscode.Position(line.lineNumber, 5);
                // if (!vscode.workspace.getConfiguration("fenced-code-blocks-tools").get("disableRunButton", true)) {
                    // let codeConfigs = content.split("\n")[0].replace(/`/g, "");
                    // let details = {
                        // position: runPosition,
                        // language: codeConfigs.split("|")[0],
                        // org: ""
                    // }
                    
                    // if ((details.language === "apex" || details.language === "soql") && codeConfigs.split("|").length > 0) {
                        // details.org = codeConfigs.split("|")[1];
                    // }
                    
                    // if (details.language) {
                        // code = getScriptToRunCode(code, details);
                    // }
                    
                    // const runCommand: vscode.Command = {
                        // title: "💲",
                        // command: "fenced.runcode",
                        // arguments: [code, false]
                    // };
                    // // arguments: [code, details, false]
                    // const runRange = document.getWordRangeAtPosition(runPosition, new RegExp(reg));
                    // if (runRange) {
                        // this.codeLenses.push(new vscode.CodeLens(runRange, runCommand));
                    // }
                // }
                
                // Add Replace Variables Command
                // if (content.indexOf("#") !== -1 && content.indexOf("=") !== -1) {
                    // const replacePosition = new vscode.Position(line.lineNumber, 8);
                    // const replaceCommand: vscode.Command = {
                        // title: "Replace Variables",
                        // command: "fenced.replace-variables",
                        // arguments: [content, runPosition, false],
                    // };
                    // const replaceRanage = document.getWordRangeAtPosition(
                        // replacePosition,
                        // new RegExp(reg)
                    // );
                    // if (replaceRanage) {
                        // // this.codeLenses.push(new vscode.CodeLens(replaceRanage, replaceCommand));
                    // }
                // }
            }
            return this.codeLenses;
        }
        return [];
    }
}
