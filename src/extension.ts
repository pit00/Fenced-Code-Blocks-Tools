// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
// import { TextEncoder } from "util";
import * as vscode from "vscode";
// import { replaceVariables, isSandbox } from "./MarkdownUtil";
import { CodelensProvider } from "./CodelensProvider";

// extensions is activated whennever a markdown file is opened in the editor
export function activate(context: vscode.ExtensionContext) {
    const codelensProvider = new CodelensProvider();
    // Register the codelense provider
    vscode.languages.registerCodeLensProvider("*", codelensProvider);

    // Copy 📎
    vscode.commands.registerCommand("fenced.copy", async (content: any) => {
            await vscode.env.clipboard.writeText(`${content}`);
            vscode.window.showInformationMessage(`Copy is successful.`);
        }
    );
    
    // Paste 📋
    vscode.commands.registerCommand("fenced.paste", async (startLine: any, endLine: any, endCol: any) => {
        if (vscode.window.activeTextEditor?.selection != undefined){
            if(startLine - endLine == 1){
                vscode.window.activeTextEditor.selection = new vscode.Selection(startLine - 1, 0, startLine - 1, 0);
                vscode.commands.executeCommand("editor.action.insertLineAfter")
            }
            else if(startLine - endLine == 0){
                vscode.window.activeTextEditor.selection = new vscode.Selection(endLine + 1, 0, startLine, 0); // endCol is 0 anyway
                vscode.commands.executeCommand("deleteRight")
                vscode.commands.executeCommand("editor.action.insertLineBefore")
            }
            else {
                vscode.window.activeTextEditor.selection = new vscode.Selection(endLine, endCol, startLine, 0);
            }
            vscode.commands.executeCommand("pasteAndIndent.action")
        }
    });
    
    // Select 🔦
    vscode.commands.registerCommand("fenced.select", async (startLine: any, endLine: any, endCol: any) => {
        if (vscode.window.activeTextEditor?.selection != undefined){
            vscode.window.activeTextEditor.selection = new vscode.Selection(endLine, endCol, startLine, 0);
        }
        // bypasses .selections (that must recive a [ ] of new Selection?) [endLine, endCol, startLine, startCol]
    });
    
    // Cursor 🐀
    vscode.commands.registerCommand("fenced.cursor", async (startLine: any, endLine: any, endCol: any) => {
        if (vscode.window.activeTextEditor?.selection != undefined){
            vscode.window.activeTextEditor.selection = new vscode.Selection(endLine, endCol, startLine, 0);
            vscode.commands.executeCommand("editor.action.insertCursorAtEndOfEachLineSelected"),
            vscode.commands.executeCommand("custom.homer")
        }
    });
    
    // Delete 🗑️
    vscode.commands.registerCommand("fenced.delete", async (startLine: any, endLine: any, endCol: any) => {
        if (vscode.window.activeTextEditor?.selection != undefined){
            vscode.window.activeTextEditor.selection = new vscode.Selection(endLine, endCol, startLine, 0);
            vscode.commands.executeCommand("deleteRight")
        }
    });
    
    // Count 🧮
    vscode.commands.registerCommand("fenced.count", async (startLine: any, endLine: any) => {
        let diff = endLine - startLine
        let out = diff.toString();
        // out = out.replace(/0/g, '0️⃣').replace(/1/g, '1️⃣').replace(/2/g, '2️⃣').replace(/3/g, '3️⃣').replace(/4/g, '4️⃣').replace(/5/g, '5️⃣').replace(/6/g, '6️⃣').replace(/7/g, '7️⃣').replace(/8/g, '8️⃣').replace(/9/g, '9️⃣');
        out = out.replace(/0/g, '⓿').replace(/1/g, '❶').replace(/2/g, '❷').replace(/3/g, '❸').replace(/4/g, '❹').replace(/5/g, '❺').replace(/6/g, '❻').replace(/7/g, '❼').replace(/8/g, '❽').replace(/9/g, '❾');
        vscode.window.showInformationMessage(out)
    });
    
    // Indent 🔜
    vscode.commands.registerCommand("fenced.indent", async (startLine: any, endLine: any) => {
        if (vscode.window.activeTextEditor?.selection != undefined){
            vscode.window.activeTextEditor.selection = new vscode.Selection(endLine, 0, startLine, 0);
            vscode.commands.executeCommand("editor.action.indentLines")
            vscode.commands.executeCommand("cursorLineEnd")
        }
    });
    
    // Outdent 🔙
    vscode.commands.registerCommand("fenced.outdent", async (startLine: any, endLine: any) => {
        if (vscode.window.activeTextEditor?.selection != undefined){
            vscode.window.activeTextEditor.selection = new vscode.Selection(endLine, 0, startLine, 0);
            vscode.commands.executeCommand("editor.action.outdentLines")
            vscode.commands.executeCommand("cursorLineEnd")
        }
    });
    
    // Nest 🪹
    vscode.commands.registerCommand("fenced.nest", async (startLine: any, endLine: any) => {
        if (vscode.window.activeTextEditor?.selection != undefined){
            vscode.window.activeTextEditor.selection = new vscode.Selection(endLine, 0, startLine, 0);
            vscode.commands.executeCommand("custom.IndentEmpty")
            vscode.commands.executeCommand("cancelSelection")
        }
    });
    
    // Clone 🐑
    vscode.commands.registerCommand("fenced.clone", async (startLine: any, endLine: any) => {
        if (vscode.window.activeTextEditor?.selection != undefined){
            vscode.window.activeTextEditor.selection = new vscode.Selection(endLine + 1, 3, startLine - 2, 0); // get above \n
            vscode.commands.executeCommand("editor.action.copyLinesDownAction")
            vscode.commands.executeCommand("cancelSelection")
        }
    });
    
    // Cut ✂️
    vscode.commands.registerCommand("fenced.cut", async (startLine: any, endLine: any, endCol: any) => {
        if (vscode.window.activeTextEditor?.selection != undefined){
            // vscode.window.activeTextEditor.selection = new vscode.Selection(endLine, endCol, startLine, 0);
            vscode.window.activeTextEditor.selection = new vscode.Selection(endLine + 2, 3, startLine - 2, 0); // remove surroundings
            vscode.commands.executeCommand("editor.action.clipboardCutAction")
        }
    });
    
    // Remove ❌
    vscode.commands.registerCommand("fenced.remove", async (startLine: any, endLine: any) => {
        if (vscode.window.activeTextEditor?.selection != undefined){
            vscode.window.activeTextEditor.selection = new vscode.Selection(endLine + 2, 3, startLine - 2, 0); // remove surroundings
            vscode.commands.executeCommand("deleteRight")
        }
    });
    
    // Run 💲
    vscode.commands.registerCommand("fenced.run", async (startLine: any, endLine: any, endCol: any) => {
        if (vscode.window.activeTextEditor?.selection != undefined){
            vscode.window.activeTextEditor.selection = new vscode.Selection(startLine, 0, endLine, endCol);
            // ⠐TIP⠂ anchorLine, anchorCharacter, activeLine, activeCharacter
            vscode.commands.executeCommand("extension.sendToTerminalPlus")
            vscode.commands.executeCommand("cursorUndo")
            // vscode.commands.executeCommand("cursorLineEnd")
        }
    });
    
    // Run Key 💲
    vscode.commands.registerCommand("fenced.runNear", async () => {
            // if (vscode.window.activeTextEditor?.selection != undefined){
                // vscode.window.activeTextEditor.selection = new vscode.Selection(0, 0, 1, 1);
                // vscode.commands.executeCommand("extension.sendToTerminalPlus")
                // vscode.commands.executeCommand("cursorLineEnd")
            // }
        
            // document: vscode.TextDocument
            // const text = vscode.TextEditor.document.getText();
            // const text = document.getText();
            // let text = editor?.getText();
        
            // let editor = vscode.window.activeTextEditor;
            // var text = editor?.document.getText();
        let full = vscode.window.activeTextEditor?.document.getText();
        let runRegex = /(^\`\`\` .*$)|(^\`\`\`$)/gm
        
        let matchedLines = full!.split(/^/gm).map((v, i) => v.match(runRegex) ? i + 1 : 0).filter(a => a);
        
        if(matchedLines.length % 2 != 0){
            vscode.window.showErrorMessage("Malformed Fences!");
        }
        else{
            let cusorPos = vscode.window.activeTextEditor!.selection.active.line + 1;
            
            let closest = matchedLines.reduce(function(prev, curr) {
                return (Math.abs(curr - cusorPos!) < Math.abs(prev - cusorPos!) ? curr : prev);
            });
            
            let matchIndex = matchedLines.indexOf(closest);
            
            if(matchIndex % 2 == 0){ // even
                let evenStart = closest;
                let evenEnd = matchedLines[matchIndex + 1] - 1
                if(evenStart == evenEnd){
                    vscode.window.showWarningMessage("Nearest fence is null!");
                }
                else{
                    vscode.window.activeTextEditor!.selection = new vscode.Selection(evenStart, 0, evenEnd, 0)
                    vscode.commands.executeCommand("extension.sendToTerminalPlus")
                    vscode.commands.executeCommand("cursorUndo")
                }
            }
            else{ // odd
                let oddStart = matchedLines[matchIndex - 1];
                let oddEnd = closest - 1
                if(oddStart == oddEnd){
                    vscode.window.showWarningMessage("Nearest fence is null!");
                }
                else{
                    vscode.window.activeTextEditor!.selection = new vscode.Selection(oddStart, 0, oddEnd, 0)
                    vscode.commands.executeCommand("extension.sendToTerminalPlus")
                    vscode.commands.executeCommand("cursorUndo")
                }
            }
        }
    });
    
    // "fenced-code-blocks-tools.clearTerminalBeforeRun": {
    //     "type": "boolean",
    //     "default": false,
    //     "description": "Clear terminal before run"
    // },
    // vscode.commands.registerCommand("fenced.runcode", async (content: any, details: any) => {
            // let terminal: any = vscode.window.activeTerminal;
            // if (!terminal) {
                // terminal = await vscode.window.createTerminal("Code Runner");
            // }
            // // if (details.language === "apex" || details.language === "soql") {
                // // if (!details.org) {
                    // // vscode.window.showErrorMessage(
                        // // "Org is not passed, Please pass org like ```" +
                            // // details.language +
                            // // "|<sfdx-org-alias>"
                    // // );
                    // // return;
                // // }
                // // if (details.language === "apex") {
                    // // let typeOfOrg = context.globalState.get(
                        // // "fenced-code-blocks-tools-org-" + details.org
                    // // );
                    // // if (!typeOfOrg) {
                        // // const isOrgSandbox = await isSandbox(details.org);
                        // // if (isOrgSandbox) {
                            // // typeOfOrg = "Sandbox";
                        // // } else {
                            // // typeOfOrg = "Production";
                        // // }
                        // // context.globalState.update(
                            // // "fenced-code-blocks-tools-org-" + details.org,
                            // // typeOfOrg
                        // // );
                    // // }
                    // // if (typeOfOrg === "Production") {
                        // // let confirmation = await vscode.window.showInformationMessage(
                            // // "You are running this on production, are you sure?",
                            // // "Yes",
                            // // "No"
                        // // );
                        // // if (confirmation !== "Yes") {
                            // // return;
                        // // }
                    // // }
                // // }
            // // }
            // terminal.show();
            // if(vscode.workspace.getConfiguration("fenced-code-blocks-tools").get("clearTerminalBeforeRun", true)){
                // vscode.commands.executeCommand("workbench.action.terminal.clear");
            // }
            // terminal.sendText(`${content}`);
        // }
    // );
}

// This method is called when your extension is deactivated
export function deactivate() {}
