// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { TextEncoder } from "util";
import * as vscode from "vscode";
import { replaceVariables, isSandbox } from "./MarkdownUtil";
import { CodelensProvider } from "./CodelensProvider";

// extensions is activated whennever a markdown file is opened in the editor
export function activate(context: vscode.ExtensionContext) {
    const codelensProvider = new CodelensProvider();
    // Register the codelense provider
    vscode.languages.registerCodeLensProvider("*", codelensProvider);

    // Copy
    vscode.commands.registerCommand("markdown-copy-code.copycode", async (content: any) => {
            await vscode.env.clipboard.writeText(`${content}`);
            vscode.window.showInformationMessage(`Copy is successful.`);
        }
    );
    
    // Select
    vscode.commands.registerCommand("markdown-copy-code.selectcode", async (startLine: any, endLine: any) => {
        if (vscode.window.activeTextEditor?.selection != undefined){
            vscode.window.activeTextEditor.selection = new vscode.Selection(endLine, 0, startLine, 0);
        }
        // bypasses .selections (that must recive a [ ] of new Selection?) [endLin, endCol, startLin, startCol]
    });
    
    // Cut
    vscode.commands.registerCommand("markdown-copy-code.cutcode", async (startLine: any, endLine: any) => {
        if (vscode.window.activeTextEditor?.selection != undefined){
            vscode.window.activeTextEditor.selection = new vscode.Selection(endLine, 0, startLine, 0);
            vscode.commands.executeCommand("editor.action.clipboardCutAction")
        }
        // bypasses .selections (that must recive a [ ] of new Selection?) [endLin, endCol, startLin, startCol]
    });
    
    // Delete
    vscode.commands.registerCommand("markdown-copy-code.deletecode", async (startLine: any, endLine: any) => {
        if (vscode.window.activeTextEditor?.selection != undefined){
            vscode.window.activeTextEditor.selection = new vscode.Selection(endLine, 0, startLine, 0);
            vscode.commands.executeCommand("deleteRight")
        }
        // bypasses .selections (that must recive a [ ] of new Selection?) [endLin, endCol, startLin, startCol]
    });
    
    // Indent
    vscode.commands.registerCommand("markdown-copy-code.indentcode", async (startLine: any, endLine: any) => {
        if (vscode.window.activeTextEditor?.selection != undefined){
            vscode.window.activeTextEditor.selection = new vscode.Selection(endLine, 0, startLine, 0);
            vscode.commands.executeCommand("editor.action.indentLines")
        }
        // bypasses .selections (that must recive a [ ] of new Selection?) [endLin, endCol, startLin, startCol]
    });
    
    // Outdent
    vscode.commands.registerCommand("markdown-copy-code.outdentcode", async (startLine: any, endLine: any) => {
        if (vscode.window.activeTextEditor?.selection != undefined){
            vscode.window.activeTextEditor.selection = new vscode.Selection(endLine, 0, startLine, 0);
            vscode.commands.executeCommand("editor.action.outdentLines")
        }
        // bypasses .selections (that must recive a [ ] of new Selection?) [endLin, endCol, startLin, startCol]
    });
    
    // Run
    vscode.commands.registerCommand("markdown-copy-code.runcode", async (content: any, details: any) => {
            let terminal: any = vscode.window.activeTerminal;
            if (!terminal) {
                terminal = await vscode.window.createTerminal("Code Runner");
            }
            if (details.language === "apex" || details.language === "soql") {
                if (!details.org) {
                    vscode.window.showErrorMessage(
                        "Org is not passed, Please pass org like ```" +
                            details.language +
                            "|<sfdx-org-alias>"
                    );
                    return;
                }

                if (details.language === "apex") {
                    let typeOfOrg = context.globalState.get(
                        "markdown-enhanced-code-block-org-" + details.org
                    );
                    if (!typeOfOrg) {
                        const isOrgSandbox = await isSandbox(details.org);
                        if (isOrgSandbox) {
                            typeOfOrg = "Sandbox";
                        } else {
                            typeOfOrg = "Production";
                        }
                        context.globalState.update(
                            "markdown-enhanced-code-block-org-" + details.org,
                            typeOfOrg
                        );
                    }
                    if (typeOfOrg === "Production") {
                        let confirmation = await vscode.window.showInformationMessage(
                            "You are running this on production, are you sure?",
                            "Yes",
                            "No"
                        );
                        if (confirmation !== "Yes") {
                            return;
                        }
                    }
                }
            }
            terminal.show();
            if(vscode.workspace
                    .getConfiguration("markdown-enhanced-code-block")
                    .get("clearTerminalBeforeRun", true)){
                vscode.commands.executeCommand("workbench.action.terminal.clear");
            }
            terminal.sendText(`${content}`);
        }
    );
}

// This method is called when your extension is deactivated
export function deactivate() {}
