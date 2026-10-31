import * as vscode from "vscode";
// import { getScriptToRunCode } from "./MarkdownUtil";

// Codelense provider which finds the code blocks in the markdown files and provides commands to operate on those
export class CodelensProvider implements vscode.CodeLensProvider {
    private codeLenses: vscode.CodeLens[] = [];
    private regex: RegExp;
    // private itex: RegExp;
    private _onDidChangeCodeLenses: vscode.EventEmitter<void> = new vscode.EventEmitter<void>();
    public readonly onDidChangeCodeLenses: vscode.Event<void> = this._onDidChangeCodeLenses.event;
    
    constructor() {
        // this.regex = /```[ ][\s\S]*?```/g;
        this.regex = /^```[^!\n]+\n([^]*?)```$/gm;
        vscode.workspace.onDidChangeConfiguration((_) => {
            this._onDidChangeCodeLenses.fire();
        });
    }
    
    /** Provides the code lenses for markdown code blocks
        * @param document Current opened document
        * @returns vscode.CodeLens[] list of codelenses
    */
    public provideCodeLenses(
        document: vscode.TextDocument,
    ): vscode.CodeLens[] | Thenable<vscode.CodeLens[]> {
        const isMarkdownFile = vscode.window.activeTextEditor?.document.languageId === "markdown";
        if (isMarkdownFile) {
            this.codeLenses = [];
            
            const text = document.getText();
            let matches;
            
            // Tools fence lens loop
            const regex = new RegExp(this.regex);
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
                
                // Cursor
                const cursorCommand: vscode.Command = {
                    title: "🐀",
                    command: "fenced.cursor",
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
                    arguments: [startLine, endLine, false]
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
                
                // Lines
                const total = code.split(/\r?\n/).length;
                const linesCommand: vscode.Command = {
                    title: `⠀Lines: ${total}`,
                    command: ""
                };
                
                // Add Above Commands
                if(copyRange){
                    let tools : String = vscode.workspace.getConfiguration("fenced-code-blocks-tools").get("enableTools")!
                    for (const tool of tools) {
                        switch (tool) {
                            case "copy":
                                this.codeLenses.push(new vscode.CodeLens(copyRange, copyCommand));
                                break;
                            case "outdent":
                                this.codeLenses.push(new vscode.CodeLens(copyRange, outdentCommand));
                                break;
                            case "nest":
                                this.codeLenses.push(new vscode.CodeLens(copyRange, nestCommand));
                                break;
                            case "indent":
                                this.codeLenses.push(new vscode.CodeLens(copyRange, indentCommand));
                                break;
                            case "select":
                                this.codeLenses.push(new vscode.CodeLens(copyRange, selectCommand));
                                break;
                            case "cursor":
                                this.codeLenses.push(new vscode.CodeLens(copyRange, cursorCommand));
                                break;
                            case "paste":
                                this.codeLenses.push(new vscode.CodeLens(copyRange, pasteCommand)); // paste overwrite
                                break;
                            case "clone":
                                this.codeLenses.push(new vscode.CodeLens(copyRange, cloneCommand));
                                break;
                            case "delete":
                                this.codeLenses.push(new vscode.CodeLens(copyRange, deleteCommand));
                                break;
                            case "cut":
                                this.codeLenses.push(new vscode.CodeLens(copyRange, cutCommand));
                                break;
                            case "remove":
                                this.codeLenses.push(new vscode.CodeLens(copyRange, removeCommand));
                                break;
                            case "count":
                                this.codeLenses.push(new vscode.CodeLens(copyRange, countCommand));
                                break;
                            case "run":
                                this.codeLenses.push(new vscode.CodeLens(copyRange, runCommand));
                                break;
                            case "lines":
                                this.codeLenses.push(new vscode.CodeLens(copyRange, linesCommand));
                                break;
                            // ? paste append / cursor pos
                        }
                    }
                }
            }
            
            return this.codeLenses;
        }
        return [];
    }
}
